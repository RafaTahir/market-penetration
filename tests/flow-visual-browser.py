"""Integrated visual-workspace acceptance using isolated, explicit test fixtures.

Run with Vite available: python3 tests/flow-visual-browser.py
FLOW_TEST_URL may target a production preview instead. Requires Playwright Python
and Chromium from the cloud image. All external transport is blocked. Synthetic
research is written only to isolated browser localStorage, using the existing
flow-entry-planner-v1 key and version 1 schema; no production data is seeded.
Screenshots labelled synthetic are test assumptions, not market observations.
"""
import json
import os
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get('FLOW_TEST_URL', 'http://127.0.0.1:5173').rstrip('/')
ARTIFACTS = Path(os.environ.get('FLOW_TEST_ARTIFACTS', '/tmp/flow-visual-artifacts'))
ARTIFACTS.mkdir(parents=True, exist_ok=True)
KEY = 'flow-entry-planner-v1'
FACTORS = ['demand', 'competition', 'regulation', 'costs', 'talent']
TODAY = datetime.now(timezone.utc).date()
OBSERVED = (TODAY - timedelta(days=30)).isoformat()
STALE = (TODAY - timedelta(days=366)).isoformat()
ERRORS = []
BLOCKED_REQUESTS = []


def compact_json(value):
    return json.dumps(value, separators=(',', ':'), ensure_ascii=False)


def blank_fixture():
    return {
        'version': 1,
        'profile': {
            'segment': 'founder', 'phase': 'exploring', 'industry': 'technology',
            'businessDescription': 'Synthetic visual acceptance fixture; no market claim.',
            'runwayMonths': 12,
        },
        'evidence': {
            city: {
                factor: {'rating': None, 'note': '', 'sourceUrl': '', 'observedOn': ''}
                for factor in FACTORS
            }
            for city in ['jakarta', 'manila']
        },
    }


def documented(state, city, factor, rating, observed=OBSERVED, profile_context=None):
    profile = state['profile']
    current_context = compact_json([
        profile['segment'], profile['phase'], profile['industry'],
        profile['businessDescription'],
    ])
    state['evidence'][city][factor] = {
        'rating': rating,
        'note': f'Synthetic acceptance fixture for {city} {factor}; not factual market evidence.',
        'sourceUrl': f'https://example.com/flow-acceptance-fixture/{city}/{factor}?case=visual',
        'observedOn': observed,
        'profileContext': current_context if profile_context is None else profile_context,
    }


def mixed_fixture():
    state = blank_fixture()
    documented(state, 'jakarta', 'demand', 1)
    # Competition is missing; these two raw ratings must stay off the scale.
    documented(state, 'jakarta', 'regulation', 5, observed=STALE)
    old_scope = compact_json(['founder', 'exploring', 'retail', state['profile']['businessDescription']])
    documented(state, 'jakarta', 'costs', 4, profile_context=old_scope)
    documented(state, 'jakarta', 'talent', 3)
    for factor, rating in [('demand', 4), ('competition', 2), ('regulation', 5), ('costs', 1)]:
        documented(state, 'manila', factor, rating)
    return state


def zero_fixture():
    state = blank_fixture()
    for factor in FACTORS:
        documented(state, 'jakarta', factor, 1)
    for factor in FACTORS[:-1]:
        documented(state, 'manila', factor, 3)
    return state


def new_case(browser, fixture=None):
    context = browser.new_context(viewport={'width': 1440, 'height': 1000})
    context.on('page', lambda page: page.on('pageerror', lambda error: ERRORS.append(str(error))))
    local_origin = urlsplit(BASE).netloc

    def local_only(route):
        if urlsplit(route.request.url).netloc == local_origin:
            route.continue_()
        else:
            BLOCKED_REQUESTS.append(route.request.url.split('?')[0])
            route.abort()

    context.route('**/*', local_only)
    # This context starts empty. The session marker prevents reload from
    # reseeding and lets the test verify that ordinary navigation preserves data.
    payload = compact_json(fixture)
    origin = compact_json(f'{urlsplit(BASE).scheme}://{local_origin}')
    context.add_init_script(f"""
        if (location.origin === {origin} && !sessionStorage.getItem('flow-visual-acceptance-seeded')) {{
            localStorage.setItem('theme', 'light');
            const fixture = {payload};
            if (fixture !== null) localStorage.setItem('{KEY}', JSON.stringify(fixture));
            sessionStorage.setItem('flow-visual-acceptance-seeded', 'yes');
        }}
    """)
    page = context.new_page()
    page.goto(BASE + '/#/plan', wait_until='networkidle')
    expect(page.get_by_role('heading', name='Market workspace', exact=True)).to_be_visible()
    return context, page


def workspace_nav(page, name):
    nav = page.get_by_role('navigation', name='Workspace views', exact=True)
    return nav.get_by_role('button', name=re.compile('^' + re.escape(name)))


def open_view(page, name, title):
    button = workspace_nav(page, name)
    button.click()
    expect(button).to_have_attribute('aria-current', 'page')
    expect(page.get_by_role('heading', name=title, exact=True)).to_be_visible()


def set_theme(page, theme):
    page.evaluate('(theme) => localStorage.setItem("theme", theme)', theme)
    page.reload(wait_until='networkidle')
    expect(page.locator('html')).to_have_class(theme)


def check_bounds(page, label):
    result = page.evaluate('''() => ({
        viewport: innerWidth,
        document: document.documentElement.scrollWidth,
        workspace: document.querySelector('.visual-workspace').getBoundingClientRect().width,
    })''')
    assert result['document'] <= result['viewport'], f'{label}: horizontal overflow {result}'
    canvas = page.locator('.evidence-map-canvas')
    if canvas.count():
        bounds = canvas.bounding_box()
        for pin_label in page.locator('.evidence-map-pin-label').all():
            rect = pin_label.bounding_box()
            assert rect['x'] >= bounds['x'] - 1, f'{label}: left-clipped map label {rect} {bounds}'
            assert rect['x'] + rect['width'] <= bounds['x'] + bounds['width'] + 1, f'{label}: right-clipped map label {rect} {bounds}'
            assert rect['y'] >= bounds['y'] - 1, f'{label}: top-clipped map label'
            assert rect['y'] + rect['height'] <= bounds['y'] + bounds['height'] + 1, f'{label}: bottom-clipped map label'
    modal = page.locator('dialog:modal')
    if modal.count():
        rect = modal.bounding_box()
        assert rect['x'] >= -1 and rect['x'] + rect['width'] <= result['viewport'] + 1, f'{label}: drawer outside viewport'
        assert modal.evaluate('(node) => node.scrollWidth <= node.clientWidth'), f'{label}: drawer content overflow'


def capture(page, name):
    page.evaluate('window.scrollTo(0, 0)')
    page.screenshot(path=str(ARTIFACTS / (name + '.png')), full_page=True)


def city_summary(page, city):
    return page.locator(f'.city-signal[data-city="{city}"]')


def lane(page, city, factor_label):
    return page.get_by_role('button', name=re.compile('^' + re.escape(f'{city}, {factor_label}.')))


def check_mixed_plot(page):
    assert page.locator('.comparison-rating-dot').count() == 6
    assert page.locator('.comparison-lane.needs-review').count() == 2
    assert page.locator('.comparison-lane.is-unknown').count() == 2
    rating_one = lane(page, 'Jakarta', 'Demand evidence')
    expect(rating_one).to_have_attribute('aria-label', re.compile('rating 1 of 5'))
    expect(rating_one.locator('.comparison-rating-dot')).to_have_text('1')
    track = rating_one.locator('.comparison-rating-track').bounding_box()
    point = rating_one.locator('.comparison-rating-dot').bounding_box()
    assert abs(point['x'] + point['width'] / 2 - track['x']) <= 1, 'Rating 1 must plot at the first tick, not Unknown or zero.'
    missing = lane(page, 'Jakarta', 'Competitive position')
    expect(missing).to_have_attribute('aria-label', re.compile('Unknown. No documented assessment yet'))
    expect(missing.locator('.comparison-rating-dot')).to_have_count(0)
    expect(missing.locator('.comparison-unknown-cell')).to_have_text('+')
    for factor, reason in [('Regulatory preparation', 'older than 365 days'), ('Operating cost preparation', 'Business profile changed')]:
        review = lane(page, 'Jakarta', factor)
        expect(review).to_have_attribute('aria-label', re.compile(re.escape(reason)))
        expect(review.locator('.comparison-rating-dot')).to_have_count(0)
        expect(review.locator('.comparison-unknown-cell')).to_have_text('!')
    expect(city_summary(page, 'jakarta')).to_contain_text('2/5 documented')
    expect(city_summary(page, 'manila')).to_contain_text('4/5 documented')
    for city in ['jakarta', 'manila']:
        expect(city_summary(page, city).locator('.signal-preparation')).to_have_attribute('aria-label', re.compile('preparation not assessed$'))
        expect(city_summary(page, city).locator('.signal-preparation > strong')).to_have_text('—')


def check_native_drawer(page, city, factor):
    dialog = page.get_by_role('dialog', name=factor, exact=True)
    expect(dialog).to_be_visible()
    assert dialog.evaluate('(node) => node instanceof HTMLDialogElement && node.open && node.matches(":modal")'), 'Use the native modal drawer.'
    expect(dialog.get_by_label('City', exact=True)).to_have_value(city)
    return dialog


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
    try:
        # Fresh production state must contain no synthetic opportunity or ratings.
        empty_context, empty = new_case(browser)
        expect(empty.locator('.comparison-rating-dot')).to_have_count(0)
        expect(empty.locator('.comparison-unknown-dot')).to_have_count(10)
        for city in ['jakarta', 'manila']:
            expect(city_summary(empty, city)).to_contain_text('Not assessed')
            expect(city_summary(empty, city)).to_contain_text('0/5 documented')
        initial = empty.evaluate('(key) => JSON.parse(localStorage.getItem(key))', KEY)
        assert initial['version'] == 1
        assert all(record['rating'] is None for records in initial['evidence'].values() for record in records.values())
        for theme in ['light', 'dark']:
            set_theme(empty, theme)
            for width in [360, 390, 768, 1440]:
                empty.set_viewport_size({'width': width, 'height': 1000})
                capture(empty, f'empty-overview-{theme}-{width}')
                check_bounds(empty, f'empty overview {theme} {width}')
        empty_context.close()
        print('PASS: fresh empty state, version 1, ten nonnumeric unknown marks, both themes and four widths')

        mixed = mixed_fixture()
        context, page = new_case(browser, mixed)
        check_mixed_plot(page)
        map_manila = page.get_by_role('button', name=re.compile('^Manila, Philippines. 4 of 5 factors'))
        map_manila.click()
        expect(map_manila).to_have_attribute('aria-pressed', 'true')
        expect(page.locator('.city-signal-active')).to_have_attribute('data-city', 'manila')
        next_moves = page.locator('.workspace-next-actions')
        expect(next_moves.get_by_role('button')).to_have_count(1)
        expect(next_moves).to_contain_text('Manila')
        next_moves.get_by_role('button', name=re.compile('Talent & delivery')).click()
        drawer = check_native_drawer(page, 'manila', 'Talent & delivery')
        expect(drawer.get_by_label('Factor', exact=True)).to_have_value('talent')
        expect(drawer.get_by_label('Your assessment', exact=True)).to_have_value('')
        expect(drawer.get_by_label('City', exact=True)).to_be_focused()
        page.keyboard.press('Escape')
        expect(page.locator('dialog:modal')).to_have_count(0)

        # Comparison is a real workspace view and opens the same traceable drawer.
        open_view(page, 'Compare cities', 'Compare cities')
        expect(page.locator('.evidence-map')).to_have_count(0)
        check_mixed_plot(page)
        lane(page, 'Jakarta', 'Demand evidence').focus()
        page.keyboard.press('Enter')
        drawer = check_native_drawer(page, 'jakarta', 'Demand')
        source_record = mixed['evidence']['jakarta']['demand']
        expect(drawer.get_by_label('Your assessment', exact=True)).to_have_value('1')
        expect(drawer.get_by_label('Source URL', exact=True)).to_have_value(source_record['sourceUrl'])
        expect(drawer.get_by_label('Source observation date', exact=True)).to_have_value(OBSERVED)
        expect(drawer.get_by_label('Evidence and reasoning', exact=False)).to_have_value(source_record['note'])
        page.keyboard.press('Escape')

        open_view(page, 'Evidence', 'Evidence ledger')
        ledger = page.get_by_role('list', name='Saved city evidence', exact=True)
        expect(ledger.get_by_role('listitem')).to_have_count(10)
        saved_row = ledger.get_by_role('button', name='Review Jakarta Demand evidence. Documented', exact=True)
        expect(saved_row.locator('.ledger-source')).to_have_text('example.com')
        expect(saved_row.locator('.ledger-date')).to_have_text(OBSERVED)
        expect(ledger.get_by_role('button', name='Review Jakarta Regulatory preparation. Evidence needed', exact=True).locator('.record-status')).to_have_text('Review')
        saved_row.click()
        drawer = check_native_drawer(page, 'jakarta', 'Demand')
        expect(drawer.get_by_label('Source URL', exact=True)).to_have_value(source_record['sourceUrl'])
        expect(drawer.get_by_label('Source observation date', exact=True)).to_have_value(OBSERVED)
        capture(page, 'synthetic-mixed-ledger-drawer-light-1440')
        page.keyboard.press('Escape')

        # Layout checks include every workspace view, rather than only the map.
        for theme in ['light', 'dark']:
            set_theme(page, theme)
            for width in [360, 390, 768, 1440]:
                page.set_viewport_size({'width': width, 'height': 1000})
                if width <= 390:
                    expect(page.get_by_role('button', name='Export research', exact=True)).to_be_visible()
                for name, title, slug in [('Overview', 'Market workspace', 'overview'), ('Compare cities', 'Compare cities', 'compare'), ('Evidence', 'Evidence ledger', 'ledger')]:
                    open_view(page, name, title)
                    if slug != 'ledger':
                        check_mixed_plot(page)
                    capture(page, f'synthetic-mixed-{slug}-{theme}-{width}')
                    check_bounds(page, f'synthetic {slug} {theme} {width}')
                # Source columns collapse on phones; the record remains accessible
                # through its native drawer with the exact saved URL and date.
                page.get_by_role('button', name='Review Jakarta Demand evidence. Documented', exact=True).click()
                drawer = check_native_drawer(page, 'jakarta', 'Demand')
                expect(drawer.get_by_label('Source URL', exact=True)).to_have_value(source_record['sourceUrl'])
                expect(drawer.get_by_label('Source observation date', exact=True)).to_have_value(OBSERVED)
                check_bounds(page, f'synthetic drawer {theme} {width}')
                if width == 1440:
                    # Ledger content is scrollable, so a backdrop wheel would
                    # otherwise move the workspace beneath the modal drawer.
                    assert page.evaluate('document.documentElement.scrollHeight > innerHeight')
                    background_scroll = page.evaluate('scrollY')
                    page.mouse.move(8, 100)
                    page.mouse.wheel(0, 480)
                    page.wait_for_timeout(200)
                    assert abs(page.evaluate('scrollY') - background_scroll) <= 1, f'{theme}: modal backdrop wheel moved the workspace'
                if width in [360, 1440]:
                    capture(page, f'synthetic-mixed-source-drawer-{theme}-{width}')
                page.keyboard.press('Escape')
                print(f'PASS: {theme} {width}px overview, comparison, ledger and source drawer fit')
        restored = page.evaluate('(key) => JSON.parse(localStorage.getItem(key))', KEY)
        assert restored == mixed, 'Viewing, selecting, theme changes and reload must preserve every version 1 record.'
        context.close()
        print('PASS: real rating 1; missing, stale and profile-invalid evidence never plotted; 4/5 withholds aggregate; map, next moves, Compare and ledger traceability; unchanged storage')

        # Complete weak preparation is a genuine zero, distinct from absent data.
        zero_context, zero = new_case(browser, zero_fixture())
        jakarta = city_summary(zero, 'jakarta')
        manila = city_summary(zero, 'manila')
        expect(jakarta).to_contain_text('5/5 documented')
        expect(jakarta.locator('.signal-preparation')).to_have_attribute('aria-label', 'Jakarta preparation 0 out of 100')
        expect(jakarta.locator('.signal-preparation > strong')).to_have_text('0')
        expect(manila).to_contain_text('4/5 documented')
        expect(manila.locator('.signal-preparation')).to_have_attribute('aria-label', 'Manila preparation not assessed')
        expect(manila.locator('.signal-preparation > strong')).to_have_text('—')
        expect(zero.locator('.comparison-lane[data-city="jakarta"] .comparison-rating-dot')).to_have_count(5)
        for marker in zero.locator('.comparison-lane[data-city="jakarta"] .comparison-rating-dot').all():
            expect(marker).to_have_text('1')
            assert marker.get_attribute('style') == 'left: 0%;'
        capture(zero, 'synthetic-complete-zero-vs-incomplete-light-1440')
        zero.reload(wait_until='networkidle')
        expect(city_summary(zero, 'jakarta').locator('.signal-preparation > strong')).to_have_text('0')
        zero_context.close()
        assert not ERRORS, ERRORS
        print(f'PASS: five qualified ratings of 1 produce aggregate 0, preserved on reload; no runtime errors; external transport blocked ({len(BLOCKED_REQUESTS)} requests)')
        print(f'Artifacts: {ARTIFACTS}')
    finally:
        browser.close()
