"""Shortlist-to-plan regression with isolated, explicitly synthetic notebook data.

No provider transport or production data is written. Existing notebook scores,
research and exports must survive the new market-plan journey unchanged.
"""
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get('FLOW_TEST_URL', 'http://127.0.0.1:4173').rstrip('/')
ARTIFACTS = Path(os.environ.get('FLOW_TEST_ARTIFACTS', '/tmp/flow-market-plan-browser'))
ARTIFACTS.mkdir(parents=True, exist_ok=True)
NOTEBOOK = 'flow-entry-planner-v1'
SHORTLIST = 'flow-market-shortlist-v1'
TODAY = datetime.now(timezone.utc).date().isoformat()
PROFILE = {'segment': 'sme', 'phase': 'expanding', 'industry': 'professional-services', 'businessDescription': 'Synthetic browser fixture only; not a real business.', 'runwayMonths': 9}
CONTEXT = json.dumps([PROFILE[key] for key in ['segment', 'phase', 'industry', 'businessDescription']], separators=(',', ':'))
FIXTURE = {'version': 1, 'profile': PROFILE, 'evidence': {city: {factor: {'rating': rating, 'note': 'Synthetic test evidence only; no factual market observation.', 'sourceUrl': 'https://example.org/synthetic-fixture', 'observedOn': TODAY, 'profileContext': CONTEXT} for factor in ['demand', 'competition', 'regulation', 'costs', 'talent']} for city, rating in [('jakarta', 1), ('manila', 3)]}}
ERRORS, EXTERNAL, RESULTS = [], [], []


def context_for(browser, theme, width, blocked=False):
    context = browser.new_context(viewport={'width': width, 'height': 900}, reduced_motion='reduce', accept_downloads=True)
    if blocked:
        context.add_init_script("Object.defineProperty(window, 'localStorage', {get(){throw new DOMException('Blocked', 'SecurityError')}})")
    else:
        context.add_init_script(f"""if (location.origin === {json.dumps(BASE)}) {{ localStorage.setItem('theme', {json.dumps(theme)});
            if (localStorage.getItem('{SHORTLIST}') === null) localStorage.setItem('{SHORTLIST}', JSON.stringify({{version:1,countries:['malaysia']}}));
            if (localStorage.getItem('{NOTEBOOK}') === null) localStorage.setItem('{NOTEBOOK}', {json.dumps(json.dumps(FIXTURE, separators=(',', ':')))}); }}""")
    context.on('page', lambda page: page.on('pageerror', lambda error: ERRORS.append(str(error))))

    def local_only(route):
        if urlsplit(route.request.url).netloc == urlsplit(BASE).netloc:
            route.continue_()
        else:
            EXTERNAL.append(route.request.url.split('?')[0]); route.abort()

    context.route('**/*', local_only)
    return context


def open_plan(page):
    page.locator('.flow-header').get_by_role('link', name='Your plan', exact=True).click()
    expect(page.get_by_role('heading', name='Your market plan.', exact=True)).to_be_visible()


def note_field(page, country):
    card = page.locator(f'.mph-market[data-market="{country.lower()}"]')
    if not card.locator('.mph-next-step').evaluate('(node) => node.open'):
        card.locator('.mph-next-step summary').click()
    return page.get_by_label(f'Your next step for {country}', exact=True)


def assert_no_overflow(page):
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
    try:
        for theme in ['dark', 'light']:
            for width in [360, 390, 1165, 1440]:
                context = context_for(browser, theme, width)
                page = context.new_page(); page.goto(BASE, wait_until='networkidle')
                original = page.evaluate(f'localStorage.getItem({json.dumps(NOTEBOOK)})')
                expect(page.locator('.market-country-card[data-market="malaysia"] .market-gdp-trend')).to_contain_text('Own scale')
                expect(page.get_by_role('button', name='Add Vietnam to shortlist and explore', exact=True)).to_have_count(1)
                expect(page.get_by_role('button', name='Explore Malaysia', exact=True)).to_have_count(1)
                if width >= 1165:
                    bounds = page.locator('.explorer-hero').bounding_box()
                    for label in page.locator('.atlas-label').all():
                        rect = label.bounding_box()
                        assert rect['x'] >= bounds['x'] and rect['x'] + rect['width'] <= bounds['x'] + bounds['width'] + 1
                open_plan(page)
                expect(page.locator('.mph-market')).to_have_count(1)
                expect(page.get_by_role('heading', name='Malaysia', exact=True)).to_be_visible()
                expect(page.locator('.city-signal')).to_have_count(0)
                expect(page.locator('.mph-notebook')).to_contain_text('Jakarta province and the City of Manila')
                assert page.evaluate(f'localStorage.getItem({json.dumps(NOTEBOOK)})') == original
                note = f'Synthetic next-step fixture for {theme} {width}; not a market finding.'
                note_field(page, 'Malaysia').fill(note)
                expect(page.get_by_role('status').filter(has_text='Next steps saved')).to_be_visible()
                assert page.evaluate(f'localStorage.getItem({json.dumps(NOTEBOOK)})') == original
                with page.expect_download() as download:
                    page.get_by_role('button', name='Export market plan', exact=True).click()
                destination = ARTIFACTS / f'market-plan-{theme}-{width}.json'; download.value.save_as(destination)
                exported = json.loads(destination.read_text())
                assert exported['contentType'] == 'user-market-plan-and-source-directory'
                assert len(exported['markets']) == 1 and exported['markets'][0]['id'] == 'malaysia'
                assert exported['markets'][0]['userNextStep'] == note
                assert exported['markets'][0]['sources']['sourcePublicationDate'] is None
                assert exported['markets'][0]['sources']['sourceContentsVerified'] is False
                assert 'unverified planning notes' in exported['limitation']
                assert not any(key in exported['markets'][0] for key in ['score', 'survivalProbability', 'preparation'])
                page.reload(wait_until='networkidle')
                expect(note_field(page, 'Malaysia')).to_have_value(note)
                assert_no_overflow(page)
                page.screenshot(path=str(ARTIFACTS / f'malaysia-plan-{theme}-{width}.png'), full_page=True)
                page.get_by_role('link', name='Open city notebook', exact=True).click()
                expect(page.get_by_role('heading', name='Market workspace', exact=True)).to_be_visible()
                expect(page.get_by_label('Jakarta preparation 0 out of 100', exact=True)).to_be_visible()
                expect(page.get_by_label('Manila preparation 50 out of 100', exact=True)).to_be_visible()
                assert page.evaluate(f'JSON.parse(localStorage.getItem({json.dumps(NOTEBOOK)}))') == FIXTURE
                with page.expect_download() as download:
                    page.get_by_role('button', name='Export research', exact=True).click()
                legacy = ARTIFACTS / f'notebook-{theme}-{width}.json'; download.value.save_as(legacy)
                old_export = json.loads(legacy.read_text())
                assert old_export['workspace'] == FIXTURE
                assert [item['score'] for item in old_export['assessments']] == [0, 50]
                open_plan(page)
                expect(note_field(page, 'Malaysia')).to_have_value(note)
                page.locator('.flow-header').get_by_role('link', name='Explore markets', exact=True).click()
                page.get_by_role('button', name='Deselect Malaysia', exact=True).click()
                open_plan(page)
                expect(page.get_by_role('heading', name='Choose the markets for your plan.', exact=True)).to_be_visible()
                expect(page.locator('.mph-market')).to_have_count(0)
                page.get_by_role('link', name='Choose markets', exact=True).click()
                page.get_by_role('button', name='Select Malaysia', exact=True).click()
                open_plan(page)
                expect(note_field(page, 'Malaysia')).to_have_value(note)
                RESULTS.append({'theme': theme, 'width': width, 'notebookPreserved': True, 'passed': True})
                context.close()

        # Session-only selections and notes survive real route remounts, without
        # claiming they will survive a reload when browser storage is denied.
        context = context_for(browser, 'dark', 390, blocked=True)
        page = context.new_page(); page.goto(BASE, wait_until='networkidle')
        assert page.evaluate("() => { try { localStorage.getItem('test'); return false; } catch { return true; } }")
        for country in ['Singapore', 'Thailand']:
            page.get_by_role('button', name=f'Deselect {country}', exact=True).click()
        page.get_by_role('button', name='Select Malaysia', exact=True).click()
        open_plan(page)
        expect(page.locator('.mph-market')).to_have_count(1)
        note_field(page, 'Malaysia').fill('Synthetic session-only note; not a market fact.')
        expect(page.get_by_role('status').filter(has_text='Session only')).to_be_visible()
        page.locator('.flow-header').get_by_role('link', name='Explore markets', exact=True).click()
        expect(page.get_by_role('button', name='Deselect Malaysia', exact=True)).to_have_count(1)
        open_plan(page)
        expect(note_field(page, 'Malaysia')).to_have_value('Synthetic session-only note; not a market fact.')
        assert_no_overflow(page)
        context.close()
        assert not ERRORS, ERRORS
        assert not EXTERNAL, EXTERNAL
        (ARTIFACTS / 'results.json').write_text(json.dumps(RESULTS, indent=2) + '\n')
        print('PASS: selected Malaysia plans/notes/exports/reload/empty selection, existing 0/50 notebook scores/research/exports, storage-denied session route retention, visible scales and atlas1165; both themes360/390/1165/1440; no runtime errors/external requests')
        print(f'Artifacts: {ARTIFACTS}')
    finally:
        browser.close()
