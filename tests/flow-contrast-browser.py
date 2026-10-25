"""Rendered source-warning contrast regression; no external requests or credentials.

Run: python3 tests/flow-contrast-browser.py
FLOW_TEST_URL selects dev or production; FLOW_TEST_ARTIFACTS defaults to
/tmp/flow-contrast. Checks the six affected warning banners and related live-data
notes, enhanced-industry notice and four enterprise-module warnings at 360/1440px
in app light/dark, each opposite the OS color scheme. Targets
use unchanged provenance copy/roles, never the new CSS class. Each rendered text
node (including paragraph descendants) must reach WCAG small-text 4.5:1.

Computed RGBA layers are composited from the browser canvas through ancestors.
Underlying gradients use their stops and seven intermediate samples per segment;
the lowest sampled ratio is reported, rather than a guarantee for every pixel.
The patched opaque banner surfaces yield exact computed ratios.
The single quote is an explicit, isolated browser-cache fixture, never a quote
from a provider or a production seed. Other cached results are empty.
"""
import json
import os
import re
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get('FLOW_TEST_URL', 'http://127.0.0.1:5173').rstrip('/')
ARTIFACTS = Path(os.environ.get('FLOW_TEST_ARTIFACTS', '/tmp/flow-contrast'))
ARTIFACTS.mkdir(parents=True, exist_ok=True)
MINIMUM = 4.5
MEASUREMENTS = []
ERRORS = []
BLOCKED = []

TEXT_LAYERS = r'''root => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const result = [];
    while (walker.nextNode()) {
        const text = walker.currentNode;
        if (!text.textContent.trim()) continue;
        const parent = text.parentElement;
        const range = document.createRange();
        range.selectNodeContents(text);
        const bounds = range.getBoundingClientRect();
        if (!bounds.width || !bounds.height) continue;
        const style = getComputedStyle(parent);
        if (style.visibility !== 'visible') continue;
        const layers = [];
        for (let node = parent; node; node = node.parentElement) {
            const computed = getComputedStyle(node);
            layers.unshift({
                tag: node.tagName.toLowerCase(),
                color: computed.backgroundColor,
                image: computed.backgroundImage,
                opacity: Number(computed.opacity),
            });
        }
        result.push({
            text: text.textContent.trim().replace(/\s+/g, ' '),
            foreground: style.color,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            layers,
        });
    }
    return result;
}'''


def rgba(value):
    match = re.fullmatch(r'rgba?\(([^)]+)\)', value)
    assert match, f'Unexpected computed color: {value}'
    values = [float(part) for part in re.split(r'[, /]+', match.group(1).strip())]
    assert len(values) in [3, 4], value
    return tuple(values[:3] + [values[3] if len(values) == 4 else 1.0])


def over(front, back):
    alpha = front[3] + back[3] * (1 - front[3])
    if not alpha:
        return (0, 0, 0, 0)
    return tuple((front[index] * front[3] + back[index] * back[3] * (1 - front[3])) / alpha for index in range(3)) + (alpha,)


def background_candidates(layers):
    # Browser canvas is white; opaque app surfaces/gradient stops replace it.
    colors = [(255, 255, 255, 1)]
    for layer in layers:
        assert layer['opacity'] == 1, f'Warning has an unresolved opacity/animation layer: {layer}'
        background = rgba(layer['color'])
        colors = [over(background, color) for color in colors]
        if layer['image'] != 'none':
            assert layer['image'].startswith('linear-gradient('), layer
            stops = [rgba(color) for color in re.findall(r'rgba?\([^)]+\)', layer['image'])]
            assert stops, layer
            gradient = list(stops)
            for first, last in zip(stops, stops[1:]):
                gradient.extend(tuple(first[channel] + (last[channel] - first[channel]) * step / 8 for channel in range(4)) for step in range(1, 8))
            colors = [over(color, base) for color in gradient for base in colors]
        colors = list({tuple(round(channel, 5) for channel in color) for color in colors})
    return colors


def luminance(color):
    def linear(value):
        value /= 255
        return value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4
    return sum(weight * linear(value) for weight, value in zip([0.2126, 0.7152, 0.0722], color[:3]))


def contrast(foreground, background):
    values = sorted([luminance(over(foreground, background)), luminance(background)])
    return (values[1] + 0.05) / (values[0] + 0.05)


def check_warning(page, locator, label, theme, os_scheme, width, phrases):
    expect(locator).to_be_visible(timeout=15000)
    for phrase in phrases:
        expect(locator).to_contain_text(phrase)
    locator.scroll_into_view_if_needed()
    page.wait_for_timeout(250)  # Wait for the app's existing 200ms color transitions.
    nodes = locator.evaluate(TEXT_LAYERS)
    assert nodes, f'{label}: no rendered text was measured'
    for node in nodes:
        foreground = rgba(node['foreground'])
        backgrounds = background_candidates(node['layers'])
        node['backgrounds'] = [list(color) for color in backgrounds]
        node['ratios'] = [contrast(foreground, color) for color in backgrounds]
        node['minimumRatio'] = min(node['ratios'])
    minimum = min(node['minimumRatio'] for node in nodes)
    record = {'label': label, 'theme': theme, 'osScheme': os_scheme, 'width': width, 'minimumRatio': minimum, 'textNodes': nodes}
    MEASUREMENTS.append(record)
    slug = re.sub(r'[^a-z0-9]+', '-', label.lower()).strip('-')
    locator.screenshot(path=str(ARTIFACTS / f'{slug}-{theme}-os-{os_scheme}-{width}.png'))
    (ARTIFACTS / 'measurements.json').write_text(json.dumps(MEASUREMENTS, indent=2) + '\n')
    assert minimum >= MINIMUM, f'{label}: {minimum:.4f}:1 < {MINIMUM}:1; app={theme}, OS={os_scheme}, width={width}. See {ARTIFACTS / "measurements.json"}'
    print(f'PASS {label}: {minimum:.2f}:1; app={theme}, OS={os_scheme}, {width}px', flush=True)


def note(page, title):
    return page.get_by_role('note').filter(has=page.get_by_text(title, exact=True))


def fresh_route(page, suffix):
    response = page.goto(BASE + suffix, wait_until='networkidle')
    if response is None:
        page.reload(wait_until='networkidle')


def opt_in(page, suffix):
    fresh_route(page, suffix)
    # A fresh route/reload must gate bundled examples until this explicit click.
    expect(page.get_by_role('heading', name='Current research data is unavailable', exact=True)).to_be_visible()
    expect(page.get_by_role('note').filter(has_text='Unverified static')).to_have_count(0)
    page.get_by_role('button', name='View unverified reference examples', exact=True).click()
    expect(page.get_by_role('button', name='Data status: unverified reference examples enabled', exact=True)).to_be_visible()


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
    try:
        for theme, os_scheme in [('light', 'dark'), ('dark', 'light')]:
            for width in [1440, 360]:
                context = browser.new_context(viewport={'width': width, 'height': 1000}, color_scheme=os_scheme)
                context.on('page', lambda page: page.on('pageerror', lambda error: ERRORS.append(str(error))))
                origin = f'{urlsplit(BASE).scheme}://{urlsplit(BASE).netloc}'

                def local_only(route):
                    if urlsplit(route.request.url).netloc == urlsplit(BASE).netloc:
                        route.continue_()
                    else:
                        BLOCKED.append(route.request.url.split('?')[0])
                        route.abort()

                context.route('**/*', local_only)
                # Only this isolated browser sees the explicitly labelled quote.
                # Cached empty economics/currency avoid actual provider traffic.
                context.add_init_script(f'''if (location.origin === {json.dumps(origin)}) {{
                    localStorage.setItem('theme', {json.dumps(theme)});
                    const now = Date.now();
                    const cache = (key, data) => localStorage.setItem(key, JSON.stringify({{ data, timestamp: now, expiresAt: now + 3600000 }}));
                    const symbols = ['SET.BK', 'STI.SI', 'KLCI.KL', 'JKSE.JK', 'PSEI.PS', 'VN-INDEX.HM'];
                    cache('market_integrity_v1_' + symbols.sort().join('_'), [{{
                        symbol: 'SET.BK', name: 'Synthetic contrast fixture; no market observation',
                        price: 1, change: null, changePercent: null, volume: null,
                        source: 'Synthetic browser-only contrast fixture',
                        sourceStatus: 'cached-unverified', storedAt: '2024-01-01T00:00:00Z',
                    }}]);
                    cache('economic_integrity_v1_', []);
                    cache('currency_rates_integrity_v1', []);
                }}''')
                page = context.new_page()
                fresh_route(page, '/#/research/live-data')
                expect(page.locator('html')).to_have_class(theme)
                assert page.evaluate('matchMedia("(prefers-color-scheme: dark)").matches') == (os_scheme == 'dark')
                expect(page.get_by_role('heading', name='Market & Economic Reference', exact=True)).to_be_visible()

                def measure(locator, label, phrases):
                    check_warning(page, locator, label, theme, os_scheme, width, phrases)

                measure(page.get_by_text(re.compile(r'^Quotes are stored observations when a connected source is available\.')), 'Live market source banner', [
                    'missing records are not filled with reference estimates.',
                    'A successful check does not verify freshness; observation dates and source limitations are shown below.',
                ])
                measure(page.get_by_text('Reference coverage', exact=True), 'Live reference coverage badge', ['Reference coverage'])
                measure(page.get_by_text('Provider and observation date unverified', exact=True), 'Live stored-quote limitation', ['Provider and observation date unverified'])
                measure(page.get_by_text(re.compile('^Periods shown are source-reported annual periods,')), 'Live economic-period limitation', [
                    'not retrieval dates or proof of current conditions.',
                    'Missing metrics remain unavailable; no macroeconomic constants are substituted.',
                ])

                opt_in(page, '/#/research')
                expect(page.get_by_role('heading', name='Market Overview', exact=True)).to_be_visible()
                for tab, title, phrases in [
                    ('Industry Deep Dive', 'Unverified static industry reference', [
                        'hardcoded examples with unavailable observation dates.',
                        'They do not change with selected countries and are excluded from the entry planner.',
                        'Scores are illustrative and are not calibrated probabilities or forecasts.',
                    ]),
                    ('Market Intelligence', 'Unverified static market references', [
                        'unknown observation dates and have not been verified.',
                        'Scores are illustrative, not calibrated probabilities.',
                        'These figures are excluded from the entry planner.',
                        'Country selection filters only the regulatory cards.',
                    ]),
                    ('Case Studies', 'Unverified case-study references', [
                        'This view contains bundled static fallback material.',
                        'Company narratives, investment figures, ROI, and listed references have not been verified.',
                        'Observation dates are unknown;',
                        'These case studies are excluded from the entry planner.',
                    ]),
                    ('Data Visualization', 'Unverified static reference charts', [
                        'All figures are bundled reference material with unknown observation dates.',
                        'Listed source names are unverified attributions, not checked citations.',
                        'scores are illustrative, not calibrated likelihoods.',
                        'These figures are excluded from the entry planner.',
                        'Country filters apply to country charts and tables.',
                    ]),
                ]:
                    page.get_by_role('button', name=re.compile(re.escape(tab) + '$')).click()
                    # The industry pane contains two notices with the same
                    # heading; unchanged body copy identifies each one uniquely.
                    measure(note(page, title).filter(has_text=phrases[0]), tab + ' source banner', [title] + phrases)
                    if tab == 'Industry Deep Dive':
                        measure(note(page, title).filter(has_text='Figures, company examples, and narratives are hardcoded'), 'Enhanced industry source banner', [
                            'have not been verified against the named publications.',
                            'Observation dates are unavailable; year labels are unverified.',
                            'selected markets and are excluded from the entry planner.',
                        ])

                # A full reload disables reference examples again; analytics has
                # the same explicit gate rather than silently opting the user in.
                opt_in(page, '/#/research/analytics')
                measure(note(page, 'Unverified static reference data'), 'Analytics source banner', [
                    'These charts use bundled figures with unknown observation dates.',
                    'Opportunity scores are illustrative and are not calibrated probabilities.',
                    'These figures are excluded from the entry planner.',
                ])
                page.reload(wait_until='networkidle')
                expect(page.get_by_role('heading', name='Current research data is unavailable', exact=True)).to_be_visible()

                opt_in(page, '/#/research/enterprise-intelligence')
                for module, title, phrases in [
                    ('Regulatory Compliance', 'Unverified connected reference records', [
                        'Connected regulatory records are unverified and may include seeded reference content or database defaults.',
                        'Observation dates and source attribution have not been verified; effective dates are record claims.',
                        'Confirm current requirements with the relevant authority before use.',
                    ]),
                    ('Risk Assessment', 'Unverified connected risk reference', [
                        'Observation dates and source attribution have not been verified.',
                        'are not calibrated likelihoods, and do not establish an investment recommendation.',
                        'Zero scores may be defaults rather than measured values.',
                    ]),
                    ('Real Estate & Location', 'Unverified connected reference records', [
                        'Connected property and location records are unverified and may include seeded reference content or database defaults.',
                        'Rents and availability are not confirmed current; zero values may be defaults.',
                        'Site scores are illustrative, not calibrated probabilities or a validated recommendation.',
                    ]),
                    ('Labor & Talent', 'Unverified connected reference records', [
                        'Connected labor records are unverified and may include seeded reference content or database defaults.',
                        'Observation dates and source attribution have not been verified; year labels are record claims.',
                        'Zero values may be defaults rather than measured values.',
                        'Scores are not calibrated probabilities.',
                    ]),
                ]:
                    page.get_by_role('button').filter(has=page.get_by_role('heading', name=module, exact=True)).click()
                    measure(note(page, title), module + ' source banner', [title, 'Excluded from the entry planner.'] + phrases)
                    page.get_by_role('button', name='← Back to Overview', exact=True).click()
                context.close()
        assert not ERRORS, ERRORS
        print(f'PASS: {len(MEASUREMENTS)} rendered warning checks, all text descendants >=4.5:1, unchanged provenance and explicit opt-in, no runtime errors; external requests blocked ({len(BLOCKED)} attempts).')
        print(f'Artifacts: {ARTIFACTS}')
    finally:
        browser.close()
