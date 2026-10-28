"""Restored Flow discovery journey against the actual bundled historical snapshot.

Run with Vite/preview available: python tests/flow-exploration-browser.py
FLOW_TEST_URL selects the server; FLOW_TEST_ARTIFACTS selects screenshots/downloads.
Requires the cloud image's Python Playwright and Chromium. No provider traffic or
synthetic market observations are used. The optional notebook receives one clearly
labelled test profile only, and its screenshots are not used as product previews.
"""
import json
import os
import re
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get('FLOW_TEST_URL', 'http://127.0.0.1:5173').rstrip('/')
ARTIFACTS = Path(os.environ.get('FLOW_TEST_ARTIFACTS', '/tmp/flow-recovery-final-preview'))
ARTIFACTS.mkdir(parents=True, exist_ok=True)
ORIGIN = f'{urlsplit(BASE).scheme}://{urlsplit(BASE).netloc}'
COUNTRIES = [('thailand', 'Thailand', '🇹🇭'), ('singapore', 'Singapore', '🇸🇬'), ('malaysia', 'Malaysia', '🇲🇾'), ('indonesia', 'Indonesia', '🇮🇩'), ('philippines', 'Philippines', '🇵🇭'), ('vietnam', 'Vietnam', '🇻🇳')]
MODES = ['Market Overview', 'City Analysis', 'Industry Deep Dive', 'Market Intelligence', 'Case Studies', 'Data Visualization']
CANONICAL = {'THA': {'population': 71702435, 'gdpUsd': 514944993833.5776}, 'SGP': {'population': 5917648, 'gdpUsd': 501427500080.05853}}
POP_COMMIT = 'd4b1a4a9a17e2123baf0ef119de05bceced1ab1b'
GDP_COMMIT = '36d761dc5617982d3e50b213e02b9a1b47c4e958'
POP_URL = f'https://raw.githubusercontent.com/datasets/population/{POP_COMMIT}/data/population.csv'
GDP_URL = f'https://raw.githubusercontent.com/datasets/gdp/{GDP_COMMIT}/data/gdp.csv'
ERRORS, EXTERNAL = [], []


def make_context(browser, theme=None, width=1440):
    context = browser.new_context(viewport={'width': width, 'height': 844 if width <= 390 else 1000}, accept_downloads=True, has_touch=width <= 768, color_scheme='dark' if theme == 'light' else 'light')
    if theme:
        context.add_init_script(f"if(location.origin === {json.dumps(ORIGIN)}) localStorage.setItem('theme', {json.dumps(theme)})")
    context.on('page', lambda page: page.on('pageerror', lambda error: ERRORS.append(str(error))))

    def local_only(route):
        if urlsplit(route.request.url).netloc == urlsplit(BASE).netloc or route.request.url.startswith('data:'):
            route.continue_()
        else:
            EXTERNAL.append(route.request.url.split('?')[0])
            route.abort()

    context.route('**/*', local_only)
    return context


def card(page, country):
    return page.locator(f'.market-country-card[data-market="{country}"]')


def mode(page, name):
    return page.get_by_role('navigation', name='Research modes', exact=True).get_by_role('button', name=name, exact=True)


def open_mode(page, name, touch=False):
    button = mode(page, name)
    button.tap() if touch else button.click()
    expect(button).to_have_attribute('aria-current', 'page')


def capture(page, name, viewport=False):
    page.evaluate('window.scrollTo(0, 0)')
    page.screenshot(path=str(ARTIFACTS / f'{name}.png'), full_page=not viewport)


def no_overflow(page, label):
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'{label}: horizontal document overflow'


def safe_source(link, href):
    expect(link).to_have_attribute('href', href)
    expect(link).to_have_attribute('target', '_blank')
    assert 'noopener' in (link.get_attribute('rel') or '').split()


def initial_discovery(page):
    expect(page.get_by_role('heading', name='Find your next market. Make your move.', exact=True)).to_be_visible()
    expect(page.get_by_text('Explore countries, discover cities and understand what to research before you launch or expand.', exact=True)).to_be_visible()
    expect(page.get_by_role('heading', name='Market workspace', exact=True)).to_have_count(0)
    expect(page.get_by_role('heading', name='Current research data is unavailable', exact=True)).to_have_count(0)
    expect(page.locator('.market-country-card')).to_have_count(6)
    for country, name, flag in COUNTRIES:
        item = card(page, country)
        expect(item.get_by_role('heading', name=name, exact=True)).to_be_visible()
        expect(item.locator('.market-country-flag')).to_have_text(flag)
        expect(item.locator('.market-snapshot-label')).to_have_text('2023 historical snapshot')
        expect(item.locator('.market-snapshot-metrics dd')).to_have_count(2)
        expect(item.get_by_role('img', name=f'{name} nominal GDP, 2014–2023', exact=True)).to_be_visible()
        expected = 'true' if country in ['thailand', 'singapore'] else 'false'
        expect(item.locator('.market-country-toggle')).to_have_attribute('aria-pressed', expected)
    for name in MODES:
        expect(mode(page, name)).to_be_visible()
    expect(page.locator('.market-reference-figures')).to_have_count(0)
    expect(page.locator('.explorer-reference-strip')).to_have_count(0)
    expect(page.get_by_role('button', name='Data status: unverified sources', exact=True)).to_be_visible()


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
    try:
        context = make_context(browser)
        page = context.new_page()
        page.goto(BASE, wait_until='networkidle')
        expect(page.locator('html')).to_have_class('dark')
        initial_discovery(page)
        capture(page, 'default-explorer-dark-desktop')
        capture(page, 'default-explorer-dark-desktop-viewport', viewport=True)

        # The cards expose exact sourced numbers, rather than the old fixed examples.
        for country, code in [('thailand', 'THA'), ('singapore', 'SGP')]:
            values = card(page, country).locator('.market-snapshot-metrics dd')
            population_label = values.nth(0).get_attribute('aria-label')
            gdp_label = values.nth(1).get_attribute('aria-label')
            assert population_label.endswith(' people, 2023')
            assert int(population_label.split(' people')[0].replace(',', '')) == CANONICAL[code]['population']
            assert gdp_label.endswith(' current US dollars, 2023')
            assert float(gdp_label.split(' current')[0].replace(',', '')) == CANONICAL[code]['gdpUsd']

        # Search actually filters countries and their cities, and preserves selection.
        header = page.locator('.flow-header')
        header.get_by_role('button', name='Search', exact=True).click()
        search = page.get_by_role('textbox', name='Search markets or cities', exact=True)
        expect(search).to_be_focused()
        for query, country in [('Vietnam', 'vietnam'), ('Bangkok', 'thailand')]:
            search.fill(query)
            expect(page.locator('.market-country-card')).to_have_count(1)
            expect(card(page, country)).to_be_visible()
        search.fill('Reykjavik')
        expect(page.get_by_role('status').filter(has_text='No markets match')).to_be_visible()
        expect(page.locator('.market-country-card')).to_have_count(0)
        page.get_by_role('button', name='Clear search', exact=True).click()
        expect(page.locator('.market-country-card')).to_have_count(6)
        expect(card(page, 'singapore').get_by_role('button', name='Deselect Singapore', exact=True)).to_have_attribute('aria-pressed', 'true')

        # Country selection is native-keyboard operable and drives the comparison.
        malaysia = card(page, 'malaysia').get_by_role('button', name='Select Malaysia', exact=True)
        malaysia.focus(); page.keyboard.press('Space')
        expect(card(page, 'malaysia').get_by_role('button', name='Deselect Malaysia', exact=True)).to_have_attribute('aria-pressed', 'true')
        header.get_by_role('button', name='Compare', exact=True).click()
        comparison = page.get_by_role('region', name='Your markets, side by side.', exact=True)
        expect(comparison).to_be_visible()
        expect(comparison.get_by_role('columnheader').filter(has_text='Malaysia')).to_have_count(1)
        malaysia = card(page, 'malaysia').get_by_role('button', name='Deselect Malaysia', exact=True)
        malaysia.focus(); page.keyboard.press('Enter')
        expect(comparison.get_by_role('columnheader').filter(has_text='Malaysia')).to_have_count(0)
        expect(comparison.get_by_role('columnheader')).to_have_count(3)
        expect(comparison.get_by_role('rowheader', name='Population · 2023', exact=True)).to_be_visible()
        expect(comparison.get_by_role('rowheader', name='GDP · 2023 · current US$', exact=True)).to_be_visible()
        safe_source(comparison.get_by_role('link', name='Thailand Board of Investment', exact=True), 'https://www.boi.go.th/')
        safe_source(comparison.get_by_role('link', name='ACRA', exact=True), 'https://www.acra.gov.sg/')
        expect(comparison).to_contain_text('not a market ranking')
        with page.expect_download() as download_info:
            comparison.get_by_role('button', name='Export shortlist', exact=True).click()
        destination = ARTIFACTS / 'sourced-market-shortlist.json'
        download_info.value.save_as(destination)
        exported = json.loads(destination.read_text())
        assert exported['contentType'] == 'historical-country-snapshot-and-source-directory'
        assert [item['id'] for item in exported['markets']] == ['thailand', 'singapore']
        snapshot = exported['historicalSnapshot']
        provenance = snapshot['provenance']
        assert provenance['observationYear'] == 2023
        assert provenance['retrievedAt'] == '2026-10-25T17:48:56Z'
        assert provenance['population']['downloadUrl'] == POP_URL
        assert provenance['gdp']['downloadUrl'] == GDP_URL
        assert provenance['population']['sha256'] == '2c697c3e668c8cb06ee467cd0d475b37b52844fdc48cb7725b79b58f18bf0b02'
        assert provenance['gdp']['sha256'] == '8d84ef6bcaccf740c01c5ed7566aae8f7b149d0e2c20001e441efd3cb5b2fa86'
        for observation in snapshot['observations']:
            expected = CANONICAL[observation['countryCode']]
            assert observation['population'] == expected['population'] and observation['gdpUsd'] == expected['gdpUsd']
            assert [point['year'] for point in observation['gdpSeries']] == list(range(2014, 2024))
            assert observation['gdpSeries'][-1]['value'] == observation['gdpUsd']
            assert not any(key in observation for key in ['score', 'probability', 'survival', 'businessFit'])
        for phrase in ['not live/current', 'city statistics', 'business-fit rankings', 'not cross-checked', 'not verified current business requirements']:
            assert phrase in exported['limitation']
        capture(page, 'sourced-comparison-dark')
        comparison.get_by_role('button', name='Close market comparison', exact=True).click()

        # The normal chart switches the real values/units, using one linear scale.
        fundamentals = page.locator('.market-fundamentals')
        expect(fundamentals.get_by_role('heading', name='Compare country fundamentals.', exact=True)).to_be_visible()
        switches = fundamentals.get_by_role('group', name='Compare country fundamentals by metric', exact=True)
        sg_row = fundamentals.locator('.mf-row[data-market="singapore"]')
        thai_row = fundamentals.locator('.mf-row[data-market="thailand"]')
        expect(switches.get_by_role('button', name='GDP', exact=True)).to_have_attribute('aria-pressed', 'true')
        assert float(sg_row.locator('data').get_attribute('value')) == CANONICAL['SGP']['gdpUsd']
        gdp_width = float(sg_row.locator('.mf-bar').get_attribute('style').split(':')[1].strip(' %;'))
        population_switch = switches.get_by_role('button', name='Population', exact=True)
        population_switch.focus(); page.keyboard.press('Enter')
        expect(population_switch).to_have_attribute('aria-pressed', 'true')
        assert int(sg_row.locator('data').get_attribute('value')) == CANONICAL['SGP']['population']
        assert int(thai_row.locator('data').get_attribute('value')) == CANONICAL['THA']['population']
        pop_width = float(sg_row.locator('.mf-bar').get_attribute('style').split(':')[1].strip(' %;'))
        assert pop_width < gdp_width / 2
        expect(fundamentals).to_contain_text('People · millions')
        expect(fundamentals).to_contain_text('not customer demand, business fit or legal requirements')
        details = fundamentals.locator('.mf-source-details')
        details.locator('summary').focus(); page.keyboard.press('Enter')
        expect(details).to_have_attribute('open', '')
        expect(details).to_contain_text('Historical observations, not a live feed.')
        expect(details).to_contain_text('not independently cross-checked against the primary World Bank endpoint')
        expect(details.locator('time')).to_have_attribute('datetime', provenance['retrievedAt'])
        expect(details).to_contain_text('Unknown')
        safe_source(details.locator(f'a[href="{POP_URL}"]'), POP_URL)
        safe_source(details.locator(f'a[href="{GDP_URL}"]'), GDP_URL)
        capture(page, 'dated-source-chart-dark')
        details.locator('summary').focus(); page.keyboard.press('Enter')
        switches.get_by_role('button', name='GDP', exact=True).click()

        # Cities and industries respond with different research, not fake scores.
        open_mode(page, 'City Analysis')
        cities = page.locator('.mr-city')
        expect(cities).to_have_count(2)
        expect(cities.filter(has=page.get_by_role('heading', name='Bangkok', exact=True))).to_be_visible()
        lens = page.get_by_role('group', name='City research lens', exact=True)
        lens.get_by_role('button', name='Location', exact=True).click()
        expect(cities.first).to_contain_text('Which Bangkok address supports the operating model?')
        lens.get_by_role('button', name='Setup', exact=True).click()
        expect(cities.first).to_contain_text('Investment support or operating at a Bangkok address?')
        safe_source(cities.first.get_by_role('link', name='Bangkok city portal', exact=True), 'https://www.bangkok.go.th/')
        capture(page, 'city-discovery-dark-desktop')
        open_mode(page, 'Industry Deep Dive')
        industries = page.get_by_role('group', name='Choose an industry', exact=True)
        industries.get_by_role('button', name='Food & beverage', exact=True).focus(); page.keyboard.press('Enter')
        expect(page.get_by_role('heading', name='Does the location work as well as the concept?', exact=True)).to_be_visible()
        cost = page.locator('.mr-angle').filter(has=page.get_by_text('Cost & delivery', exact=True))
        cost.locator('summary').focus(); page.keyboard.press('Enter')
        expect(cost).to_contain_text('cold storage, wastage and staffing')
        industries.get_by_role('button', name='Manufacturing', exact=True).click()
        expect(page.get_by_role('heading', name='Can the operating site support the whole production model?', exact=True)).to_be_visible()
        expect(cost).to_contain_text('site, power, labour and logistics')
        capture(page, 'industry-discovery-dark-desktop')
        open_mode(page, 'Market Intelligence')
        intelligence = page.get_by_role('group', name='Intelligence topic', exact=True)
        intelligence.get_by_role('button', name='Market demand', exact=True).click()
        portal = page.locator('.mr-portal').filter(has_text='Thailand')
        safe_source(portal.get_by_role('link', name='Open source directory', exact=True), 'https://www.nso.go.th/')
        scope = page.locator('.mr-source-scope')
        scope.locator('summary').focus(); page.keyboard.press('Enter')
        expect(scope).to_contain_text('not current market findings or legal requirements')
        expect(scope).to_contain_text('Historical snapshots carry their own source and observation-year details.')
        expect(scope).to_contain_text('Numeric reference examples are separate and require an explicit choice.')

        # Optional examples stay a deliberate choice; their limits remain accessible.
        open_mode(page, 'Data Visualization')
        expect(page.locator('.market-fundamentals')).to_be_visible()
        expect(page.get_by_role('note').filter(has_text='Unverified static reference charts')).to_have_count(0)
        page.get_by_role('button', name='View unverified reference examples', exact=True).click()
        reference_badge = header.get_by_role('button', name='Data status: unverified reference examples enabled', exact=True)
        expect(reference_badge).to_be_visible()
        notice = page.get_by_role('note').filter(has_text='Unverified static reference charts')
        expect(notice).to_be_visible()
        disclosure = notice.locator('details')
        expect(disclosure).not_to_have_attribute('open', '')
        disclosure.locator('summary').focus(); page.keyboard.press('Enter')
        expect(disclosure).to_have_attribute('open', '')
        expect(notice.get_by_text('All figures are bundled reference material', exact=False)).to_be_visible()
        expect(notice).to_contain_text('unknown observation dates')
        capture(page, 'explicit-reference-charts-dark')
        reference_badge.click()
        header.get_by_role('button', name='Hide examples', exact=True).click()
        expect(page.get_by_role('note').filter(has_text='Unverified static reference charts')).to_have_count(0)
        expect(page.locator('.market-fundamentals')).to_be_visible()

        # The notebook is optional; both its profile and the explorer shortlist
        # survive the real header-link round trip and a full document reload.
        card(page, 'indonesia').get_by_role('button', name='Select Indonesia', exact=True).click()

        def assert_three_market_shortlist():
            expect(page.locator('.market-country-toggle[aria-pressed="true"]')).to_have_count(3)
            for country, name in [('thailand', 'Thailand'), ('singapore', 'Singapore'), ('indonesia', 'Indonesia')]:
                expect(card(page, country).get_by_role('button', name=f'Deselect {name}', exact=True)).to_have_attribute('aria-pressed', 'true')
            stored = page.evaluate('JSON.parse(localStorage.getItem("flow-market-shortlist-v1"))')
            assert stored['version'] == 1
            assert sorted(stored['countries']) == ['indonesia', 'singapore', 'thailand']

        assert_three_market_shortlist()
        header.get_by_role('link', name='Your plan', exact=True).click()
        expect(page.get_by_role('heading', name='Your market plan.', exact=True)).to_be_visible()
        for country_name in ['Thailand', 'Singapore', 'Indonesia']:
            expect(page.get_by_role('heading', name=country_name, exact=True)).to_be_visible()
        page.get_by_role('link', name='Open city notebook', exact=True).click()
        expect(page.get_by_role('heading', name='Market workspace', exact=True)).to_be_visible()
        page.get_by_role('button', name='Edit business profile', exact=True).click()
        description = 'Synthetic browser profile only; no market observation or recommendation.'
        page.get_by_label('What are you building?', exact=True).fill(description)
        page.get_by_role('button', name='Done', exact=True).click()
        saved = page.evaluate('JSON.parse(localStorage.getItem("flow-entry-planner-v1"))')
        assert saved['profile']['businessDescription'] == description
        header.get_by_role('link', name='Explore markets', exact=True).click()
        expect(page.get_by_role('heading', name='Find your next market. Make your move.', exact=True)).to_be_visible()
        assert page.evaluate('JSON.parse(localStorage.getItem("flow-entry-planner-v1"))') == saved
        assert_three_market_shortlist()
        page.reload(wait_until='networkidle')
        assert_three_market_shortlist()
        assert page.evaluate('JSON.parse(localStorage.getItem("flow-entry-planner-v1"))') == saved
        page.go_back()
        expect(page.get_by_role('heading', name='Market workspace', exact=True)).to_be_visible()
        page.get_by_role('button', name='Edit business profile', exact=True).click()
        expect(page.get_by_label('What are you building?', exact=True)).to_have_value(description)
        page.get_by_role('button', name='Done', exact=True).click()
        header.get_by_role('link', name='Explore markets', exact=True).click()
        assert_three_market_shortlist()
        for country, name in [('thailand', 'Thailand'), ('singapore', 'Singapore'), ('indonesia', 'Indonesia')]:
            card(page, country).get_by_role('button', name=f'Deselect {name}', exact=True).click()
        expect(page.locator('.market-country-toggle[aria-pressed="true"]')).to_have_count(0)
        page.reload(wait_until='networkidle')
        expect(page.locator('.market-country-toggle[aria-pressed="true"]')).to_have_count(0)
        assert page.evaluate('JSON.parse(localStorage.getItem("flow-market-shortlist-v1"))') == {'version': 1, 'countries': []}
        assert page.evaluate('JSON.parse(localStorage.getItem("flow-entry-planner-v1"))') == saved
        context.close()
        print('PASS: sourced cards/chart/provenance, search, keyboard selection, real shortlist/export, city/industry/source journeys, explicit examples, optional notebook/history; three-market and empty shortlists survive reload without changing notebook data')

        # Preview captures are fresh actual product states, without synthetic research.
        for theme in ['dark', 'light']:
            for width in [360, 390, 768, 1440]:
                layout_context = make_context(browser, theme, width)
                layout = layout_context.new_page(); layout.goto(BASE, wait_until='networkidle')
                initial_discovery(layout)
                no_overflow(layout, f'{theme} {width}px normal')
                if width <= 390:
                    bounds = layout.get_by_role('navigation', name='Research modes', exact=True).bounding_box()
                    assert bounds['y'] + bounds['height'] <= 844, f'{theme} {width}: research modes buried below first viewport'
                    # A real touch target changes the mode and country selection.
                    open_mode(layout, 'City Analysis', touch=True)
                    expect(layout.locator('.mr-city')).to_have_count(2)
                    open_mode(layout, 'Market Overview', touch=True)
                    toggle = card(layout, 'thailand').get_by_role('button', name='Deselect Thailand', exact=True)
                    toggle.tap()
                    expect(card(layout, 'thailand').get_by_role('button', name='Select Thailand', exact=True)).to_have_attribute('aria-pressed', 'false')
                    card(layout, 'thailand').get_by_role('button', name='Select Thailand', exact=True).tap()
                capture(layout, f'normal-{theme}-{width}')
                capture(layout, f'normal-viewport-{theme}-{width}', viewport=True)
                layout.get_by_role('button', name='View unverified reference examples', exact=True).click()
                expect(layout.get_by_role('button', name='Data status: unverified reference examples enabled', exact=True)).to_be_visible()
                no_overflow(layout, f'{theme} {width}px reference')
                if width in [360, 1440]:
                    capture(layout, f'explicit-reference-{theme}-{width}')
                # Retained analyses must follow the app theme, not the opposite
                # OS preference: original white cards in dark mode were a defect.
                open_mode(layout, 'Industry Deep Dive')
                panels = layout.locator('.reference-research [class~="bg-white"][class~="dark:bg-gray-800"]')
                assert panels.count() >= 3
                for panel in panels.all():
                    rgb = panel.evaluate('(node) => getComputedStyle(node).backgroundColor')
                    channels = [int(value) for value in re.findall(r'\d+', rgb)[:3]]
                    assert sum(channels) < 300 if theme == 'dark' else sum(channels) > 600, f'{theme} app theme ignored: {rgb}'
                no_overflow(layout, f'{theme} {width}px reference industry')
                if width in [360, 1440]:
                    capture(layout, f'reference-industries-{theme}-{width}')
                layout_context.close()
        assert not ERRORS, ERRORS
        assert not EXTERNAL, f'Unexpected external requests from exploration: {EXTERNAL}'
        print('PASS: fresh normal/reference layouts, dark/light360/390/768/1440, native touch/keyboard actions, first-viewport research modes, no overflow/runtime errors/external requests')
        print(f'Artifacts: {ARTIFACTS}')
    finally:
        browser.close()
