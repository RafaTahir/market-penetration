"""Exercise the optional market worksheet in an isolated production-preview session."""
import json
import os
import re
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get('FLOW_TEST_URL', 'http://127.0.0.1:4173').rstrip('/')
ARTIFACTS = Path(os.environ.get('FLOW_TEST_ARTIFACTS', '/tmp/flow-break-even'))
ARTIFACTS.mkdir(parents=True, exist_ok=True)
OLD_NOTE = 'Fixture: obtain a comparable Auckland quote.'
SEED = {'version': 1, 'notes': {'new-zealand': {'nextStep': OLD_NOTE, 'updatedAt': None}}}
FIELDS = ['Monthly fixed costs', 'Price per unit', 'Variable cost per unit']


def export_markets(page):
    with page.expect_download() as export:
        page.get_by_role('button', name='Export market plan', exact=True).click()
    assert export.value.suggested_filename == 'flow-market-plan.json'
    payload = json.loads(export.value.path().read_text())
    return {market['id']: market for market in payload['markets']}


def open_worksheet(page, market):
    card = page.locator(f'.mph-market[data-market="{market}"]')
    details = card.locator('details').filter(has=page.locator('summary').filter(has_text='Break-even worksheet'))
    if not details.evaluate('(element) => element.open'):
        details.locator(':scope > summary').click()
    return details


def setup(browser, width, blocked=False):
    errors, external = [], []
    ctx = browser.new_context(viewport={'width': width, 'height': 900}, accept_downloads=True, reduced_motion='reduce')
    if blocked:
        ctx.add_init_script("Object.defineProperty(window, 'localStorage', {get(){throw new DOMException('Blocked', 'SecurityError')}})")
    else:
        ctx.add_init_script(f"""if (location.origin === {json.dumps(BASE)} && !localStorage.getItem('flow-market-plans-v1')) {{
            localStorage.setItem('flow-market-shortlist-v1', JSON.stringify({{version:1,countries:['australia','new-zealand']}}));
            localStorage.setItem('flow-market-plans-v1', {json.dumps(json.dumps(SEED))});
        }}""")

    def local_only(route):
        if urlsplit(route.request.url).netloc == urlsplit(BASE).netloc:
            route.continue_()
        else:
            external.append(route.request.url.split('?')[0])
            route.abort()
    ctx.route('**/*', local_only)
    page = ctx.new_page()
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(f'{BASE}/#/plan', wait_until='networkidle')
    return ctx, page, errors, external


def amounts(sheet, values):
    for label, value in zip(FIELDS, values):
        sheet.get_by_label(label, exact=True).fill(value)


def result(page, market):
    return export_markets(page)[market]['breakEvenScenario']['result']


def durable(browser):
    ctx, page, errors, external = setup(browser, 1280)
    page.locator('.mph-back').click()
    page.get_by_role('button', name='Industry Deep Dive', exact=True).click()
    page.locator('summary').filter(has_text='Cost & delivery').click()
    page.get_by_role('combobox', name='Research in', exact=True).select_option('new-zealand')
    page.get_by_role('button', name='Open break-even worksheet', exact=True).click()
    expect(page).to_have_url(re.compile(r'#/plan/worksheet/new-zealand$'))
    target = page.locator('#break-even-new-zealand')
    expect(target).to_have_js_property('open', True)
    expect(target.locator(':scope > summary')).to_be_focused()
    sheet = open_worksheet(page, 'new-zealand')
    expect(sheet.get_by_label('Currency', exact=True)).to_have_value('NZD')
    for label in FIELDS:
        expect(sheet.get_by_label(label, exact=True)).to_have_value('')
    initial = export_markets(page)
    assert initial['new-zealand']['userNextStep'] == OLD_NOTE
    assert all(market['breakEvenScenario'] is None for market in initial.values())

    amounts(sheet, ['3.00', '0.30', '0.20'])
    assert result(page, 'new-zealand') == {'status': 'calculated', 'contributionPerUnit': 0.1, 'breakEvenUnits': 30}
    expect(sheet).to_contain_text(re.compile(r'30\s+units/month'))
    sheet.get_by_label(FIELDS[0], exact=True).fill('3.01')
    assert result(page, 'new-zealand')['breakEvenUnits'] == 31
    aud = open_worksheet(page, 'australia')
    expect(aud.get_by_label('Currency', exact=True)).to_have_value('AUD')
    amounts(aud, ['100', '50', '25'])
    page.reload(wait_until='networkidle')
    sheet = open_worksheet(page, 'new-zealand')
    expect(sheet.get_by_label(FIELDS[0], exact=True)).to_have_value('3.01')
    markets = export_markets(page)
    assert set(markets) == {'australia', 'new-zealand'}
    assert markets['new-zealand']['userNextStep'] == OLD_NOTE
    assert markets['australia']['breakEvenScenario']['result']['breakEvenUnits'] == 4
    scenario = markets['new-zealand']['breakEvenScenario']
    assert scenario['kind'] == 'user-entered-break-even-scenario'
    assert scenario['inputs']['currency'] == 'NZD'
    assert scenario['method'] and 'user' in scenario['limitation'].lower()
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    sheet.screenshot(path=str(ARTIFACTS / 'auckland-calculated-1280.png'))

    currency = sheet.get_by_label('Currency', exact=True)
    currency.select_option('USD')
    sheet.get_by_role('button', name='Cancel', exact=True).click()
    expect(currency).to_have_value('NZD')
    expect(sheet.get_by_label(FIELDS[0], exact=True)).to_have_value('3.01')
    currency.select_option('USD')
    sheet.get_by_role('button', name='Switch to USD and clear amounts', exact=True).click()
    expect(currency).to_have_value('USD')
    for label in FIELDS:
        expect(sheet.get_by_label(label, exact=True)).to_have_value('')
    sheet.get_by_label('Price per unit', exact=True).fill('9')
    assert result(page, 'new-zealand')['status'] == 'incomplete'
    amounts(sheet, ['10', '3', '3'])
    assert result(page, 'new-zealand') == {'status': 'no-positive-margin', 'contributionPerUnit': 0, 'breakEvenUnits': None}
    amounts(sheet, ['0', '2', '0'])
    assert result(page, 'new-zealand')['breakEvenUnits'] == 0
    sheet.get_by_role('button', name='Clear worksheet', exact=True).click()
    sheet.get_by_role('button', name='Cancel', exact=True).click()
    assert result(page, 'new-zealand')['breakEvenUnits'] == 0
    sheet.get_by_role('button', name='Clear worksheet', exact=True).click()
    sheet.get_by_role('button', name='Clear amounts', exact=True).click()
    cleared = export_markets(page)
    assert cleared['new-zealand']['breakEvenScenario'] is None
    assert cleared['new-zealand']['userNextStep'] == OLD_NOTE
    assert cleared['australia']['breakEvenScenario']['inputs']['currency'] == 'AUD'
    assert not errors and not external, [errors, external]
    page.locator('.mph-back').click()
    page.get_by_role('button', name='Deselect Australia', exact=True).click()
    page.locator('.flow-header').get_by_role('link', name='Your plan', exact=True).click()
    assert set(export_markets(page)) == {'new-zealand'}
    page.locator('.mph-back').click()
    page.get_by_role('button', name='Select Australia', exact=True).click()
    page.locator('.flow-header').get_by_role('link', name='Your plan', exact=True).click()
    assert result(page, 'australia')['breakEvenUnits'] == 4
    assert not errors and not external, [errors, external]
    ctx.close()


def session_only(browser):
    ctx, page, errors, external = setup(browser, 390, blocked=True)
    market = 'singapore'
    sheet = open_worksheet(page, market)
    expect(page.locator('.mph-plan-status')).to_contain_text('Session only')
    amounts(sheet, ['90', '40', '10'])
    page.locator('.mph-back').click()
    page.locator('.flow-header').get_by_role('link', name='Your plan', exact=True).click()
    sheet = open_worksheet(page, market)
    expect(sheet.get_by_label('Price per unit', exact=True)).to_have_value('40')
    assert result(page, market)['breakEvenUnits'] == 3
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    sheet.screenshot(path=str(ARTIFACTS / 'singapore-session-390.png'))
    assert not errors and not external, [errors, external]
    ctx.close()


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    try:
        durable(browser)
        session_only(browser)
    finally:
        browser.close()
print('PASS: per-market worksheet, decimals, missing/zero/nonpositive inputs, currency and clear guards, older notes, export, reload and session-only navigation')
