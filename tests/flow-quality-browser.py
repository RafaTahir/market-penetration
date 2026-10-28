"""Production browser checks for preserved library routes, assets and downloads.

Start `npm run preview -- --host 0.0.0.0 --port 4173 --strictPort` first.
All external requests are blocked; downloaded library data is unverified reference.
"""
import os
import re
import zipfile
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get('FLOW_TEST_URL', 'http://127.0.0.1:4173')
ARTIFACTS = Path(os.environ.get('FLOW_TEST_ARTIFACTS', '/tmp/flow-quality-artifacts'))
ARTIFACTS.mkdir(parents=True, exist_ok=True)
NORMAL_HEADINGS = {
    'main': re.compile(r'Find your next market'),
    'analytics': 'Understand the market.',
    'report-generator': 'Turn research into a brief.',
    'enterprise-intelligence': 'See the bigger picture.',
}
ROUTES = [
    'main', 'live-data', 'analytics', 'reports', 'report-generator',
    'dashboard', 'playground', 'scheduler', 'data-sync', 'enterprise-intelligence',
]

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(
        executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox']
    )
    context = browser.new_context(accept_downloads=True, viewport={'width': 360, 'height': 844})
    errors = []
    context.on('page', lambda page: page.on('pageerror', lambda error: errors.append(str(error))))
    context.route('**/*', lambda route: route.continue_() if route.request.url.startswith(BASE) else route.abort())
    page = context.new_page()

    for route in ROUTES:
        path = '/#/research' if route == 'main' else '/#/research/' + route
        response = page.goto(BASE + path, wait_until='networkidle')
        if response is None:  # Hash navigation is same-document until explicitly reloaded.
            response = page.reload(wait_until='networkidle')
        assert response.status == 200
        if route in ['main', 'analytics', 'report-generator', 'enterprise-intelligence']:
            expect(page.get_by_role('heading', name=NORMAL_HEADINGS[route])).to_be_visible()
            expect(page.locator('[data-content-status="unverified-reference"]')).to_have_count(0)
            expect(page.locator('.market-reference-figures')).to_have_count(0)
            if route == 'main':
                expect(page.locator('.market-country-card')).to_have_count(6)
                expect(page.get_by_role('navigation', name='Research modes').get_by_role('button')).to_have_count(6)
            page.get_by_role('button', name='View unverified reference examples', exact=True).click()
        expect(page.get_by_text('Something went wrong', exact=True)).to_have_count(0)
        if route in ['dashboard', 'scheduler']:
            expect(page.get_by_role('heading', name='An account is required for this workspace')).to_be_visible()
        if route == 'data-sync':
            expect(page.get_by_role('button', name='Sync All Data')).to_be_disabled()
            expect(page.get_by_role('status')).to_contain_text('Refresh is disabled')
        if route == 'live-data':
            expect(page.get_by_text('No stored quotes are available.', exact=False)).to_be_visible(timeout=15000)
            expect(page.get_by_text('No estimated rate has been substituted.', exact=False)).to_be_visible(timeout=15000)
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'Overflow: {route}'
    assert not errors, errors

    manifest = page.request.get(BASE + '/manifest.json').json()
    for icon in manifest['icons']:
        assert page.request.get(BASE + icon['src']).status == 200
    for shortcut in manifest['shortcuts']:
        assert '#/' in shortcut['url']

    # Test the actual preserved export buttons, not just the service functions.
    page.set_viewport_size({'width': 1440, 'height': 1000})
    page.goto(BASE + '/#/research', wait_until='networkidle')
    gate = page.get_by_role('button', name='View unverified reference examples')
    if gate.count(): gate.click()
    for name, extension in [('PDF Report', 'pdf'), ('Pitch Deck', 'pptx'), ('Excel Data', 'xlsx')]:
        page.get_by_role('button', name=re.compile('^' + name + r'\b')).click()
        with page.expect_download(timeout=60000) as download_info:
            page.get_by_role('button', name=re.compile('^Generate Premium')).click()
        download = download_info.value
        destination = ARTIFACTS / ('unverified-library-reference.' + extension)
        download.save_as(destination)
        assert destination.stat().st_size > 1000
        if extension == 'pdf':
            contents = destination.read_bytes()
            assert contents.startswith(b'%PDF-') and b'Unverified reference' in contents
        else:
            with zipfile.ZipFile(destination) as archive:
                expected = 'ppt/presentation.xml' if extension == 'pptx' else 'xl/workbook.xml'
                assert expected in archive.namelist()
                contents = ''.join(
                    archive.read(path).decode(errors='ignore')
                    for path in archive.namelist()
                    if path.endswith('.xml')
                )
                assert 'Unverified reference' in contents
        print(f'PASS: actual {extension.upper()} button downloaded {destination.stat().st_size} bytes')

    # Fresh screenshots contain no test assumptions or completed research claims.
    fresh = context.new_page()
    fresh.set_viewport_size({'width': 1440, 'height': 1000})
    fresh.goto(BASE, wait_until='networkidle')
    expect(fresh.get_by_role('heading', name=re.compile(r'Find your next market'))).to_be_visible()
    expect(fresh.locator('[data-content-status="unverified-reference"]')).to_have_count(0)
    fresh.screenshot(path=str(ARTIFACTS / 'flow-desktop.png'), full_page=True)
    fresh.screenshot(path=str(ARTIFACTS / 'flow-desktop-viewport.png'))
    fresh.set_viewport_size({'width': 390, 'height': 844})
    fresh.screenshot(path=str(ARTIFACTS / 'flow-mobile.png'), full_page=True)
    fresh.screenshot(path=str(ARTIFACTS / 'flow-mobile-viewport.png'))
    fresh.goto(BASE + '/#/plan/notebook', wait_until='networkidle')
    expect(fresh.get_by_role('heading', name='Market workspace', exact=True)).to_be_visible()
    assert not errors, errors
    browser.close()
    print('PASS: 10 production library routes, 360px layouts, guest guards, unavailable sources, manifest assets, PDF/PPTX/XLSX UI downloads, screenshots; no uncaught browser errors.')
