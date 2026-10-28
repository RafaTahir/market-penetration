"""Cloud workspace regression. Explicit synthetic fixtures, no external requests.

Run with a dev or production preview server: python tests/flow-browser.py
FLOW_TEST_URL overrides localhost:5173. Requires Playwright and Chromium.
"""
import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get('FLOW_TEST_URL', 'http://127.0.0.1:5173')
ARTIFACTS = Path(os.environ.get('FLOW_TEST_ARTIFACTS', '/tmp/flow-browser-artifacts'))
ARTIFACTS.mkdir(parents=True, exist_ok=True)
TODAY = datetime.now(timezone.utc).date().isoformat()

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
    context = browser.new_context(viewport={'width': 1440, 'height': 1000}, accept_downloads=True)
    errors, external_requests = [], []
    context.on('page', lambda page: page.on('pageerror', lambda error: errors.append(str(error))))

    def restrict_network(route):
        if route.request.url.startswith(BASE) or route.request.url.startswith('data:'):
            route.continue_()
        else:
            external_requests.append(route.request.url.split('?')[0])
            route.abort()

    context.route('**/*', restrict_network)
    page = context.new_page()
    page.goto(BASE + '/#/plan/notebook', wait_until='networkidle')
    expect(page.get_by_role('heading', name='Market workspace', exact=True)).to_be_visible()
    jakarta = page.get_by_role('article').filter(has=page.get_by_role('heading', name='Jakarta', exact=True))
    manila = page.get_by_role('article').filter(has=page.get_by_role('heading', name='Manila', exact=True))
    expect(jakarta).to_contain_text('Not assessed')
    expect(manila).to_contain_text('0/5 documented')
    page.screenshot(path=str(ARTIFACTS / 'desktop-initial.png'), full_page=True)

    # A first deep link and browser back retain the explicit plan workspace.
    page.get_by_role('link', name='Explore markets', exact=True).click()
    expect(page.get_by_role('heading', name=re.compile('Find your next market'))).to_be_visible()
    page.go_back()
    expect(page.get_by_role('heading', name='Market workspace', exact=True)).to_be_visible()

    # Native profile drawer edits existing storage/profile schema.
    page.get_by_role('button', name='Edit business profile', exact=True).click()
    expect(page.get_by_role('dialog', name='Business profile', exact=True)).to_be_visible()
    page.get_by_role('combobox', name='Business profile', exact=True).select_option('enterprise')
    page.get_by_label('Business phase', exact=True).select_option('expanding')
    page.get_by_label('Industry', exact=True).select_option('professional-services')
    page.get_by_label('What are you building?').fill('Synthetic test fixture: a professional services expansion.')
    page.get_by_label('Planned cash runway', exact=False).fill('18')
    page.get_by_text('What to focus on', exact=False).click()
    expect(page.get_by_text('Document group governance', exact=False)).to_be_visible()
    page.get_by_role('button', name='Done', exact=True).click()

    # Five documented fixture assessments unlock the same explained heuristic.
    page.locator('.comparison-lane[data-city="jakarta"]').first.click()
    for factor in ['demand', 'competition', 'regulation', 'costs', 'talent']:
        page.get_by_label('Factor', exact=True).select_option(factor)
        page.get_by_label('Your assessment', exact=True).select_option('3')
        page.get_by_label('Evidence and reasoning', exact=False).fill('Synthetic browser fixture only; no factual or regulatory claim is made.')
        page.get_by_label('Source URL', exact=True).fill('https://oss.go.id/')
        page.get_by_label('Source observation date', exact=True).fill(TODAY)
        page.get_by_role('button', name='Save evidence', exact=True).click()
        expect(page.get_by_role('status')).to_contain_text('Evidence updated. Documented')
    page.get_by_role('button', name='Close details').click()
    expect(jakarta).to_contain_text('5/5 documented')
    expect(jakarta.locator('.planner-score')).to_contain_text('50')
    expect(jakarta).to_contain_text('self-reported')
    expect(manila).to_contain_text('0/5 documented')
    page.reload(wait_until='networkidle')
    expect(jakarta).to_contain_text('5/5 documented')
    page.get_by_role('button', name='Edit business profile', exact=True).click()
    expect(page.get_by_role('combobox', name='Business profile', exact=True)).to_have_value('enterprise')
    page.get_by_role('button', name='Done', exact=True).click()

    # Download still includes the exact saved scope, score and limitations.
    with page.expect_download() as download_info:
        page.get_by_role('button', name='Export research').click()
    export_path = ARTIFACTS / 'synthetic-research-export.json'
    download_info.value.save_as(export_path)
    exported = json.loads(export_path.read_text())
    assert exported['workspace']['profile']['segment'] == 'enterprise'
    assert exported['workspace']['version'] == 1
    assert exported['assessments'][0]['score'] == 50
    assert exported['assessments'][1]['score'] is None
    assert 'not been independently verified' in exported['limitation']

    # Scope changes keep notes while invalidating their prior qualification.
    page.get_by_role('button', name='Edit business profile', exact=True).click()
    page.get_by_label('Industry', exact=True).select_option('retail')
    page.get_by_role('button', name='Done', exact=True).click()
    expect(jakarta).to_contain_text('0/5 documented')
    page.locator('.comparison-lane[data-city="jakarta"]').first.click()
    expect(page.get_by_label('Evidence and reasoning', exact=False)).to_have_value('Synthetic browser fixture only; no factual or regulatory claim is made.')
    page.get_by_text('Why this check is not plotted', exact=False).click()
    expect(page.get_by_text('Current record:', exact=False)).to_contain_text('Business profile changed')

    # Native modal makes the background inert. Cancel close/scope/navigation
    # confirmations must preserve dirty text instead of silently discarding it.
    unsaved = 'Unsaved synthetic fixture, preserve on canceled navigation.'
    page.get_by_label('Evidence and reasoning', exact=False).fill(unsaved)
    page.once('dialog', lambda dialog: dialog.dismiss())
    page.keyboard.press('Escape')
    expect(page.get_by_role('dialog', name='Demand', exact=True)).to_be_visible()
    expect(page.get_by_label('Evidence and reasoning', exact=False)).to_have_value(unsaved)
    page.once('dialog', lambda dialog: dialog.dismiss())
    page.get_by_label('Factor', exact=True).select_option('talent')
    expect(page.get_by_label('Factor', exact=True)).to_have_value('demand')
    page.once('dialog', lambda dialog: dialog.dismiss())
    page.evaluate("window.location.hash = '/research/live-data'")
    expect(page.get_by_role('heading', name='Market workspace', exact=True)).to_be_visible()
    expect(page.get_by_label('Evidence and reasoning', exact=False)).to_have_value(unsaved)
    page.once('dialog', lambda dialog: dialog.dismiss())
    page.evaluate("window.location.hash = ''")
    page.wait_for_function("location.hash === '#/plan/notebook'")
    expect(page.get_by_label('Evidence and reasoning', exact=False)).to_have_value(unsaved)
    page.once('dialog', lambda dialog: dialog.dismiss())
    page.evaluate("window.location.hash = '/plan'")
    page.wait_for_function("location.hash === '#/plan/notebook'")
    expect(page.get_by_label('Evidence and reasoning', exact=False)).to_have_value(unsaved)
    page.get_by_role('button', name='Save evidence', exact=True).click()
    page.get_by_role('button', name='Close details').click()

    # Unconfigured account services retain the guest path without network login.
    page.get_by_role('button', name='Sign in', exact=True).click()
    expect(page.get_by_role('dialog', name='Explore as a guest')).to_be_visible()
    page.get_by_role('button', name='Continue exploring').click()
    page.get_by_role('link', name='Explore markets', exact=True).click()
    expect(page.get_by_role('heading', name=re.compile('Find your next market'))).to_be_visible()
    page.locator('.flow-header').get_by_role('link', name='Your plan', exact=True).click()
    expect(page.get_by_role('heading', name='Your market plan.', exact=True)).to_be_visible()
    page.get_by_role('link', name='Open city notebook', exact=True).click()
    expect(page.get_by_role('heading', name='Market workspace', exact=True)).to_be_visible()
    page.go_back()
    expect(page.get_by_role('heading', name='Your market plan.', exact=True)).to_be_visible()
    page.go_back()
    expect(page.get_by_role('heading', name=re.compile('Find your next market'))).to_be_visible()
    page.go_forward()
    expect(page.get_by_role('heading', name='Your market plan.', exact=True)).to_be_visible()
    page.go_forward()
    expect(page.get_by_role('heading', name='Market workspace', exact=True)).to_be_visible()

    for width in [360, 390, 768, 1440]:
        page.set_viewport_size({'width': width, 'height': 844})
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'overflow at {width}'
    page.set_viewport_size({'width': 390, 'height': 844})
    expect(page.locator('html')).to_have_class('dark')
    page.screenshot(path=str(ARTIFACTS / 'mobile-dark.png'), full_page=True)
    page.get_by_role('button', name='More options', exact=True).click()
    page.get_by_role('menuitem', name='Toggle theme').click()
    page.keyboard.press('Escape')
    expect(page.locator('html')).to_have_class('light')
    page.screenshot(path=str(ARTIFACTS / 'mobile-light.png'), full_page=True)
    assert not errors, f'uncaught browser errors: {errors}'
    assert not external_requests, f'unexpected external requests: {external_requests}'

    blocked = browser.new_context(viewport={'width': 390, 'height': 844})
    blocked.add_init_script("Object.defineProperty(window, 'localStorage', {get(){throw new DOMException('Blocked', 'SecurityError')}})")
    blocked_page = blocked.new_page()
    blocked_page.on('pageerror', lambda error: errors.append(str(error)))
    blocked_page.goto(BASE + '/#/plan/notebook', wait_until='networkidle')
    expect(blocked_page.get_by_role('heading', name='Market workspace', exact=True)).to_be_visible()
    expect(blocked_page.get_by_text('Browser storage unavailable', exact=False)).to_be_visible()
    blocked_page.get_by_role('button', name='Edit business profile', exact=True).click()
    expect(blocked_page.get_by_text('Session only — export to keep', exact=True)).to_be_visible()
    blocked_page.get_by_role('button', name='Done', exact=True).click()
    assert not errors, f'uncaught browser errors: {errors}'
    browser.close()
    print('PASS: drawer profile/evidence, qualification, scope invalidation, persistence, export, dirty guards, guest auth, history, four widths, themes, storage denial; zero external requests or uncaught errors.')
