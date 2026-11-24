"""Synthetic industry fieldwork through discovery, personal plans, paper and restore.

Run against a production preview with FLOW_TEST_URL and FLOW_TEST_ARTIFACTS.
Only this browser's isolated storage is used; non-local requests are blocked.
"""
import json
import os
from pathlib import Path
from urllib.parse import urlsplit

import fitz
from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get('FLOW_TEST_URL', 'http://127.0.0.1:4173').rstrip('/')
ARTIFACTS = Path(os.environ.get('FLOW_TEST_ARTIFACTS', '/tmp/flow-industry-plan'))
PLAN_KEY = 'flow-market-plans-v1'
LIST_KEY = 'flow-market-shortlist-v1'
PROMPT = 'What are the landed cost, fulfilment cost and return rate?'
FINDING = 'Synthetic Canada quote <em>CANADA_ONLY_RETAIL</em> & freight terms; not a market fact.'
SOURCE = 'Synthetic supplier binder <b>REF-CANADA-01</b>; https://example.invalid/quote'
OBSERVED = '2024-02-29'
HIDDEN = 'SyntheticUnselectedUKIndustryNote'
SEED = {
    'version': 3,
    'notes': {'uk': {'nextStep': HIDDEN, 'updatedAt': None}},
    'questions': {'kenya': ['setup']},
    'findings': {},
    'scenarios': {
        market: {'currency': currency, 'monthlyFixedCosts': '30.00', 'unitPrice': '12.50',
                 'unitVariableCost': '7.50', 'expectedMonthlyUnits': units}
        for market, currency, units in [('canada', 'CAD', '3'), ('kenya', 'USD', '10')]
    },
}


def button(scope, name):
    return scope.get_by_role('button', name=name, exact=True)


def start(browser, width, clean=False):
    context = browser.new_context(viewport={'width': width, 'height': 900}, reduced_motion='reduce',
                                  accept_downloads=True, service_workers='block')
    errors, external = [], []

    def guard(route):
        if urlsplit(route.request.url).netloc == urlsplit(BASE).netloc:
            route.continue_()
        else:
            external.append(urlsplit(route.request.url).netloc)
            route.abort()

    context.route('**/*', guard)
    fixture = {LIST_KEY: json.dumps({'version': 1, 'countries': [] if clean else ['canada', 'kenya']})}
    if not clean:
        fixture[PLAN_KEY] = json.dumps(SEED)
    context.add_init_script(f"""if (location.origin === new URL({json.dumps(BASE)}).origin) {{
      for (const [key,value] of Object.entries({json.dumps(fixture)})) {{
        if (localStorage.getItem(key) === null) localStorage.setItem(key,value);
      }}
    }}""")
    page = context.new_page()
    page.set_default_timeout(15000)
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(BASE + '/#/plan', wait_until='networkidle')
    return context, page, errors, external


def export_plan(page, path):
    with page.expect_download() as pending:
        button(page, 'Export market plan').click()
    download = pending.value
    assert download.suggested_filename == 'flow-market-plan.json'
    download.save_as(path)
    return json.loads(path.read_text())


def rows(payload):
    return {market['id']: market for market in payload['markets']}


def plan_question(page, market, question_id):
    return page.locator(f'#question-{market}-{question_id}')


def no_overflow(page):
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')


def check_findings(page, question_id):
    canada = plan_question(page, 'canada', question_id)
    kenya = plan_question(page, 'kenya', question_id)
    expect(canada.locator('.qf-text')).to_have_text(FINDING)
    expect(canada).to_contain_text(SOURCE)
    expect(canada.locator('time')).to_have_attribute('datetime', OBSERVED)
    expect(canada).to_contain_text('User-entered · Unverified')
    expect(canada.locator('.qf-text em, .qf-citation b, .qf-citation a')).to_have_count(0)
    expect(button(kenya, 'Add finding')).to_be_visible()
    expect(kenya.locator('.qf-text')).to_have_count(0)
    expect(page.locator('#question-kenya-setup')).to_be_visible()
    no_overflow(page)


def validate_payload(payload, baseline, question_id):
    assert payload['version'] == 4
    markets = rows(payload)
    assert set(markets) == {'canada', 'kenya'}
    for market, row in markets.items():
        assert row['savedResearchQuestions'] == rows(baseline)[market]['savedResearchQuestions']
        assert row['breakEvenScenario'] == rows(baseline)[market]['breakEvenScenario']
        assert row['sources']['sourcePublicationDate'] is None
        assert row['sources']['sourceContentsVerified'] is False
        assert len(row['savedIndustryQuestions']) == 1
        question = row['savedIndustryQuestions'][0]
        assert question['id'] == question_id and question['industryId'] == 'retail'
        assert question['kind'] == 'unverified-industry-research-prompt'
        assert question['angle'] == 'costs' and question['question'] == PROMPT
        assert question['evidence'] and question['decision']
        # Cost fieldwork asks for the user's quotes, not government price evidence.
        assert question['sources'] == []
        if market == 'canada':
            assert question['userFinding'] == {'kind': 'user-entered-research-finding', 'text': FINDING,
                                               'source': SOURCE, 'observedOn': OBSERVED}
        else:
            assert question['userFinding'] is None
    assert HIDDEN not in json.dumps(payload)


def compare_findings(page, question_id, width):
    comparison = page.locator('details.industry-question-comparison')
    expect(comparison).to_have_count(1)
    assert not comparison.evaluate('(element) => element.open')
    comparison.locator('summary').click()
    expect(comparison.get_by_role('combobox')).to_have_count(0)
    expect(comparison.get_by_role('heading', name=PROMPT, exact=True)).to_be_visible()
    canada = comparison.locator('li[data-market="canada"]')
    kenya = comparison.locator('li[data-market="kenya"]')
    expect(canada).to_contain_text(FINDING)
    expect(canada).to_contain_text(SOURCE)
    expect(canada.locator('time')).to_have_attribute('datetime', OBSERVED)
    expect(kenya).to_contain_text('No finding yet')
    expect(kenya).not_to_contain_text(FINDING)
    no_overflow(page)
    comparison.screenshot(path=str(ARTIFACTS / f'industry-findings-comparison-{width}.png'))
    for _ in range(2):
        canada.get_by_role('link', name='Open question for Canada', exact=True).click()
        expect(plan_question(page, 'canada', question_id)).to_be_focused()
    comparison.locator('summary').click()


def print_brief(page, width):
    opener = button(page, 'Preview plan brief')
    opener.click()
    dialog = page.get_by_role('dialog', name='Market plan brief', exact=True)
    paper = dialog.locator('.mpb-paper')
    canada = paper.locator('.mpb-market[data-market="canada"]')
    kenya = paper.locator('.mpb-market[data-market="kenya"]')
    for market in [canada, kenya]:
        expect(market).to_contain_text(PROMPT)
        expect(market).to_contain_text('Retail')
    expect(canada).to_contain_text(FINDING)
    expect(canada).to_contain_text(SOURCE)
    expect(canada).to_contain_text(OBSERVED)
    expect(kenya).not_to_contain_text(FINDING)
    expect(kenya).to_contain_text('Open question')
    expect(paper.locator('em, b')).to_have_count(0)
    expect(paper).not_to_contain_text(HIDDEN)
    no_overflow(page)
    page.screenshot(path=str(ARTIFACTS / f'industry-brief-{width}.png'))
    path = ARTIFACTS / f'industry-brief-{width}.pdf'
    page.pdf(path=str(path), format='A4', prefer_css_page_size=True, print_background=True,
             display_header_footer=False)
    with fitz.open(path) as pdf:
        text = ' '.join(' '.join(p.get_text() for p in pdf).split())
        for token in [PROMPT, FINDING, SOURCE, OBSERVED, 'Canada', 'Kenya', 'CAD', 'USD', 'Open question']:
            assert token in text, (path, token)
        for token in [HIDDEN, 'Save finding', 'Open city notebook', 'Restore market plan']:
            assert token not in text, (path, token)
        assert text.count(FINDING) == 1
        page_count = len(pdf)
    page.keyboard.press('Escape')
    expect(opener).to_be_focused()
    return page_count


def journey(browser, width):
    context, page, errors, external = start(browser, width)
    try:
        baseline = export_plan(page, ARTIFACTS / f'legacy-city-worksheet-{width}.json')
        assert baseline['version'] == 3
        expect(page.locator('details.industry-question-comparison')).to_have_count(0)
        page.locator('.mph-back').click()
        button(page.get_by_role('navigation', name='Research modes'), 'Industry Deep Dive').click()
        industries = page.get_by_role('group', name='Choose an industry')
        expect(industries.get_by_role('button')).to_have_count(6)
        question_ids = set()
        for index in range(6):
            industries.get_by_role('button').nth(index).click()
            angles = page.locator('.mr-angle')
            expect(angles).to_have_count(3)
            for angle in angles.all():
                expect(angle.locator('li[data-question]')).to_have_count(2)
            ids = page.locator('.mr-angle li[data-question]').evaluate_all('(els) => els.map(el => el.dataset.question)')
            assert len(set(ids)) == 6 and not question_ids.intersection(ids)
            question_ids.update(ids)
        assert len(question_ids) == 36
        button(industries, 'Retail').click()
        target = page.locator('.mr-angle li[data-question]').filter(has_text=PROMPT)
        expect(target).to_have_count(1)
        question_id = target.get_attribute('data-question')
        angle = target.locator('xpath=ancestor::details[1]')
        if not angle.evaluate('(el) => el.open'):
            angle.locator('summary').click()
        market_select = page.get_by_role('combobox', name='Research in', exact=True)
        for market in ['canada', 'kenya']:
            market_select.select_option(market)
            button(target, 'Save question').click()
            expect(target.get_by_role('link', name='Open in plan', exact=True)).to_be_visible()
        market_select.select_option('canada')
        target.get_by_role('link', name='Open in plan', exact=True).click()
        canada = plan_question(page, 'canada', question_id)
        expect(canada).to_be_focused()
        button(canada, 'Add finding').click()
        canada.get_by_label('Finding', exact=True).fill(FINDING)
        canada.get_by_label('Source (optional)', exact=True).fill(SOURCE)
        canada.get_by_label('Observation date (optional)', exact=True).fill(OBSERVED)
        button(canada, 'Save finding').click()
        check_findings(page, question_id)
        page.reload(wait_until='networkidle')
        check_findings(page, question_id)
        compare_findings(page, question_id, width)
        path = ARTIFACTS / f'industry-plan-{width}.json'
        exported = export_plan(page, path)
        validate_payload(exported, baseline, question_id)
        assert page.evaluate('(key) => JSON.parse(localStorage.getItem(key)).version', PLAN_KEY) == 4
        canada.screenshot(path=str(ARTIFACTS / f'canada-retail-finding-{width}.png'))
        pdf_pages = print_brief(page, width)
        assert not errors and not external, (errors, external)
    finally:
        context.close()

    # A second, clean browser starts with no selected markets or personal plan.
    context, page, errors, external = start(browser, width, clean=True)
    try:
        expect(page.get_by_role('heading', name='Choose the markets for your plan.', exact=True)).to_be_visible()
        button(page, 'Restore market plan').click()
        dialog = page.get_by_role('dialog', name='Restore market plan', exact=True)
        dialog.get_by_label('Choose a Flow plan file', exact=True).set_input_files(path)
        expect(button(dialog, 'Apply restore')).to_be_enabled()
        dialog.screenshot(path=str(ARTIFACTS / f'industry-restore-preview-{width}.png'))
        button(dialog, 'Apply restore').click()
        check_findings(page, question_id)
        page.reload(wait_until='networkidle')
        check_findings(page, question_id)
        restored = export_plan(page, ARTIFACTS / f'industry-restored-{width}.json')
        assert rows(restored) == rows(exported)
        validate_payload(restored, baseline, question_id)
        assert not errors and not external, (errors, external)
        return {'width': width, 'industryQuestionIds': sorted(question_ids), 'pdfPages': pdf_pages,
                'restoredMarkets': list(rows(restored)), 'passed': True}
    finally:
        context.close()


if __name__ == '__main__':
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
                                             args=['--no-sandbox'])
        try:
            results = [journey(browser, width) for width in [320, 1440]]
        finally:
            browser.close()
    (ARTIFACTS / 'results.json').write_text(json.dumps(results, indent=2) + '\n')
    print('PASS: 36 industry question IDs; separate Canada/Kenya retail findings; dates/plain text; '
          'v4 export/restore/reload; existing city question and CAD/USD worksheets; actual PDF; 320/1440px')
    print(f'Artifacts: {ARTIFACTS}')
