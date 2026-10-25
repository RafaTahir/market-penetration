"""Integrity regression: no implicit examples or invented observations in normal views.

Uses isolated browser contexts and blocked/mocked transport, never actual providers.
Run against the production preview with the cloud Chromium/Playwright installation.
"""
import os
from pathlib import Path
from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get('FLOW_TEST_URL', 'http://127.0.0.1:4173')
ARTIFACTS = Path(os.environ.get('FLOW_TEST_ARTIFACTS', '/tmp/flow-integrity-artifacts'))
ARTIFACTS.mkdir(parents=True, exist_ok=True)

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
    errors = []
    context = browser.new_context(viewport={'width': 1440, 'height': 1000})
    context.on('page', lambda page: page.on('pageerror', lambda error: errors.append(str(error))))
    context.route('**/*', lambda route: route.continue_() if route.request.url.startswith(BASE) else route.abort())
    page = context.new_page()
    page.goto(BASE + '/#/research', wait_until='networkidle')
    expect(page.get_by_role('heading', name='Current research data is unavailable')).to_be_visible()
    expect(page.get_by_role('heading', name='Market Overview', exact=True)).to_have_count(0)
    page.screenshot(path=str(ARTIFACTS / 'research-unavailable-default.png'))
    page.get_by_role('button', name='View unverified reference examples').click()
    expect(page.get_by_text('Unverified reference examples enabled.', exact=True)).to_be_visible()
    expect(page.get_by_role('heading', name='Market Overview', exact=True)).to_be_visible()
    page.get_by_role('button', name='Hide examples', exact=True).click()
    expect(page.get_by_role('heading', name='Current research data is unavailable')).to_be_visible()

    # Hash paths are same-document; reload verifies a fresh default state, too.
    page.goto(BASE + '/#/research/analytics', wait_until='networkidle')
    page.reload(wait_until='networkidle')
    expect(page.get_by_role('heading', name='Current research data is unavailable')).to_be_visible()
    page.goto(BASE + '/#/research/live-data', wait_until='networkidle')
    expect(page.get_by_text('No stored quotes are available.', exact=False)).to_be_visible(timeout=15000)
    expect(page.get_by_text('No estimated rate has been substituted.', exact=False)).to_be_visible(timeout=15000)
    expect(page.get_by_text('Economic reference data is unavailable.', exact=True)).to_be_visible(timeout=15000)
    page.screenshot(path=str(ARTIFACTS / 'provider-unavailable.png'), full_page=True)

    page.goto(BASE + '/#/research/reports', wait_until='networkidle')
    expect(page.get_by_role('heading', name='Institutional Reference Directory')).to_be_visible()
    expect(page.get_by_text('Publication date: Unknown', exact=True)).to_have_count(3)
    expect(page.get_by_text('Invalid Date', exact=True)).to_have_count(0)
    expect(page.get_by_text('ASEAN Investment Report 2024', exact=True)).to_have_count(0)

    # A zero-valued, dated transport fixture must stay zero, with its original
    # annual period; unrelated metrics and countries must not be manufactured.
    fixture_context = browser.new_context(viewport={'width': 1440, 'height': 1000})
    fixture_context.on('page', lambda page: page.on('pageerror', lambda error: errors.append(str(error))))
    def route_fixture(route):
        url = route.request.url
        if url.startswith(BASE):
            route.continue_()
        elif url.startswith('https://api.worldbank.org/'):
            route.fulfill(json=[{'page': 1, 'pages': 1}, [{
                'country': {'id': 'SG', 'value': 'Singapore'}, 'countryiso3code': 'SGP',
                'date': '2023', 'value': 0,
            }]])
        else:
            route.abort()
    fixture_context.route('**/*', route_fixture)
    fixture_page = fixture_context.new_page()
    fixture_page.goto(BASE + '/#/research/live-data', wait_until='networkidle')
    row = fixture_page.get_by_role('row').filter(has=fixture_page.get_by_role('cell', name='Singapore', exact=False))
    expect(row).to_be_visible(timeout=15000)
    expect(row).to_contain_text('$0.0')
    expect(row).to_contain_text('0.0%')
    expect(row).to_contain_text('Period: 2023')
    expect(row).to_contain_text('Unavailable')
    expect(row).to_contain_text('not independently verified')
    expect(fixture_page.get_by_role('row').filter(has=fixture_page.get_by_role('cell', name='Indonesia', exact=False))).to_have_count(0)
    assert not errors, errors
    browser.close()
    print('PASS: explicit/reversible reference mode, fresh default gate, failed-provider unavailable states, unknown publication dates, preserved real zero and source year, no invented countries/metrics; no uncaught errors or real provider requests.')
