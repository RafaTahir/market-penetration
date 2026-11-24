"""Restore a real export on another browser, with local-only fixture data."""
import json
import os
from copy import deepcopy
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get('FLOW_TEST_URL', 'http://127.0.0.1:4173').rstrip('/')
ARTIFACTS = Path(os.environ.get('FLOW_TEST_ARTIFACTS', '/tmp/flow-plan-restore'))
ARTIFACTS.mkdir(parents=True, exist_ok=True)
PLAN_KEY = 'flow-market-plans-v1'
LIST_KEY = 'flow-market-shortlist-v1'
AUK, SYD = 'new-zealand', 'australia'
EDITED = '2026-10-27T10:19:00.000Z'
SEED = {
    'version': 1,
    'notes': {AUK: {'nextStep': 'Fixture: compare two Auckland lease quotes.', 'updatedAt': EDITED}},
    'questions': {AUK: ['setup'], SYD: ['location']},
    'scenarios': {AUK: {'currency': 'NZD', 'monthlyFixedCosts': '3.01', 'unitPrice': '0.30', 'unitVariableCost': '0.20'}},
}


def start(browser, plans=None, countries=None, blocked=False):
    context = browser.new_context(viewport={'width': 390 if blocked else 1280, 'height': 900},
                                  color_scheme='dark' if blocked else 'light', accept_downloads=True,
                                  reduced_motion='reduce')
    errors = []
    external = []

    def local_only(route):
        if urlsplit(route.request.url).netloc == urlsplit(BASE).netloc:
            route.continue_()
        else:
            external.append(route.request.url.split('?')[0])
            route.abort()

    context.route('**/*', local_only)
    if blocked:
        context.add_init_script("Object.defineProperty(window, 'localStorage', {get() {throw new DOMException('Blocked', 'SecurityError')}})")
    elif plans is not None:
        fixture = {PLAN_KEY: json.dumps(plans), LIST_KEY: json.dumps({'version': 1, 'countries': countries}), 'theme': 'light'}
        context.add_init_script(f"""if (location.origin === {json.dumps(BASE)} && localStorage.getItem('{PLAN_KEY}') === null) {{
            for (const [k, v] of Object.entries({json.dumps(fixture)})) localStorage.setItem(k, v);
        }}""")
    page = context.new_page()
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(f'{BASE}/#/plan', wait_until='networkidle')
    return context, page, errors, external


def finish(context, errors, external):
    assert not errors and not external, [errors, external]
    context.close()


def download(page, save_as=None):
    with page.expect_download() as download_event:
        page.get_by_role('button', name='Export market plan', exact=True).click()
    file = download_event.value
    assert file.suggested_filename == 'flow-market-plan.json'
    if save_as:
        file.save_as(save_as)
    return json.loads(file.path().read_text())


def markets(payload):
    return {row['id']: row for row in payload['markets']}


def choose(page, path):
    page.get_by_role('button', name='Restore market plan', exact=True).click()
    page.get_by_label('Choose a Flow plan file', exact=True).set_input_files(path)


def confirm_button(page):
    return page.get_by_role('button', name='Apply restore', exact=True)


def durable(browser, exported, expected):
    # A different device already has a Singapore plan and conflicting Australian note/worksheet.
    local = {'version': 1, 'notes': {SYD: {'nextStep': 'Fixture: retain the local quote.', 'updatedAt': None}},
             'scenarios': {SYD: {'currency': 'AUD', 'monthlyFixedCosts': '', 'unitPrice': '27', 'unitVariableCost': ''}},
             'questions': {SYD: ['setup']}}
    ctx, page, errors, external = start(browser, local, ['singapore', SYD])
    before = markets(download(page))
    before_state = page.evaluate("([p,s]) => [localStorage.getItem(p),localStorage.getItem(s)]", [PLAN_KEY, LIST_KEY])
    choose(page, exported)
    expect(confirm_button(page)).to_be_enabled()
    expect(page.locator('.mph-market[data-market="new-zealand"]')).to_have_count(0)
    page.get_by_role('button', name='Cancel', exact=True).click()
    assert page.evaluate("([p,s]) => [localStorage.getItem(p),localStorage.getItem(s)]", [PLAN_KEY, LIST_KEY]) == before_state

    # Derived observations and links are resolved by Flow, even if another application changed the exported JSON.
    changed = deepcopy(expected)
    auckland = markets(changed)[AUK]
    auckland['breakEvenScenario']['result']['breakEvenUnits'] = 777777
    auckland['savedResearchQuestions'][0]['question'] = 'Stale external prompt'
    auckland['savedResearchQuestions'][0]['sources'][0]['url'] = 'https://example.invalid/outdated'
    auckland['sources']['businessSetup']['url'] = 'https://example.invalid/outdated'
    incoming_sydney = markets(changed)[SYD]
    incoming_sydney['userNextStep'] = 'Fixture: different note from an older export.'
    incoming_sydney['breakEvenScenario'] = deepcopy(auckland['breakEvenScenario'])
    choose(page, {'name': 'older-saved-plan.json', 'mimeType': 'application/json', 'buffer': json.dumps(changed).encode()})
    expect(confirm_button(page)).to_be_enabled()
    # The recommendation in the preview does not grant permission to replace intervening local edits.
    peer = ctx.new_page()
    peer.goto(BASE, wait_until='networkidle')
    peer.get_by_role('button', name='Select Thailand', exact=True).click()
    peer.goto(f'{BASE}/#/plan', wait_until='networkidle')
    peer.locator(f'.mph-market[data-market="{SYD}"] .mph-next-step summary').click()
    peer.get_by_label('Your next step for Australia').fill('Fixture: edited in another tab during preview.')
    peer.close()
    dialog = page.get_by_role('dialog', name='Restore market plan', exact=True)
    expect(dialog.get_by_text('Keep local note', exact=False)).to_be_visible()
    expect(dialog.get_by_text('Keep local worksheet', exact=False)).to_be_visible()
    expect(dialog.get_by_text('Review changes', exact=True)).to_be_visible()
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    dialog.screenshot(path=str(ARTIFACTS / 'restore-preview-1280.png'))
    confirm_button(page).click()
    expect(page.locator('.mph-market[data-market="new-zealand"]')).to_be_visible()
    page.reload(wait_until='networkidle')
    after = markets(download(page))
    assert set(after) == {'singapore', 'thailand', SYD, AUK}
    assert after[AUK] == markets(expected)[AUK]
    assert after[AUK]['breakEvenScenario']['result']['breakEvenUnits'] == 31
    assert after[SYD]['userNextStep'] == 'Fixture: edited in another tab during preview.'
    assert after[SYD]['breakEvenScenario'] == before[SYD]['breakEvenScenario']
    assert {q['lens'] for q in after[SYD]['savedResearchQuestions']} == {'location', 'setup'}
    assert after['singapore'] == before['singapore']
    choose(page, exported)
    expect(confirm_button(page)).to_be_disabled()
    page.get_by_role('button', name='Cancel', exact=True).click()
    finish(ctx, errors, external)


def session_only(browser, exported, expected):
    ctx, page, errors, external = start(browser, blocked=True)
    default_ids = set(markets(download(page)))
    choose(page, {'name': 'bad.json', 'mimeType': 'application/json', 'buffer': b'incomplete'})
    expect(page.get_by_role('alert')).to_contain_text('JSON')
    page.get_by_label('Choose a Flow plan file', exact=True).set_input_files({
        'name': 'shortlist.json', 'mimeType': 'application/json',
        'buffer': b'{"contentType":"historical-country-snapshot-and-source-directory", "version":1}'})
    expect(page.get_by_role('alert')).to_contain_text('Export market plan')
    expect(confirm_button(page)).to_be_disabled()
    page.get_by_label('Choose a Flow plan file', exact=True).set_input_files(exported)
    expect(confirm_button(page)).to_be_enabled()
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.screenshot(path=str(ARTIFACTS / 'restore-preview-390.png'))
    confirm_button(page).click()
    expect(page.locator('.mph-market[data-market="new-zealand"]')).to_be_visible()
    page.locator('.mph-back').click()
    page.locator('a[href="#/plan"]').first.click()
    after = markets(download(page))
    assert set(after) == default_ids | {AUK, SYD}
    assert all(after[key] == row for key, row in markets(expected).items())
    expect(page.locator('.mph-plan-status')).to_contain_text('Session only')
    finish(ctx, errors, external)


def protected_storage(browser, exported, unknown_version):
    # Editing in a session-only view must not replace unrelated recoverable data on disk.
    initial = {'version': 7, 'futureFields': {'keep': True}} if unknown_version else {'version': 1, 'notes': {}}
    ctx, page, errors, external = start(browser, initial, ['singapore'])
    if not unknown_version:
        page.evaluate("""(key) => {
            const set = Storage.prototype.setItem;
            Storage.prototype.setItem = function(k, value) {
                if (k === key) throw new DOMException('Full', 'QuotaExceededError');
                return set.call(this, k, value);
            };
            window.allowTestWrites = () => { Storage.prototype.setItem = set };
        }""", PLAN_KEY)
        page.locator('.mph-next-step > summary').click()
        page.get_by_label('Your next step for Singapore').fill('Fixture: export this session-only note.')
        expect(page.locator('.mph-plan-status')).to_contain_text('Session only')
        # Another browser tab writes a newer plan before the original tab attempts restore.
        peer = ctx.new_page()
        peer.goto(f'{BASE}/#/plan', wait_until='networkidle')
        peer.locator('.mph-next-step > summary').click()
        peer.get_by_label('Your next step for Singapore').fill('Fixture: retained durable peer note.')
        peer.close()
        page.evaluate('window.allowTestWrites()')
    stored = page.evaluate('(key) => localStorage.getItem(key)', PLAN_KEY)
    if not unknown_version:
        assert json.loads(stored)['notes']['singapore']['nextStep'] == 'Fixture: retained durable peer note.'
    choose(page, exported)
    expect(confirm_button(page)).to_be_enabled()
    confirm_button(page).click()
    expect(page.locator('.mph-plan-status')).to_contain_text('Session only')
    assert page.evaluate('(key) => localStorage.getItem(key)', PLAN_KEY) == stored
    restored = markets(download(page))
    assert restored[AUK]['userNextStep'] == SEED['notes'][AUK]['nextStep']
    if not unknown_version:
        assert restored['singapore']['userNextStep'] == 'Fixture: export this session-only note.'
    finish(ctx, errors, external)


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    try:
        source_ctx, source, errors, external = start(browser, SEED, [AUK, SYD])
        exported = ARTIFACTS / 'flow-market-plan.json'
        expected = download(source, exported)
        finish(source_ctx, errors, external)
        durable(browser, exported, expected)
        session_only(browser, exported, expected)
        protected_storage(browser, exported, False)
        protected_storage(browser, exported, True)
    finally:
        browser.close()
print('PASS: export/restore preview, cancel, preserve conflicts, canonical question sources, recalculated scenario, persistence, session-only restore, quota recovery and unknown local version')
