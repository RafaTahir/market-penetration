"""Check the production preview's opt-in exports. Requires Chromium, Playwright and pdftotext."""
import os
import re
import subprocess
import zipfile
from pathlib import Path
from urllib.parse import urlsplit
from xml.etree import ElementTree as ET

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get('FLOW_TEST_URL', 'http://127.0.0.1:4173').rstrip('/')
ARTIFACTS = Path(os.environ.get('FLOW_TEST_ARTIFACTS', '/tmp/flow-deferred-exports'))
FORMATS = (
    ('PDF Report', 'PDF', 'pdf', 'enhancedPDFService'),
    ('Excel Data', 'EXCEL', 'xlsx', 'enhancedExcelService'),
    ('Pitch Deck', 'PPT', 'pptx', 'enhancedPPTXService'),
)


def document_text(path):
    assert path.read_bytes().startswith(b'%PDF-'), path.name
    pages = subprocess.run(['pdftotext', str(path), '-'], check=True, capture_output=True).stdout.decode('utf-8')
    return [' '.join(page.lower().split()) for page in pages.split('\f') if page.strip()]


def inspect_download(path, *, template=None):
    if path.suffix == '.pdf':
        pages = document_text(path)
        assert len(pages) > 1
        if template:
            for page in pages:
                assert template in page and 'observedat: unavailable' in page and 'export creation only' in page
        else:
            report = ' '.join(pages)
            for phrase in ('unverified reference', 'not an observation date', 'stock quotes unavailable',
                           'fx rates unavailable', 'export time only'):
                assert phrase in report, phrase
        return len(pages)

    with zipfile.ZipFile(path) as archive:
        assert archive.testzip() is None
        names = archive.namelist()
        if path.suffix == '.xlsx':
            workbook = ET.fromstring(archive.read('xl/workbook.xml'))
            sheet_names = [sheet.get('name') for sheet in workbook.findall('.//{*}sheet')]
            assert {'Market Reference', 'Data Provenance'} <= set(sheet_names)
            files = [name for name in names if name.startswith('xl/worksheets/') and name.endswith('.xml')]
            if 'xl/sharedStrings.xml' in names:
                files.append('xl/sharedStrings.xml')
            expected = ('unverified reference', 'no supplied observations', 'observedat', 'retrievedat')
        else:
            assert path.suffix == '.pptx' and 'ppt/presentation.xml' in names
            slides = [name for name in names if re.fullmatch(r'ppt/slides/slide\d+\.xml', name)]
            assert len(slides) > 1
            layouts = [name for name in names if re.fullmatch(r'ppt/slideLayouts/slideLayout\d+\.xml', name)]
            files = slides + layouts
            expected = ('unverified reference', 'data provenance and limits', 'export time only',
                        'stock quotes unavailable', 'fx rates unavailable')
        visible = ' '.join(' '.join(ET.fromstring(archive.read(file)).itertext()) for file in files).lower()
        for phrase in expected:
            assert phrase in visible, f'{path.name} lacks {phrase}'


def session(browser, fail_path=None):
    context = browser.new_context(accept_downloads=True, viewport={'width': 1280, 'height': 900}, reduced_motion='reduce')
    requested, failed, external, errors = [], [], [], []
    context.on('page', lambda page: page.on('pageerror', lambda exc: errors.append(str(exc))))

    def route_local(route):
        url = urlsplit(route.request.url)
        if url.netloc != urlsplit(BASE).netloc:
            external.append(url.netloc)
            route.abort()
            return
        requested.append(url.path)
        if url.path == fail_path and not failed:
            failed.append(url.path)
            route.abort('failed')
        else:
            route.continue_()

    context.route('**/*', route_local)
    return context, requested, failed, external, errors


def opt_in(page, path):
    page.goto(BASE + path, wait_until='networkidle')
    expect(page.get_by_role('heading', name='Reference report studio')).to_have_count(0)
    expect(page.get_by_role('heading', name='Professional Report Generator')).to_have_count(0)
    page.get_by_role('button', name='View unverified reference examples', exact=True).click()


def download(page, trigger, label, extension):
    with page.expect_download(timeout=60000) as event:
        trigger.click()
    file = event.value
    assert file.suggested_filename.lower().endswith('.' + extension), file.suggested_filename
    destination = ARTIFACTS / (label + '.' + extension)
    file.save_as(destination)
    return destination


def studio_action(page, name, token):
    studio = page.locator('.explorer-export-section')
    studio.get_by_role('button', name=re.compile('^' + name + r'\b')).click()
    return studio.get_by_role('button', name=f'Generate Premium {token} Report', exact=True)


def verify_exports(browser):
    context, requested, _, external, errors = session(browser)
    page = context.new_page()
    for route in ('dashboard', 'scheduler'):
        page.goto(f'{BASE}/#/research/{route}', wait_until='networkidle')
        expect(page.get_by_role('heading', name='An account is required for this workspace')).to_be_visible()
    opt_in(page, '/#/research')
    expect(page.get_by_role('heading', name='Reference report studio')).to_be_visible()
    workbook_path = None
    for name, token, extension, service in FORMATS:
        action = studio_action(page, name, token)
        assert not any(service in path for path in requested), f'{service} loaded before generation'
        path = download(page, action, 'studio-' + extension, extension)
        inspect_download(path)
        fetched = {path for path in requested if service in path and path.endswith('.js')}
        assert len(fetched) == 1, (service, fetched)
        if extension == 'xlsx':
            workbook_path, = fetched

    # The separate template page ships PDF decks; only the studio Pitch Deck is a PowerPoint file.
    page = context.new_page()
    opt_in(page, '/#/research/report-generator')
    for action, name, footer in (
        ('Generate Report', 'written-template', 'illustrative planning example'),
        ('Generate Deck', 'presentation-template', 'illustrative template'),
        ('Generate Pro Deck', 'professional-template', 'illustrative template'),
    ):
        path = download(page, page.get_by_role('button', name=action, exact=True), name, 'pdf')
        count = inspect_download(path, template=footer)
        print(f'{action}: {count} PDF pages retained source and date limits')
    assert not errors, errors
    if external:
        print('Offline export check blocked requests to ' + ', '.join(sorted(set(external))))
    context.close()
    return workbook_path


def verify_recovery(browser, workbook_path):
    context, _, failed, external, errors = session(browser, fail_path=workbook_path)
    page = context.new_page()
    downloads = []
    page.on('download', lambda record: downloads.append(record.suggested_filename))
    opt_in(page, '/#/research')
    action = studio_action(page, 'Excel Data', 'EXCEL')
    action.click()
    alert = page.get_by_role('alert')
    expect(alert).to_contain_text(re.compile(r'could not generate', re.I))
    expect(action).to_be_enabled()
    assert failed == [workbook_path] and not downloads
    completed = page.get_by_text('Report generated. Your download has started.', exact=True)
    expect(completed).to_have_count(0)
    alert.screenshot(path=str(ARTIFACTS / 'report-load-error.png'))
    # Failed module requests can be cached for the lifetime of the document.
    alert.get_by_role('button', name='reload the page', exact=True).click()
    gate = page.get_by_role('button', name='View unverified reference examples', exact=True)
    expect(gate).to_be_visible()
    gate.click()
    path = download(page, studio_action(page, 'Excel Data', 'EXCEL'), 'recovered-workbook', 'xlsx')
    inspect_download(path)
    expect(completed).to_be_visible()
    assert len(downloads) == 1 and not errors, (downloads, errors)
    context.close()



if __name__ == '__main__':
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        try:
            workbook_path = verify_exports(browser)
            verify_recovery(browser, workbook_path)
        finally:
            browser.close()
    print('PASS: opt-in PDF, XLSX and PPTX downloads, three actual PDF template actions, '
          'provenance, missing observations, deferred requests, guest guards and failed workbook reload/retry')
