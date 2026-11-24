"""Follow a personal research finding from an explorer question to a restored plan."""
import json
import os
import re
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get('FLOW_TEST_URL', 'http://127.0.0.1:4173').rstrip('/')
ARTIFACTS = Path(os.environ.get('FLOW_TEST_ARTIFACTS', '/tmp/flow-findings'))
NOTEBOOK_KEY = 'flow-entry-planner-v1'
QUESTION = 'Jakarta province or a wider commuter catchment?'
TEXT = 'Fixture: both interviewees described their deliveries as local to their district.'
SOURCE = 'https://example.invalid/interview-notes/jakarta'
OBSERVED = '2024-08-19'
FUTURE = '2099-08-19'
FINDING = {'kind': 'user-entered-research-finding', 'text': TEXT, 'source': SOURCE, 'observedOn': OBSERVED}


def open_context(browser, width, *, blocked=False, notebook=False):
    context = browser.new_context(viewport={'width': width, 'height': 900}, reduced_motion='reduce',
                                  color_scheme='dark' if width < 600 else 'light', accept_downloads=True)
    errors, external = [], []
    context.on('page', lambda page: page.on('pageerror', lambda error: errors.append(str(error))))

    def local_only(route):
        if urlsplit(route.request.url).netloc == urlsplit(BASE).netloc:
            route.continue_()
        else:
            external.append(route.request.url)
            route.abort()

    context.route('**/*', local_only)
    if blocked:
        context.add_init_script("Object.defineProperty(window, 'localStorage', {get(){throw new DOMException('Blocked', 'SecurityError')}})")
    else:
        fixture = {'theme': 'dark' if width < 600 else 'light'}
        if notebook:
            # Represent a prior, already-scored research notebook independent of the shortlist.
            evidence = {
                'rating': 3, 'note': 'Synthetic prior notebook evidence for regression coverage.',
                'sourceUrl': 'https://example.invalid/notebook',
                'observedOn': datetime.now(timezone.utc).date().isoformat(),
                'profileContext': '["founder","exploring","technology",""]',
            }
            fixture[NOTEBOOK_KEY] = json.dumps({'version': 1, 'evidence': {'jakarta': {
                factor: evidence for factor in ('demand', 'competition', 'regulation', 'costs', 'talent')
            }}})
        context.add_init_script(f"""if (location.origin === {json.dumps(BASE)}) {{
            for (const [key, value] of Object.entries({json.dumps(fixture)})) {{
                if (localStorage.getItem(key) === null) localStorage.setItem(key, value);
            }}
        }}""")
    return context, context.new_page(), errors, external


def button(scope, name):
    return scope.get_by_role('button', name=name, exact=True)


def question(page):
    return page.locator('.mph-market[data-market="indonesia"] li').filter(has=page.get_by_text(QUESTION, exact=True))


def download(page, destination=None):
    with page.expect_download() as event:
        button(page, 'Export market plan').click()
    export = event.value
    assert export.suggested_filename == 'flow-market-plan.json'
    if destination:
        export.save_as(destination)
    return json.loads(export.path().read_text())


def jakarta_questions(export):
    market = next(m for m in export['markets'] if m['id'] == 'indonesia')
    return market['savedResearchQuestions']


def restore_preview(page, file, *, can_apply=True):
    button(page, 'Restore market plan').click()
    dialog = page.get_by_role('dialog', name='Restore market plan')
    dialog.get_by_label('Choose a Flow plan file').set_input_files(file)
    expect(button(dialog, 'Apply restore')).to_be_enabled(enabled=can_apply)
    return dialog


def read_finding(row):
    expect(row.get_by_text(TEXT, exact=True)).to_be_visible()
    expect(row).to_contain_text(re.compile(r'user-entered.*unverified', re.I))
    expect(row.get_by_text(SOURCE, exact=True)).to_be_visible()
    expect(row.locator(f'a[href="{SOURCE}"]')).to_have_count(0)
    expect(button(row, f'Remove question: {QUESTION}')).to_have_count(0)


def close_context(context, errors, external):
    assert not errors, errors
    assert not external, external
    context.close()


def check_notebook(page):
    jakarta = page.get_by_role('article').filter(has=page.get_by_role('heading', name='Jakarta', exact=True))
    expect(jakarta).to_contain_text('5/5 documented')
    expect(jakarta.locator('.planner-score')).to_contain_text('50')
    manila = page.get_by_role('article').filter(has=page.get_by_role('heading', name='Manila', exact=True))
    expect(manila).to_contain_text('0/5 documented')
    return page.evaluate('(key) => JSON.parse(localStorage.getItem(key))', NOTEBOOK_KEY)


def capture_and_edit(browser, file):
    ctx, page, errors, external = open_context(browser, 1280, notebook=True)
    confirmations = []

    def stay_on_page(dialog):
        confirmations.append(dialog.message)
        dialog.dismiss()

    page.on('dialog', stay_on_page)
    page.goto(BASE + '/#/plan/notebook', wait_until='networkidle')
    previous_notebook = check_notebook(page)
    page.get_by_role('link', name='Explore markets', exact=True).click()
    button(page, 'Add Indonesia to shortlist and explore').click()
    city = page.locator('#city-research-indonesia')
    expect(city).to_contain_text(QUESTION)
    button(city, 'Save question').click()
    city.get_by_role('link', name='Add finding in plan', exact=True).click()
    row = question(page)
    expect(row).to_be_focused()
    button(row, 'Add finding').click()
    row.get_by_label('Finding', exact=True).fill(TEXT)
    row.get_by_label('Source (optional)', exact=True).fill(SOURCE)
    observed = row.get_by_label('Observation date (optional)', exact=True)
    observed.fill(FUTURE)
    button(row, 'Save finding').click()
    expect(row).to_contain_text('Choose today or an earlier date')
    assert observed.evaluate('input => input.validity.rangeOverflow')
    expect(observed).to_be_visible()
    observed.fill(OBSERVED)
    button(row, 'Save finding').click()
    read_finding(row)
    page.reload(wait_until='networkidle')
    read_finding(row)
    page.locator('.mph-back').click()
    button(page, 'City Analysis').click()
    assert not confirmations
    expect(button(city, 'Saved to plan')).to_have_count(0)
    city.get_by_role('link', name='View finding in plan', exact=True).click()
    expect(row).to_be_focused()
    row.evaluate("node => node.scrollIntoView({block: 'center', behavior: 'instant'})")
    row.screenshot(path=str(ARTIFACTS / 'saved-finding-1280.png'))
    page.screenshot(path=str(ARTIFACTS / 'saved-plan-1280.png'))
    exported = download(page, file)
    assert exported['version'] == 2
    saved, = jakarta_questions(exported)
    assert saved['userFinding'] == FINDING
    assert saved['kind'] == 'unverified-research-prompt'
    assert [s['url'] for s in saved['sources']] == ['https://www.bps.go.id/']

    button(row, 'Edit finding').click()
    draft = 'Fixture: my first tab has an unsaved revision.'
    row.get_by_label('Finding', exact=True).fill(draft)
    assert jakarta_questions(download(page))[0]['userFinding'] == FINDING
    expect(page.locator('.mph-file-feedback')).to_contain_text('Save your open finding edits')
    with page.expect_event('dialog'):
        page.locator('.mph-back').click()
    expect(row.get_by_label('Finding', exact=True)).to_have_value(draft)
    assert confirmations == ['Leave without saving your finding edits?']
    peer = ctx.new_page()
    peer.goto(BASE + '/#/plan', wait_until='networkidle')
    peer_row = question(peer)
    peer_text = 'Fixture: the second tab saved a newer interview summary.'
    button(peer_row, 'Edit finding').click()
    peer_row.get_by_label('Finding', exact=True).fill(peer_text)
    button(peer_row, 'Save finding').click()
    expect(peer_row.get_by_text(peer_text, exact=True)).to_be_visible()

    button(row, 'Save finding').click()
    expect(row.get_by_role('alert')).to_contain_text('changed in another tab')
    expect(row.get_by_label('Finding', exact=True)).to_have_value(draft)
    assert jakarta_questions(download(peer))[0]['userFinding'] == {**FINDING, 'text': peer_text}
    button(row, 'Open latest version').click()
    expect(row.get_by_label('Finding', exact=True)).to_have_value(peer_text)
    button(row, 'Cancel').click()
    peer.close()
    dialog = restore_preview(page, file, can_apply=False)
    expect(dialog).to_contain_text('Keep 1 local finding')
    dialog.get_by_text('View file details', exact=True).click()
    expect(dialog.get_by_text(TEXT, exact=True)).to_be_visible()
    expect(dialog.get_by_text(peer_text, exact=True)).to_be_visible()
    button(dialog, 'Cancel').click()
    page.get_by_role('link', name='Open city notebook', exact=True).click()
    assert check_notebook(page) == previous_notebook
    close_context(ctx, errors, external)
    return exported


def restore_on_phone(browser, file, exported):
    ctx, page, errors, external = open_context(browser, 390)
    page.goto(BASE + '/#/plan', wait_until='networkidle')
    # An export from before findings existed restores its saved prompt without manufacturing a finding.
    older = deepcopy(exported)
    older['version'] = 1
    del jakarta_questions(older)[0]['userFinding']
    dialog = restore_preview(page, {'name': 'earlier-plan.json', 'mimeType': 'application/json',
                                    'buffer': json.dumps(older).encode()})
    button(dialog, 'Apply restore').click()
    row = question(page)
    expect(button(row, 'Add finding')).to_be_visible()
    old_restored = download(page)
    assert old_restored['version'] == 1
    assert jakarta_questions(old_restored)[0]['userFinding'] is None

    dialog = restore_preview(page, file)
    expect(dialog).to_contain_text('Add 1 finding')
    dialog.get_by_text('View file details', exact=True).click()
    expect(dialog).to_contain_text(TEXT)
    expect(dialog).to_contain_text(SOURCE)
    expect(dialog).to_contain_text(OBSERVED)
    expect(dialog.locator(f'a[href="{SOURCE}"]')).to_have_count(0)
    button(dialog, 'Apply restore').click()
    page.reload(wait_until='networkidle')
    read_finding(row)
    assert jakarta_questions(download(page)) == jakarta_questions(exported)
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    row.evaluate("node => node.scrollIntoView({block: 'center', behavior: 'instant'})")
    row.screenshot(path=str(ARTIFACTS / 'restored-finding-390.png'))
    page.screenshot(path=str(ARTIFACTS / 'restored-plan-390.png'))
    button(row, 'Delete finding').click()
    button(row, 'Cancel').click()
    read_finding(row)
    button(row, 'Delete finding').click()
    button(row, 'Confirm delete').click()
    expect(button(row, 'Add finding')).to_be_visible()
    assert jakarta_questions(download(page))[0]['userFinding'] is None
    button(row, f'Remove question: {QUESTION}').click()
    expect(row).to_have_count(0)
    assert jakarta_questions(download(page)) == []
    close_context(ctx, errors, external)


def session_only(browser, file):
    ctx, page, errors, external = open_context(browser, 390, blocked=True)
    page.goto(BASE + '/#/plan', wait_until='networkidle')
    future_import = json.loads(file.read_text())
    jakarta_questions(future_import)[0]['userFinding']['observedOn'] = FUTURE
    dialog = restore_preview(page, {'name': 'future-observation.json', 'mimeType': 'application/json',
                                    'buffer': json.dumps(future_import).encode()})
    button(dialog, 'Apply restore').click()
    row = question(page)
    expect(page.locator('.mph-plan-status')).to_contain_text('Session only')
    expect(row).to_contain_text('future date · check source')
    assert jakarta_questions(download(page))[0]['userFinding']['observedOn'] == FUTURE
    button(row, 'Edit finding').click()
    row.get_by_label('Source (optional)', exact=True).fill('')
    row.get_by_label('Observation date (optional)', exact=True).fill('')
    button(row, 'Save finding').click()
    page.locator('.mph-back').click()
    page.locator('a[href="#/plan"]').first.click()
    expect(row.get_by_text(TEXT, exact=True)).to_be_visible()
    expect(row).to_contain_text(re.compile('unknown', re.I))
    result = jakarta_questions(download(page))[0]['userFinding']
    assert result['kind'] == FINDING['kind'] and result['text'] == TEXT
    assert not result['source'] and result['observedOn'] is None
    page.reload(wait_until='networkidle')
    expect(row).to_have_count(0)
    close_context(ctx, errors, external)


ARTIFACTS.mkdir(parents=True, exist_ok=True)
with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    try:
        file = ARTIFACTS / 'personal-finding-plan.json'
        exported = capture_and_edit(browser, file)
        restore_on_phone(browser, file, exported)
        session_only(browser, file)
    finally:
        browser.close()
print('PASS: city prompt to personal finding, plain citation, dated and unknown observations, stale-tab draft, '
      'scored notebook isolation, older exports, download/restore, safe deletion and session-only navigation')
