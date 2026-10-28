"""Compare must move the actual viewport and keyboard focus to its content.

Run against Vite or a production preview with FLOW_TEST_URL. Uses the bundled
historical snapshot and isolated browser storage. External transport is blocked
without synthesizing provider observations, including on the Market Data route.
"""
import json
import os
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get('FLOW_TEST_URL', 'http://127.0.0.1:5173').rstrip('/')
ARTIFACTS = Path(os.environ.get('FLOW_TEST_ARTIFACTS', '/tmp/flow-comparison-artifacts'))
ARTIFACTS.mkdir(parents=True, exist_ok=True)
ERRORS, BLOCKED_REQUESTS, RESULTS = [], [], []
EXPECTED_PROVIDER_HOSTS = {'api.worldbank.org', 'www.imf.org', 'api.exchangerate-api.com'}


def assert_comparison_destination(page, motion, label):
    comparison = page.get_by_role('region', name='Your markets, side by side.', exact=True)
    expect(comparison).to_be_focused()
    expect(comparison).to_have_attribute('tabindex', '-1')
    # Playwright's "visible" alone permits a table entirely below the viewport.
    # Wait for real scrolling to settle at its offset, below the sticky tabs.
    destination = """() => {
        const section = document.getElementById('market-comparison');
        const heading = document.getElementById('comparison-title');
        const tabs = document.querySelector('.explorer-mode-tabs');
        if (!section || !heading || !tabs) return false;
        const bounds = section.getBoundingClientRect();
        const title = heading.getBoundingClientRect();
        const clearance = tabs.getBoundingClientRect().bottom;
        const margin = parseFloat(getComputedStyle(section).scrollMarginTop);
        return Math.abs(bounds.top - margin) < 2 && title.top > clearance && title.bottom < innerHeight;
    }"""
    try:
        page.wait_for_function(destination, timeout=5000)
    except Exception:
        page.screenshot(path=str(ARTIFACTS / 'failed-destination.png'))
        state = page.evaluate("""() => ({
            hash: location.hash, scrollY, active: document.activeElement?.id,
            section: document.getElementById('market-comparison')?.getBoundingClientRect().toJSON(),
            heading: document.getElementById('comparison-title')?.getBoundingClientRect().toJSON(),
            tabs: document.querySelector('.explorer-mode-tabs')?.getBoundingClientRect().toJSON(),
            calls: window.comparisonScrolls
        })""")
        raise AssertionError(f'{label}: comparison destination failed: {state}') from None
    behavior = page.evaluate('window.comparisonScrolls.at(-1)?.behavior')
    assert behavior == 'instant', f'{label}: {motion} used {behavior}'
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), label
    RESULTS.append({'action': label, 'motion': motion, 'behavior': behavior,
                    'width': page.viewport_size['width'], 'focused': True,
                    'top': comparison.bounding_box()['y']})
    return comparison


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
    try:
        for theme in ['dark', 'light']:
            for width in [390, 1440]:
                for motion in ['reduce', 'no-preference']:
                    context = browser.new_context(viewport={'width': width, 'height': 900}, reduced_motion=motion)
                    context.add_init_script(f"localStorage.setItem('theme', {json.dumps(theme)})")
                    context.add_init_script("""(() => {
                        window.comparisonScrolls = [];
                        const original = Element.prototype.scrollIntoView;
                        Element.prototype.scrollIntoView = function(options) {
                            if (this.id === 'market-comparison') window.comparisonScrolls.push(options);
                            return original.call(this, options);
                        };
                    })()""")

                    def local_only(route):
                        if urlsplit(route.request.url).netloc == urlsplit(BASE).netloc:
                            route.continue_()
                        else:
                            BLOCKED_REQUESTS.append(route.request.url.split('?')[0])
                            route.abort()

                    context.route('**/*', local_only)
                    page = context.new_page()
                    page.on('pageerror', lambda error: ERRORS.append(str(error)))
                    page.goto(BASE, wait_until='networkidle')
                    header = page.locator('.flow-header')
                    compare = header.get_by_role('button', name='Compare', exact=True)

                    # A real keyboard activation also covers bare-home hash navigation.
                    compare.focus()
                    page.keyboard.press('Enter')
                    comparison = assert_comparison_destination(page, motion, f'{theme}: first header Compare')
                    page.keyboard.press('Tab')
                    expect(comparison.get_by_role('button', name='Close market comparison', exact=True)).to_be_focused()
                    page.screenshot(path=str(ARTIFACTS / f'compare-{theme}-{width}-{motion}.png'))

                    # Reopening an already mounted comparison must move/focus again.
                    compare.click()
                    assert_comparison_destination(page, motion, f'{theme}: repeated header Compare')
                    shortlist_compare = page.locator('.explorer-selection-actions').get_by_role('button', name='Compare markets')
                    shortlist_compare.click()
                    assert_comparison_destination(page, motion, f'{theme}: country shortlist Compare')
                    page.keyboard.press('Control+Shift+C')
                    assert_comparison_destination(page, motion, f'{theme}: Compare shortcut')
                    page.get_by_role('button', name='Compare research paths', exact=True).click()
                    assert_comparison_destination(page, motion, f'{theme}: research paths Compare')

                    # Changing the shortlist must keep focus on the selected card.
                    country = page.locator('.market-country-card[data-market="malaysia"] .market-country-toggle')
                    country.focus()
                    page.keyboard.press('Space')
                    expect(country).to_be_focused()
                    expect(country).to_have_attribute('aria-pressed', 'true')
                    shortlist_compare.click()
                    comparison = assert_comparison_destination(page, motion, f'{theme}: updated shortlist Compare')
                    comparison.get_by_role('button', name='Close market comparison', exact=True).click()
                    expect(comparison).to_have_count(0)
                    compare.click()
                    assert_comparison_destination(page, motion, f'{theme}: closed comparison reopened')

                    # Returning from normal/retained module views also changes the hash.
                    for name in ['Market Data', 'Analytics']:
                        destination = header.get_by_role('button', name=name, exact=True)
                        if destination.is_visible():
                            destination.click()
                        else:
                            header.get_by_role('button', name='More options', exact=True).click()
                            page.get_by_role('menuitem', name=name, exact=True).click()
                        expect(page.locator('#market-comparison')).to_have_count(0)
                        compare.click()
                        assert_comparison_destination(page, motion, f'{theme}: Compare from {name}')

                    # The optional plan uses Header's route fallback, including direct
                    # compare navigation on refresh. Saved notebook content stays intact.
                    header.get_by_role('link', name='Your plan', exact=True).click()
                    expect(page.get_by_role('heading', name='Market workspace', exact=True)).to_be_visible()
                    notebook = page.evaluate('localStorage.getItem("flow-entry-planner-v1")')
                    compare.click()
                    assert_comparison_destination(page, motion, f'{theme}: Compare from plan')
                    assert page.evaluate('localStorage.getItem("flow-entry-planner-v1")') == notebook
                    page.reload(wait_until='networkidle')
                    assert_comparison_destination(page, motion, f'{theme}: direct comparison route')
                    expect(page.locator('.market-country-toggle[aria-pressed="true"]')).to_have_count(3)
                    context.close()

        assert not ERRORS, ERRORS
        assert all(urlsplit(url).hostname in EXPECTED_PROVIDER_HOSTS for url in BLOCKED_REQUESTS), BLOCKED_REQUESTS
        (ARTIFACTS / 'results.json').write_text(json.dumps({'checks': RESULTS, 'blockedRequests': sorted(set(BLOCKED_REQUESTS))}, indent=2) + '\n')
        print(f'PASS: {len(RESULTS)} Compare destinations; keyboard focus, actual viewport clearance, repeat/route/plan actions, both themes/widths/motion preferences; no runtime errors/external transport, known provider requests blocked')
        print(f'Artifacts: {ARTIFACTS}')
    finally:
        browser.close()
