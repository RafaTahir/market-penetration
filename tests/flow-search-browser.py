"""Check search focus, filtered results and mobile planning in a production preview."""
import os
from playwright.sync_api import sync_playwright

url = os.environ.get('FLOW_TEST_URL', 'http://127.0.0.1:4173')
with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    for width in (360, 390, 760, 1165, 1440):
        page = browser.new_page(viewport={'width': width, 'height': 900}, reduced_motion='reduce')
        page.goto(url, wait_until='domcontentloaded')
        assert page.get_by_role('link', name='Plan my entry').first.is_visible(), width
        search = page.get_by_label('Search markets or cities')
        search.fill('Malaysia')
        search.press('Enter')
        assert page.evaluate('document.activeElement.id') == 'explore-markets', width
        assert page.locator('.market-country-card:visible').count() == 1, width
        assert not page.evaluate('document.documentElement.scrollWidth > innerWidth'), width
        page.close()
    browser.close()
print('PASS: search focus, filtering, mobile planning and no overflow at five widths')
