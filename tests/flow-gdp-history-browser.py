"""Pinned historical series in Overview, charts, trends and shortlist exports.

Fixtures below were extracted from the two independently SHA-256-checked CSVs
identified by SOURCES, without rounding, interpolation or live provider requests.
"""
import json
import os
import re
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright

from flow_coverage import MARKETS

BASE = os.environ.get('FLOW_TEST_URL', 'http://127.0.0.1:4173').rstrip('/')
ARTIFACTS = Path(os.environ.get('FLOW_TEST_ARTIFACTS', '/tmp/flow-gdp-history'))
YEARS = list(range(2014, 2024))
SOURCES = {
    'population': {'commit': 'd4b1a4a9a17e2123baf0ef119de05bceced1ab1b',
                   'sha256': '2c697c3e668c8cb06ee467cd0d475b37b52844fdc48cb7725b79b58f18bf0b02',
                   'retrievedAt': '2026-10-25T17:48:08Z', 'indicator': 'SP.POP.TOTL'},
    'gdp': {'commit': '36d761dc5617982d3e50b213e02b9a1b47c4e958',
            'sha256': '8d84ef6bcaccf740c01c5ed7566aae8f7b149d0e2c20001e441efd3cb5b2fa86',
            'retrievedAt': '2026-10-25T17:48:56Z', 'indicator': 'NY.GDP.MKTP.CD'},
}
# Array index 0 is 2014, index 9 is 2023. These are national observations.
SERIES = {
    'cambodia': {
        'gdp': [16702610842.35294, 18049954289.472065, 20016747857.636715, 22177200588.182632, 24571753583.393467, 27089390032.797966, 25872797891.766376, 26961061151.733734, 29504829319.316875, 31772759998.85713],
        'population': [15396772, 15623251, 15852803, 16073372, 16274522, 16481304, 16725474, 16974305, 17201724, 17423880],
    },
    'thailand': {
        'gdp': [407339040197.65125, 401296238228.0839, 413366349747.5081, 456356813536.7637, 506754208404.4847, 543976691793.88586, 500461898480.24554, 506256494297.33966, 495645210972.7507, 514944993833.5776],
        'population': [70216367, 70540795, 70859841, 71160187, 71376079, 71522271, 71641484, 71727332, 71735329, 71702435],
    },
    'singapore': {
        'gdp': [314863580758.45465, 307998545269.39795, 319053943915.0054, 343257164581.71155, 376892697588.00507, 376901649222.4508, 349488382610.662, 434111559282.8491, 498474540987.7802, 501427500080.05853],
        'population': [5469724, 5535002, 5607283, 5612253, 5638676, 5703569, 5685807, 5453566, 5637022, 5917648],
    },
}
METRICS = {
    'gdp': ('GDP', 'GDP in current US dollars', 'current US dollars', 1e9),
    'population': ('Population', 'Total population', 'people', 1e6),
    'perPerson': ('GDP per person', 'GDP per person', 'current US dollars per person', 1),
}


def observed(market, metric, year):
    index = year - YEARS[0]
    if metric == 'perPerson':
        return SERIES[market]['gdp'][index] / SERIES[market]['population'][index]
    return SERIES[market][metric][index]


def slider(chart, metric):
    return chart.get_by_role('slider', name=f'{METRICS[metric][0]} observation year', exact=True)


def select_year(chart, metric, year):
    control = slider(chart, metric)
    control.focus()
    control.press('Home')
    for _ in range(year - YEARS[0]):
        control.press('ArrowRight')
    expect(control).to_be_focused()
    expect(control).to_have_value(str(year))


def axis_ticks(chart):
    labels = chart.locator('.mf-axis > div > span').all_text_contents()
    assert len(labels) >= 2 and labels[0] == '0', labels
    return labels


def no_overflow(page, chart):
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
    assert chart.evaluate('el => el.scrollWidth <= el.clientWidth + 1')


def assert_metric(chart, metric, year, scope, known, axis=None):
    label, list_name, unit, divisor = METRICS[metric]
    expect(slider(chart, metric)).to_have_value(str(year))
    rows = chart.get_by_role('list', name=f'{year} {list_name} comparison', exact=True)
    expect(rows).to_be_visible()
    # Country rows retain their position across years; this is not a ranking.
    assert rows.locator('li').evaluate_all('(els) => els.map(el => el.dataset.market)') == scope
    ticks = axis_ticks(chart)
    if axis is not None:
        assert ticks == axis, (metric, year, ticks, axis)
    maximum = float(ticks[-1].replace(',', '')) * divisor
    for market in known:
        expected = observed(market, metric, year)
        row = rows.locator(f'li[data-market="{market}"]')
        value = row.locator('data')
        assert float(value.get_attribute('value')) == expected, (market, metric, year)
        expect(value).to_have_accessible_name(re.compile(rf'{re.escape(unit)}, {year}$'))
        width = row.locator('.mf-bar').evaluate('bar => parseFloat(bar.style.width)')
        assert abs(width - 100 * expected / maximum) < 0.001, (market, metric, year, width)
    visible_ticks = [tick.bounding_box() for tick in chart.locator('.mf-axis > div > span:visible').all()]
    assert len(visible_ticks) >= 2
    assert all(a['x'] + a['width'] <= b['x'] + 1 for a, b in zip(visible_ticks, visible_ticks[1:])), visible_ticks
    expect(chart.locator('.mf-snapshot-label')).to_contain_text(str(year))
    if metric == 'perPerson':
        expect(chart.locator('.mf-snapshot-label')).to_contain_text('Derived')
        expect(chart.locator('.mf-limit')).to_contain_text('output per resident')
    return ticks


def metric_button(chart, metric):
    return chart.get_by_role('button', name=METRICS[metric][0], exact=True)


def compare_metrics(page, scope, known, tag):
    chart = page.locator('.market-fundamentals')
    gdp_axis = assert_metric(chart, 'gdp', 2023, scope, known)
    for year in [2014, 2015, 2023, 2014]:
        select_year(chart, 'gdp', year)
        assert_metric(chart, 'gdp', year, scope, known, gdp_axis)
    metric_button(chart, 'population').click()
    population_axis = assert_metric(chart, 'population', 2014, scope, known)
    for year in [2019, 2020, 2021]:
        select_year(chart, 'population', year)
        assert_metric(chart, 'population', year, scope, known, population_axis)
    assert observed('singapore', 'population', 2019) > observed('singapore', 'population', 2020) > observed('singapore', 'population', 2021)
    chart.screenshot(path=str(ARTIFACTS / f'population-2021-{tag}.png'), animations='disabled')
    per_person = metric_button(chart, 'perPerson')
    per_person.focus(); per_person.press('Enter')
    expect(per_person).to_be_focused()
    expect(per_person).to_have_attribute('aria-pressed', 'true')
    per_person_axis = assert_metric(chart, 'perPerson', 2021, scope, known)
    for year in [2014, 2015, 2023, 2021]:
        select_year(chart, 'perPerson', year)
        assert_metric(chart, 'perPerson', year, scope, known, per_person_axis)
    chart.screenshot(path=str(ARTIFACTS / f'gdp-per-person-2021-{tag}.png'), animations='disabled')
    metric_button(chart, 'gdp').click()
    assert_metric(chart, 'gdp', 2021, scope, known, gdp_axis)
    for control in chart.locator('.mf-metric-switch button').all():
        assert control.evaluate('el => el.clientHeight >= 44 && el.scrollWidth <= el.clientWidth + 1')
    no_overflow(page, chart)
    return chart


def provenance(chart):
    details = chart.locator('.mf-source-details')
    details.locator('summary').click()
    expect(details).to_contain_text('Unknown')
    expect(details).to_contain_text('not independently cross-checked')
    for metric, source in SOURCES.items():
        section = details.locator('.mf-source-files section').filter(has_text=source['indicator'])
        expect(section).to_have_count(1)
        expect(section).to_contain_text(source['commit'])
        expect(section).to_contain_text(source['sha256'])
        expect(section.locator('time')).to_have_attribute('datetime', source['retrievedAt'])
        expect(section.locator(f'a[href*="/{source["commit"]}/data/{metric}.csv"]')).to_have_count(1)
    details.locator('summary').click()


def trend(page, chart, scope, tag):
    view = chart.get_by_role('group', name='Chart view', exact=True)
    view.get_by_role('radio', name='Market trend', exact=True).check()
    panel = chart.locator('.market-trend')
    chooser = panel.get_by_role('combobox', name=re.compile(r'^Trend market'))
    assert chooser.locator('option').evaluate_all('(els) => els.map(el => el.value)') == scope
    chooser.select_option('singapore')
    for metric in ['population', 'perPerson', 'gdp']:
        metric_button(chart, metric).click()
        expect(slider(chart, metric)).to_have_value('2021')
        expect(panel.locator('.mt-scale-caption')).to_contain_text('Singapore’s range')
        points = panel.locator('circle[data-year][data-value]')
        assert points.count() == 10
        actual = points.evaluate_all('(els) => els.map(el => [Number(el.dataset.year),Number(el.dataset.value)])')
        assert actual == [[year, observed('singapore', metric, year)] for year in YEARS]
        if metric == 'population':
            y2019 = float(panel.locator('circle[data-year="2019"]').get_attribute('cy').rstrip('%'))
            y2021 = float(panel.locator('circle[data-year="2021"]').get_attribute('cy').rstrip('%'))
            assert y2021 > y2019, 'The observed population decline must point down on the chart'
        years = panel.get_by_role('radiogroup', name='Select a year on the trend', exact=True)
        point2020 = years.locator('input[value="2020"]')
        point2020.focus(); point2020.press('Space')
        expect(slider(chart, metric)).to_have_value('2020')
        point2020.press('ArrowRight')
        expect(years.locator('input[value="2021"]')).to_be_focused()
        expect(slider(chart, metric)).to_have_value('2021')
        assert float(panel.locator('.mt-readout data').get_attribute('value')) == observed('singapore', metric, 2021)
        # Native summary and table make each full-precision observation inspectable.
        panel.get_by_text('Annual values', exact=True).click()
        table_rows = panel.locator('table tr[data-year]')
        assert table_rows.evaluate_all('(els) => els.map(el => Number(el.dataset.year))') == YEARS
        for year in YEARS:
            assert float(panel.locator(f'table tr[data-year="{year}"] td data').get_attribute('value')) == observed('singapore', metric, year)
        panel.get_by_text('Annual values', exact=True).click()
        no_overflow(page, chart)
        panel.screenshot(path=str(ARTIFACTS / f'trend-singapore-{metric}-{tag}.png'), animations='disabled')
    chooser.select_option('thailand')
    assert float(panel.locator('.mt-readout data').get_attribute('value')) == observed('thailand', 'gdp', 2021)
    view.get_by_role('radio', name='Compare markets', exact=True).check()
    assert_metric(chart, 'gdp', 2021, scope, scope)
    view.get_by_role('radio', name='Market trend', exact=True).check()
    expect(chooser).to_have_value('thailand')
    expect(slider(chart, 'gdp')).to_have_value('2021')
    view.get_by_role('radio', name='Compare markets', exact=True).check()
    select_year(chart, 'gdp', 2014)


def latest_headlines_and_export(page, tag):
    for market in ['thailand', 'singapore']:
        card = page.locator(f'.market-country-card[data-market="{market}"]')
        labels = card.locator('dl dd[aria-label]').evaluate_all('(els) => els.map(el => el.getAttribute("aria-label"))')
        assert f'{observed(market, "population", 2023):,} people, 2023' in labels
        assert all('2023' in text for text in labels)
    page.locator('.flow-header').get_by_role('button', name='Compare', exact=True).click()
    comparison = page.locator('#market-comparison')
    expect(comparison.get_by_role('rowheader', name='Population · 2023', exact=True)).to_be_visible()
    expect(comparison.get_by_role('rowheader', name='GDP · 2023 · current US$', exact=True)).to_be_visible()
    with page.expect_download() as pending:
        comparison.get_by_role('button', name='Export shortlist', exact=True).click()
    path = ARTIFACTS / f'historical-shortlist-{tag}.json'
    pending.value.save_as(path)
    data = json.loads(path.read_text())['historicalSnapshot']
    assert data['provenance']['observationYear'] == 2023
    for metric, source in SOURCES.items():
        for key, value in source.items():
            assert data['provenance'][metric][key] == value
    assert data['gdpPerPerson']['year'] == 2023
    for method in ['annualGdpPerPerson', 'populationChange', 'nominalGdpChange']:
        assert data[method]['fromYear'] == 2014 and data[method]['toYear'] == 2023
        assert data[method]['method']
    observations = {row['countryCode']: row for row in data['observations']}
    assert set(observations) == {'SGP', 'THA'}
    for code, market in [('SGP', 'singapore'), ('THA', 'thailand')]:
        row = observations[code]
        assert row['population'] == observed(market, 'population', 2023)
        assert row['gdpUsd'] == observed(market, 'gdp', 2023)
        assert row['gdpPerPersonUsd'] == observed(market, 'perPerson', 2023)
        assert row['populationSeries'] == [{'year': year, 'value': observed(market, 'population', year)} for year in YEARS]
        assert row['annualGdpPerPerson'] == [{'year': year, 'value': observed(market, 'perPerson', year)} for year in YEARS]
        change = 100 * (observed(market, 'population', 2023) - observed(market, 'population', 2014)) / observed(market, 'population', 2014)
        assert row['populationChangePercent'] == round(change, 1)
    return path.name


def check(browser, width, theme):
    context = browser.new_context(viewport={'width': width, 'height': 900}, color_scheme=theme,
                                  reduced_motion='reduce', accept_downloads=True, service_workers='block')
    external, errors = [], []
    def local_only(route):
        if urlsplit(route.request.url).netloc == urlsplit(BASE).netloc:
            route.continue_()
        else:
            external.append(urlsplit(route.request.url).netloc); route.abort()
    context.route('**/*', local_only)
    context.add_init_script(f"localStorage.setItem('theme',{json.dumps(theme)}); localStorage.setItem('flow-market-shortlist-v1',JSON.stringify({{version:1,countries:[]}}));")
    page = context.new_page(); page.set_default_timeout(15000)
    page.on('pageerror', lambda exc: errors.append(str(exc)))
    tag = f'{theme}-{width}'
    try:
        page.goto(BASE, wait_until='networkidle')
        expect(page.locator('html')).to_have_class(theme)
        all_markets = [market[0] for market in MARKETS]
        chart = compare_metrics(page, all_markets, SERIES, f'overview-{tag}')
        provenance(chart)
        for country in ['Singapore', 'Thailand']:
            page.get_by_role('button', name=f'Select {country}', exact=True).click()
        page.get_by_role('button', name='Data Visualization', exact=True).click()
        # Research-workflow navigation starts a fresh chart; within-chart year survives metric/view switches.
        chart = compare_metrics(page, ['thailand', 'singapore'], ['thailand', 'singapore'], f'data-{tag}')
        trend(page, chart, ['thailand', 'singapore'], tag)
        export = latest_headlines_and_export(page, tag)
        assert not errors and not external, (errors, external)
        return {'width': width, 'theme': theme, 'passed': True, 'export': export,
                'populationDecline': {'market': 'Singapore', '2019': 5703569, '2021': 5453566}}
    finally:
        context.close()


if __name__ == '__main__':
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        try:
            results = [check(browser, width, theme) for width, theme in [(1440, 'light'), (360, 'dark'), (360, 'light')]]
        finally:
            browser.close()
    (ARTIFACTS / 'results.json').write_text(json.dumps(results, indent=2) + '\n')
    print('PASS: annual population/GDP/precise per-person ratios; shared year and stable scale/order; '
          'trend points/keyboard/sorted annual table; fixed2023 headlines/export; per-file provenance; desktop/mobile')
