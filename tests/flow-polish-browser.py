"""Focused acceptance for Flow's visual discovery and mobile workflows.

Uses only the bundled historical snapshot. Provider transport is blocked and no
market observations, planner data or credentials are supplied by this test.
Run with FLOW_TEST_URL pointing to Vite or its production preview.
"""
import json
import os
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get('FLOW_TEST_URL', 'http://127.0.0.1:4173').rstrip('/')
ARTIFACTS = Path(os.environ.get('FLOW_TEST_ARTIFACTS', '/workspace/scratch/flow-polish/after'))
ARTIFACTS.mkdir(parents=True, exist_ok=True)
MODES = ['Market Overview', 'City Analysis', 'Industry Deep Dive', 'Market Intelligence', 'Case Studies', 'Data Visualization']
COUNTRIES = ['thailand', 'singapore', 'malaysia', 'indonesia', 'philippines', 'vietnam']
ERRORS, EXTERNAL, RESULTS = [], [], []


def selection(page):
    return set(page.evaluate('JSON.parse(localStorage.getItem("flow-market-shortlist-v1")).countries'))


def fits_horizontally(locator):
    assert locator.evaluate('(node) => node.scrollWidth <= node.clientWidth + 1'), 'Navigation overflows horizontally'
    for item in locator.locator('button:visible, a:visible').all():
        assert item.evaluate('(node) => { const r=node.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth + 1; }'), 'Visible navigation item is clipped'


def no_overflow(page):
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Document overflows horizontally'


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
    try:
        for theme in ['dark', 'light']:
            for width in [360, 390, 768, 1440]:
                context = browser.new_context(viewport={'width': width, 'height': 900}, reduced_motion='reduce', has_touch=width <= 768)
                context.add_init_script(f"localStorage.setItem('theme', {json.dumps(theme)})")

                def local_only(route):
                    if urlsplit(route.request.url).netloc == urlsplit(BASE).netloc:
                        route.continue_()
                    else:
                        EXTERNAL.append(route.request.url.split('?')[0])
                        route.abort()

                context.route('**/*', local_only)
                page = context.new_page()
                page.on('pageerror', lambda error: ERRORS.append(str(error)))
                page.goto(BASE, wait_until='networkidle')
                expect(page.locator('html')).to_have_class(theme)
                expect(page.locator('.market-country-card')).to_have_count(6)
                expect(page.locator('.market-country-card>.market-scene')).to_have_count(6)
                expect(page.locator('.market-country-card>.market-scene').first).to_have_attribute('aria-hidden', 'true')
                for country in COUNTRIES:
                    card = page.locator(f'.market-country-card[data-market="{country}"]')
                    expect(card.locator('.market-snapshot-label')).to_have_text('2023 historical snapshot')
                    expect(card.locator('.market-gdp-trend')).to_contain_text('2014–2023 · US$')
                    for value in card.locator('.market-snapshot-metrics dd').all():
                        assert value.get_attribute('aria-label').endswith(', 2023')
                initial = selection(page)
                assert initial == {'singapore', 'thailand'}
                header = page.locator('.flow-header')
                primary = page.get_by_role('navigation', name='Main navigation', exact=True)
                modes = page.get_by_role('navigation', name='Research modes', exact=True)
                expect(modes.get_by_role('button')).to_have_count(6)
                no_overflow(page)

                if width <= 390:
                    expect(primary.locator('a:visible, button:visible')).to_have_count(4)
                    for role, name in [('link', 'Explore markets'), ('button', 'Search'), ('button', 'Compare'), ('link', 'Your plan')]:
                        expect(primary.get_by_role(role, name=name, exact=True)).to_be_visible()
                    fits_horizontally(primary)
                    fits_horizontally(modes)
                    assert modes.bounding_box()['y'] + modes.bounding_box()['height'] < 900, 'Research modes buried below initial viewport'
                    for name in MODES:
                        expect(modes.get_by_role('button', name=name, exact=True)).to_be_visible()
                    header.get_by_role('button', name='More options', exact=True).click()
                    menu = page.get_by_role('menu', name='More options', exact=True)
                    for name in ['Market Data', 'Analytics', 'Enterprise Intelligence']:
                        expect(primary.get_by_role('button', name=name, exact=True)).to_be_hidden()
                        expect(menu.get_by_role('menuitem', name=name, exact=True)).to_be_visible()
                    page.keyboard.press('Escape')
                    rail = page.locator('.market-country-grid')
                    previous = page.get_by_role('button', name='Previous markets', exact=True)
                    following = page.get_by_role('button', name='Next markets', exact=True)
                    expect(previous).to_be_disabled()
                    expect(following).to_be_enabled()
                    start = rail.evaluate('(node) => node.scrollLeft')
                    following.click()
                    page.wait_for_function('start => document.querySelector(".market-country-grid").scrollLeft > start + 100', arg=start)
                    assert selection(page) == initial
                    previous.click()
                    page.wait_for_function('() => document.querySelector(".market-country-grid").scrollLeft < 3')
                    assert selection(page) == initial

                page.evaluate('window.scrollTo(0, 0)')
                page.screenshot(path=str(ARTIFACTS / f'polish-home-{theme}-{width}.png'))
                if width in [390, 1440]:
                    page.screenshot(path=str(ARTIFACTS / f'polish-home-{theme}-{width}-full.png'), full_page=True)

                # Searching hides other cards without removing their selection.
                header.get_by_role('button', name='Search', exact=True).click()
                search = page.get_by_role('textbox', name='Search markets or cities', exact=True)
                expect(search).to_be_focused()
                search.fill('Reykjavik')
                expect(page.get_by_role('status').filter(has_text='No markets match')).to_be_visible()
                expect(page.locator('.market-rail-controls')).to_have_count(0)
                assert selection(page) == initial
                search.fill('SGP')
                expect(page.locator('.market-country-card[data-market="singapore"]')).to_have_count(1)
                expect(page.locator('.explorer-search-count')).to_contain_text('1 market matching')
                search.fill('Vietnam')
                expect(page.locator('.market-country-card')).to_have_count(1)
                expect(page.locator('.market-rail-controls')).to_have_count(0)
                assert selection(page) == initial
                page.get_by_role('button', name='Add Vietnam to shortlist and explore', exact=True).click()
                city = page.locator('#city-research-vietnam')
                expect(city).to_be_focused()
                expect(city.get_by_role('heading', name='Ho Chi Minh City', exact=True)).to_be_visible()
                assert selection(page) == initial | {'vietnam'}
                landing = city.evaluate('(node) => ({cityTop:node.getBoundingClientRect().top, tabsBottom:document.querySelector(".explorer-mode-tabs").getBoundingClientRect().bottom, viewportHeight:innerHeight})')
                if not (landing['tabsBottom'] <= landing['cityTop'] < landing['viewportHeight'] / 2):
                    page.screenshot(path=str(ARTIFACTS / f'failed-city-{theme}-{width}.png'))
                    raise AssertionError(f'{theme} {width}px: requested city did not land below sticky navigation: {landing}')
                expect(city.locator('.market-scene')).to_have_attribute('aria-hidden', 'true')
                no_overflow(page)
                page.screenshot(path=str(ARTIFACTS / f'polish-city-{theme}-{width}.png'))

                # A fixed shortlist action stays reachable at city depth and clears
                # itself on comparison, rather than obscuring the table.
                bar = page.get_by_role('complementary', name='Your market shortlist', exact=True)
                if width <= 390:
                    expect(bar).to_be_visible()
                    assert bar.evaluate('(node) => {const r=node.getBoundingClientRect(); return r.top > 0 && r.bottom <= innerHeight;}')
                    bar.get_by_role('button', name='Compare shortlist', exact=True).click()
                else:
                    header.get_by_role('button', name='Compare', exact=True).click()
                comparison = page.locator('#market-comparison')
                expect(comparison).to_be_focused()
                expect(bar).to_have_count(0)
                expect(comparison).to_contain_text('2023 historical snapshot')
                expect(comparison.get_by_role('rowheader', name='Population · 2023', exact=True)).to_be_visible()
                expect(comparison.get_by_role('rowheader', name='GDP · 2023 · current US$', exact=True)).to_be_visible()
                expect(comparison.get_by_role('columnheader').filter(has_text='Vietnam')).to_have_count(1)
                table = page.get_by_role('region', name='Selected markets comparison table', exact=True)
                expect(table).to_have_attribute('tabindex', '0')
                if table.evaluate('(node) => node.scrollWidth > node.clientWidth + 1'):
                    expect(comparison.locator('.comparison-scroll-hint')).to_contain_text('3 markets · scroll sideways')
                    label = table.get_by_role('columnheader', name='Research lens', exact=True)
                    before = label.bounding_box()['x']
                    table.focus()
                    page.keyboard.press('ArrowRight')
                    page.wait_for_function('() => document.querySelector(".explorer-comparison-scroll").scrollLeft > 10')
                    assert abs(label.bounding_box()['x'] - before) < 2, 'Research labels move out of view during comparison scroll'
                else:
                    expect(comparison.locator('.comparison-scroll-hint')).to_have_count(0)
                no_overflow(page)
                page.screenshot(path=str(ARTIFACTS / f'polish-comparison-{theme}-{width}.png'))
                comparison.get_by_role('button', name='Close market comparison', exact=True).click()
                if width <= 390:
                    expect(bar).to_be_visible()
                RESULTS.append({'theme': theme, 'width': width, 'selectedMarkets': sorted(selection(page)), 'passed': True})
                context.close()
                print(f'PASS: polish workflows {theme} {width}px', flush=True)

        assert not ERRORS, ERRORS
        assert not EXTERNAL, EXTERNAL
        (ARTIFACTS / 'polish-results.json').write_text(json.dumps(RESULTS, indent=2) + '\n')
        print('PASS: navigation/rail/search/city-focus/shortlist/comparison/source-year checks in both themes at360/390/768/1440; no document overflow, runtime errors or external transport')
        print(f'Artifacts: {ARTIFACTS}')
    finally:
        browser.close()
