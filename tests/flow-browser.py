"""Cloud smoke test. Uses synthetic research fixtures; no external requests.

Run with the dev server running: python tests/flow-browser.py
Requires the cloud image's Playwright Python package and Chromium.
"""
import json
import os
from datetime import datetime, timezone
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get('FLOW_TEST_URL', 'http://127.0.0.1:5173')
ARTIFACTS = Path(os.environ.get('FLOW_TEST_ARTIFACTS', '/tmp/flow-browser-artifacts'))
ARTIFACTS.mkdir(parents=True, exist_ok=True)
TODAY = datetime.now(timezone.utc).date().isoformat()

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(
        executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox']
    )
    context = browser.new_context(viewport={'width': 1440, 'height': 1000}, accept_downloads=True)
    errors = []
    external_requests = []
    context.on('page', lambda page: page.on('pageerror', lambda error: errors.append(str(error))))

    def restrict_network(route):
        if route.request.url.startswith(BASE) or route.request.url.startswith('data:'):
            route.continue_()
        else:
            external_requests.append(route.request.url.split('?')[0])
            route.abort()

    context.route('**/*', restrict_network)
    page = context.new_page()
    page.goto(BASE, wait_until='networkidle')
    expect(page.get_by_role('heading', name='Find your foothold.')).to_be_visible()
    jakarta = page.get_by_role('article').filter(has=page.get_by_role('heading', name='Jakarta', exact=True))
    manila = page.get_by_role('article').filter(has=page.get_by_role('heading', name='Manila', exact=True))
    expect(jakarta).to_contain_text('Not assessed')
    expect(manila).to_contain_text('0/5 documented')
    page.screenshot(path=str(ARTIFACTS / 'desktop-initial.png'), full_page=True)

    # Back from the first deep link must restore the planner at the bare URL.
    page.get_by_role('link', name='Research library', exact=True).click()
    page.go_back()
    expect(page.get_by_role('heading', name='Find your foothold.')).to_be_visible()

    # Profile/phase context and local restoration.
    page.get_by_label('Business profile', exact=True).select_option('enterprise')
    page.get_by_label('Business phase', exact=True).select_option('expanding')
    page.get_by_label('Industry', exact=True).select_option('professional-services')
    page.get_by_label('What are you building?').fill('Synthetic test fixture: a professional services expansion.')
    page.get_by_label('Planned cash runway', exact=False).fill('18')
    expect(page.get_by_text('Document group governance', exact=False)).to_be_visible()

    # Five documented fixture assessments unlock an explained heuristic.
    for factor in ['demand', 'competition', 'regulation', 'costs', 'talent']:
        page.get_by_label('Factor', exact=True).select_option(factor)
        page.get_by_label('Your assessment', exact=True).select_option('3')
        page.get_by_label('Evidence and reasoning', exact=False).fill(
            'Synthetic browser fixture only; no factual or regulatory claim is made.'
        )
        page.get_by_label('Source URL', exact=True).fill('https://oss.go.id/')
        page.get_by_label('Source observation date').fill(TODAY)
        page.get_by_role('button', name='Save evidence', exact=True).click()
        expect(page.get_by_role('status')).to_contain_text('Evidence saved locally')

    expect(jakarta).to_contain_text('5/5 documented')
    expect(jakarta.locator('.planner-score')).to_contain_text('50')
    expect(jakarta).to_contain_text('Self-reported heuristic')
    expect(manila).to_contain_text('0/5 documented')
    page.reload(wait_until='networkidle')
    expect(page.get_by_label('Business profile', exact=True)).to_have_value('enterprise')
    expect(jakarta).to_contain_text('5/5 documented')

    # An exported snapshot must match the visible scope, score, and limitations.
    with page.expect_download() as download_info:
        page.get_by_role('button', name='Export research').click()
    download = download_info.value
    export_path = ARTIFACTS / 'synthetic-research-export.json'
    download.save_as(export_path)
    exported = json.loads(export_path.read_text())
    assert exported['workspace']['profile']['segment'] == 'enterprise'
    assert exported['assessments'][0]['score'] == 50
    assert exported['assessments'][1]['score'] is None
    assert 'not been independently verified' in exported['limitation']

    # Changing business scope invalidates assessments without losing notes.
    page.get_by_label('Industry', exact=True).select_option('retail')
    expect(jakarta).to_contain_text('0/5 documented')
    page.get_by_label('Factor', exact=True).select_option('demand')
    expect(page.get_by_label('Evidence and reasoning', exact=False)).to_have_value(
        'Synthetic browser fixture only; no factual or regulatory claim is made.'
    )
    expect(page.get_by_text('Current record:', exact=False)).to_contain_text('Business profile changed')

    # Dirty notes must survive a canceled header navigation or factor switch.
    page.get_by_label('Evidence and reasoning', exact=False).fill('Unsaved synthetic fixture, preserve on canceled navigation.')
    page.once('dialog', lambda dialog: dialog.dismiss())
    page.get_by_role('button', name='Market Data', exact=True).click()
    expect(page.get_by_role('heading', name='Find your foothold.')).to_be_visible()
    expect(page.get_by_label('Evidence and reasoning', exact=False)).to_have_value('Unsaved synthetic fixture, preserve on canceled navigation.')
    page.once('dialog', lambda dialog: dialog.dismiss())
    page.get_by_label('Factor', exact=True).select_option('talent')
    expect(page.get_by_label('Factor', exact=True)).to_have_value('demand')
    page.get_by_role('button', name='Save evidence', exact=True).click()

    # Guest auth reports unavailability instead of attempting a network login.
    page.get_by_role('button', name='Sign in', exact=True).click()
    expect(page.get_by_role('dialog', name='Explore as a guest')).to_be_visible()
    page.get_by_role('button', name='Continue exploring').click()

    # Deep links and history retain the existing research entry point.
    page.get_by_role('link', name='Research library', exact=True).click()
    expect(page.get_by_text('Research library · Sources are not independently verified', exact=False)).to_be_visible()
    page.get_by_role('link', name='Entry planner', exact=True).click()
    expect(page.get_by_role('heading', name='Find your foothold.')).to_be_visible()
    page.go_back()
    expect(page.get_by_text('Research library · Sources are not independently verified', exact=False)).to_be_visible()
    page.go_forward()
    expect(page.get_by_role('heading', name='Find your foothold.')).to_be_visible()

    # Layouts and theme. No horizontal page overflow at supported phone/tablet widths.
    for width in [360, 390, 768, 1440]:
        page.set_viewport_size({'width': width, 'height': 844})
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'overflow at {width}'
    page.set_viewport_size({'width': 390, 'height': 844})
    page.get_by_role('button', name='Toggle theme').click()
    expect(page.locator('html')).to_have_class('light')
    page.screenshot(path=str(ARTIFACTS / 'mobile-light.png'), full_page=True)
    page.get_by_role('button', name='Toggle theme').click()
    page.screenshot(path=str(ARTIFACTS / 'mobile-dark.png'), full_page=True)
    assert not errors, f'uncaught browser errors: {errors}'
    assert not external_requests, f'unexpected external requests: {external_requests}'

    # Storage denial must leave the guest workflow usable and report save limitations.
    blocked = browser.new_context(viewport={'width': 390, 'height': 844})
    blocked.add_init_script("Object.defineProperty(window, 'localStorage', {get(){throw new DOMException('Blocked', 'SecurityError')}})")
    blocked_page = blocked.new_page()
    blocked_page.on('pageerror', lambda error: errors.append(str(error)))
    blocked_page.goto(BASE, wait_until='networkidle')
    expect(blocked_page.get_by_role('heading', name='Find your foothold.')).to_be_visible()
    expect(blocked_page.get_by_text('Browser storage unavailable', exact=False)).to_be_visible()
    assert not errors, f'uncaught browser errors: {errors}'
    browser.close()
    print('PASS: profile/evidence scoring, scope invalidation, persistence, export, guest auth, navigation/history, four widths, themes, storage denial; zero external requests or uncaught errors.')
