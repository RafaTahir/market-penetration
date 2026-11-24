"""Measure cold guest workflows against an actual prior static release.

Baseline (no build or provider access):
  python tests/flow-load-browser.py --url http://127.0.0.1:4319 --label baseline
Candidate, built separately with Vite's --manifest:
  python tests/flow-load-browser.py --url http://127.0.0.1:PORT --label candidate \
    --baseline /tmp/flow-load-measurements/baseline.json \
    --manifest /path/to/manifest.json --dist /path/to/dist

Fresh contexts, blocked service workers and disabled HTTP caching isolate each
width/workflow. Body sizes describe this server, not a compressed production CDN.
No timing threshold is used. A candidate must reduce each workflow's measured
JS/CSS body bytes and keep optional feature boundaries out of those requests.
"""
import argparse
import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright


OPTIONAL_COMPONENTS = (
    'ReferenceResearch', 'AnalyticsDashboard', 'ReportGenerator',
    'EnterpriseIntelligenceDashboard', 'LiveMarketData',
    'DataRefreshDashboard', 'DataPlayground', 'UserDashboard', 'ExportScheduler',
)


def parse_arguments():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--url', default=os.environ.get('FLOW_TEST_URL', 'http://127.0.0.1:4319'))
    parser.add_argument('--label', default='baseline')
    parser.add_argument('--artifacts', type=Path, default=Path(os.environ.get(
        'FLOW_TEST_ARTIFACTS', '/tmp/flow-load-measurements')))
    parser.add_argument('--baseline', type=Path)
    parser.add_argument('--manifest', type=Path)
    parser.add_argument('--dist', type=Path, help='Candidate dist directory when the manifest is stored elsewhere')
    args = parser.parse_args()
    if bool(args.baseline) != bool(args.manifest):
        parser.error('Candidate comparisons require both --baseline and --manifest.')
    if not args.label or any(char not in 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_' for char in args.label):
        parser.error('--label must contain only letters, digits, hyphens or underscores.')
    args.url = args.url.rstrip('/')
    if urlsplit(args.url).hostname not in ('localhost', '127.0.0.1', '::1'):
        parser.error('Use an existing local static release server.')
    return args


def optional_assets(manifest_path):
    """Identify real boundaries by source keys, never by hashed file substrings."""
    manifest = json.loads(manifest_path.read_text())
    required = [f'src/components/{name}.tsx' for name in OPTIONAL_COMPONENTS]
    export_entries = [key for key in (
        'src/components/ExportTools.tsx', 'src/services/exportService.ts',
    ) if key in manifest]
    assert export_entries, 'Manifest has no separately loadable export boundary'
    required.extend(export_entries)
    missing = [key for key in required if key not in manifest]
    assert not missing, f'Optional features have no separate manifest entries: {missing}'
    def static_closure(keys):
        visited, assets = set(), set()
        pending = list(keys)
        while pending:
            key = pending.pop()
            if key in visited:
                continue
            visited.add(key)
            entry = manifest[key]
            assets.add('/' + entry['file'])
            assets.update('/' + name for name in entry.get('css', []))
            pending.extend(entry.get('imports', []))
        return assets

    # Auth/React and other truly shared modules may belong to both graphs.
    # Keep those allowed; forbid optional-only static dependencies as well as
    # every optional entry itself. This follows the actual Rollup graph.
    core = [key for key, entry in manifest.items() if entry.get('isEntry')]
    core.extend(key for key in ('src/components/MarketPlanHub.tsx',
                               'src/components/EntryPlanner.tsx') if key in manifest)
    assets = static_closure(required) - static_closure(core)
    assets.update('/' + manifest[key]['file'] for key in required)
    return manifest, assets, required


def asset_snapshot(page, responses):
    timings = page.evaluate("""() => performance.getEntriesByType('resource')
        .filter(item => /\\.(js|css)$/.test(new URL(item.name).pathname))
        .map(item => ({path: new URL(item.name).pathname,
            encodedBodyBytes: item.encodedBodySize,
            decodedBodyBytes: item.decodedBodySize,
            transferBytes: item.transferSize}))""")
    assets = []
    for response in responses:
        path = urlsplit(response.url).path
        assert response.status == 200, f'{path}: HTTP {response.status}'
        body = response.body()
        assets.append({'path': path, 'bodyBytes': len(body),
                       'sha256': hashlib.sha256(body).hexdigest(),
                       'contentEncoding': response.headers.get('content-encoding', 'identity')})
    assert assets and any(item['path'].endswith('.js') for item in assets), 'No JavaScript measured'
    assert any(item['path'].endswith('.css') for item in assets), 'No stylesheet measured'
    assert len(timings) == len(assets), f'Timing/response count mismatch: {len(timings)} != {len(assets)}'
    return {'requests': assets, 'requestCount': len(assets),
            'bodyBytes': sum(item['bodyBytes'] for item in assets),
            'encodedBodyBytes': sum(item['encodedBodyBytes'] for item in timings),
            'transferBytes': sum(item['transferBytes'] for item in timings),
            'resourceTimings': timings}


def assert_no_overflow(page):
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Document overflows viewport'


def check_filter(page):
    cards = page.locator('.market-country-card:visible')
    assert cards.count() > 1, 'Landing has no usable market collection'
    search = page.get_by_label('Search markets or cities', exact=True)
    search.fill('Malaysia')
    search.press('Enter')
    expect(cards).to_have_count(1)
    expect(cards).to_have_attribute('data-market', 'malaysia')
    expect(page.locator('#explore-markets')).to_be_focused()
    page.get_by_role('button', name='Clear search', exact=True).click()
    expect(search).to_have_value('')
    assert cards.count() > 1, 'Clearing search did not restore market collection'


def check_json_download(page, button, expected_name):
    with page.expect_download() as download_event:
        button.click()
    download = download_event.value
    assert download.suggested_filename == expected_name
    value = json.loads(Path(download.path()).read_text())
    assert isinstance(value.get('markets'), list) and value['markets'], 'Download omitted selected markets'
    return {'fileName': expected_name, 'marketCount': len(value['markets'])}


def measure(browser, args, width, workflow):
    context = browser.new_context(viewport={'width': width, 'height': 900},
                                  reduced_motion='reduce', service_workers='block',
                                  accept_downloads=True)
    responses, errors, external, failed_assets = [], [], [], []
    try:
        def local_only(route):
            target = urlsplit(route.request.url)
            if target.netloc == urlsplit(args.url).netloc:
                route.continue_()
            else:
                # Record host only: query strings/paths can contain credentials.
                external.append(target.hostname)
                route.abort()

        context.route('**/*', local_only)
        page = context.new_page()
        session = context.new_cdp_session(page)
        session.send('Network.enable')
        session.send('Network.setCacheDisabled', {'cacheDisabled': True})
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('response', lambda response: responses.append(response)
                if urlsplit(response.url).path.endswith(('.js', '.css')) else None)
        page.on('requestfailed', lambda request: failed_assets.append(urlsplit(request.url).path)
                if urlsplit(request.url).path.endswith(('.js', '.css')) else None)
        page.goto(args.url + ('/#/plan' if workflow == 'plan' else '/'), wait_until='networkidle')

        if workflow == 'plan':
            expect(page.get_by_role('heading', name='Your market plan.', exact=True)).to_be_visible()
        else:
            expect(page.get_by_label('Search markets or cities', exact=True)).to_be_visible()
            if workflow == 'compare':
                compare = page.locator('.flow-header').get_by_role('button', name='Compare', exact=True)
                compare.focus()
                page.keyboard.press('Enter')
                region = page.get_by_role('region', name='Your markets, side by side.', exact=True)
                expect(region).to_be_focused()
                expect(region.get_by_role('table')).to_be_visible()
                page.wait_for_function("""() => {
                    const heading = document.getElementById('comparison-title').getBoundingClientRect();
                    const tabs = document.querySelector('.explorer-mode-tabs').getBoundingClientRect();
                    return heading.top >= tabs.bottom && heading.bottom <= innerHeight;
                }""")
        page.wait_for_load_state('networkidle')
        assert_no_overflow(page)
        initial = asset_snapshot(page, responses)

        # Measure initial workflow before follow-up functional work. Keep a second
        # snapshot so downloads/filtering cannot silently fetch heavy dependencies.
        checks = []
        if workflow == 'plan':
            checks.append(check_json_download(page, page.get_by_role('button', name='Export market plan', exact=True), 'flow-market-plan.json'))
        else:
            if workflow == 'compare':
                checks.append(check_json_download(page, page.get_by_role('button', name='Export shortlist', exact=True), 'flow-market-shortlist.json'))
                page.get_by_role('button', name='Close market comparison', exact=True).click()
                expect(page.locator('#market-comparison')).to_have_count(0)
            check_filter(page)
            checks.append('Market filtering and clear search preserve a usable collection')
        page.wait_for_load_state('networkidle')
        assert_no_overflow(page)
        final = asset_snapshot(page, responses)
        assert not errors, f'Browser errors: {errors}'
        assert not external, f'Guest workflow attempted external transport: {external}'
        assert not failed_assets, f'Asset requests failed: {failed_assets}'
        return {'width': width, 'workflow': workflow, 'initial': initial,
                'afterChecks': final, 'checks': checks,
                'externalRequestHosts': external, 'browserErrors': errors}
    finally:
        context.close()


def check_candidate(results, baseline, manifest_path, dist_path=None):
    manifest, forbidden, boundaries = optional_assets(manifest_path)
    dist = dist_path or (manifest_path.parent.parent if manifest_path.parent.name == '.vite' else manifest_path.parent)
    manifest_files = {entry['file'] for entry in manifest.values()}
    manifest_files.update(name for entry in manifest.values() for name in entry.get('css', []))
    prior = {(row['width'], row['workflow']): row for row in baseline['measurements']}
    comparisons = []
    for row in results:
        key = (row['width'], row['workflow'])
        assert key in prior, f'Baseline missing {key}'
        old = prior[key]['initial']['bodyBytes']
        new = row['initial']['bodyBytes']
        assert new < old, f'{key}: no JS/CSS body reduction ({new} >= {old})'
        for asset in row['afterChecks']['requests']:
            assert asset['path'] not in forbidden, f'{key}: optional feature fetched: {asset["path"]}'
            relative = asset['path'].lstrip('/')
            assert relative in manifest_files, f'{relative} does not belong to the candidate manifest'
            expected_hash = hashlib.sha256((dist / relative).read_bytes()).hexdigest()
            assert asset['sha256'] == expected_hash, f'Served asset differs from candidate build: {relative}'
        comparisons.append({'width': key[0], 'workflow': key[1], 'baselineBodyBytes': old,
                            'candidateBodyBytes': new, 'savedBodyBytes': old - new,
                            'savedPercent': round(100 * (old - new) / old, 2),
                            'baselineRequests': prior[key]['initial']['requestCount'],
                            'candidateRequests': row['initial']['requestCount']})
    return {'comparisons': comparisons, 'optionalManifestBoundaries': boundaries,
            'candidateManifestSha256': hashlib.sha256(manifest_path.read_bytes()).hexdigest(),
            'forbiddenAssets': sorted(forbidden)}


def main():
    args = parse_arguments()
    args.artifacts.mkdir(parents=True, exist_ok=True)
    destination = args.artifacts / f'{args.label}.json'
    assert not args.baseline or destination.resolve() != args.baseline.resolve(), 'Do not overwrite baseline with candidate output'
    report = {'label': args.label, 'url': args.url, 'measuredAt': datetime.now(timezone.utc).isoformat(),
              'method': 'Fresh Chromium contexts; cache disabled; external requests blocked; no synthesized data; local static server body bytes, not CDN estimates.',
              'measurements': [], 'passed': False}
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
            try:
                for width in (390, 1440):
                    for workflow in ('landing', 'compare', 'plan'):
                        result = measure(browser, args, width, workflow)
                        report['measurements'].append(result)
                        print(f'{args.label}: {width}px {workflow}: {result["initial"]["requestCount"]} JS/CSS requests, {result["initial"]["bodyBytes"]:,} body bytes')
            finally:
                browser.close()
        if args.baseline:
            baseline = json.loads(args.baseline.read_text())
            assert baseline.get('passed'), 'Baseline did not complete successfully'
            report.update(check_candidate(report['measurements'], baseline, args.manifest, args.dist))
        report['passed'] = True
    except Exception as error:
        report['failure'] = f'{type(error).__name__}: {error}'
        raise
    finally:
        destination.write_text(json.dumps(report, indent=2) + '\n')
    print(f'PASS: six cold workflows, filtering/download checks, no external attempts or browser errors. Results: {destination}')


if __name__ == '__main__':
    main()
