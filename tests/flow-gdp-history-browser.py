"""Check historical GDP, population and derived output per resident in both research views."""
import json
import os
import re
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright

from flow_coverage import MARKETS

BASE = os.environ.get("FLOW_TEST_URL", "http://127.0.0.1:4173").rstrip("/")
ARTIFACTS = Path(os.environ.get("FLOW_TEST_ARTIFACTS", "/tmp/flow-gdp-history"))

# Historical observations from the pinned CSV revisions in docs/FLOW_MARKET_SNAPSHOT.md.
GDP = {
    "cambodia": {2014: "16702610842.35294", 2015: "18049954289.472065", 2023: "31772759998.85713"},
    "thailand": {2014: "407339040197.65125", 2015: "401296238228.0839", 2023: "514944993833.5776"},
    "united-arab-emirates": {2014: "414105366752.8931", 2015: "370275469571.13684", 2023: "504173451327.43365"},
    "uk": {2014: "3064708247921.4277", 2015: "2927911140916.7314", 2023: "3340032380668.0356"},
}
POPULATION = {"cambodia": "17423880", "thailand": "71702435", "united-arab-emirates": "10483751", "uk": "68526000"}


def axis_ticks(chart):
    labels = chart.locator(".mf-axis > div > span").all_text_contents()
    assert len(labels) >= 2 and labels[0] == "0", labels
    return labels


def assert_gdp(chart, year, market_ids, axis):
    rows = chart.get_by_role("list", name=f"{year} GDP in current US dollars comparison")
    expect(rows).to_be_visible()
    assert axis_ticks(chart) == axis
    maximum_billions = float(axis[-1].replace(",", ""))
    for market_id in market_ids:
        expected = GDP[market_id][year]
        row = rows.locator(f'li[data-market="{market_id}"]')
        value = row.locator("data")
        expect(value).to_have_attribute("value", expected)
        expect(value).to_have_accessible_name(re.compile(rf"current US dollars, {year}$"))
        width = row.locator(".mf-bar").evaluate("bar => parseFloat(bar.style.width)")
        expected_width = 100 * float(expected) / (maximum_billions * 1e9)
        assert abs(width - expected_width) < 0.001, (market_id, year, width, expected_width)


def assert_per_person(chart, market_ids):
    rows = chart.get_by_role("list", name="2023 GDP per person comparison")
    expect(rows).to_be_visible()
    expect(chart.locator(".mf-snapshot-label")).to_have_text("2023 historical snapshot · Derived")
    expect(chart.locator(".mf-chart-context")).to_contain_text("US$ per person")
    expect(chart.locator(".mf-chart-context")).to_contain_text("Shared linear scale")
    expect(chart.locator(".mf-limit")).to_contain_text("output per resident")
    expect(chart.locator(".mf-limit")).to_contain_text("customer demand")
    maximum = float(axis_ticks(chart)[-1].replace(",", ""))
    for market_id in market_ids:
        expected = float(GDP[market_id][2023]) / int(POPULATION[market_id])
        row = rows.locator(f'li[data-market="{market_id}"]')
        value = row.locator("data")
        assert float(value.get_attribute("value")) == expected
        expect(value).to_have_text(f"${expected:,.0f}")
        expect(value).to_have_accessible_name(re.compile(r"current US dollars per person, 2023$"))
        width = row.locator(".mf-bar").evaluate("bar => parseFloat(bar.style.width)")
        assert abs(width - 100 * expected / maximum) < 0.001, (market_id, width, expected, maximum)
    # Grid lines can remain on small screens, while tick labels need room to read.
    ticks = [tick.bounding_box() for tick in chart.locator(".mf-axis > div > span:visible").all()]
    assert len(ticks) >= 2
    assert all(a["x"] + a["width"] <= b["x"] for a, b in zip(ticks, ticks[1:])), ticks
    for button in chart.locator(".mf-metric-switch button").all():
        assert button.evaluate("""el => el.clientHeight >= 44 && el.scrollWidth <= el.clientWidth + 1
            && el.getBoundingClientRect().left >= 0 && el.getBoundingClientRect().right <= innerWidth""")
    assert chart.evaluate("el => el.scrollWidth <= el.clientWidth + 1")


def exercise_chart(page, market_ids, expected_rows, per_person_screenshot=None):
    chart = page.locator(".market-fundamentals")
    slider = chart.get_by_role("slider", name="GDP observation year", exact=True)
    expect(chart.locator(".mf-row")).to_have_count(expected_rows)
    expect(slider).to_have_value("2023")
    axis = axis_ticks(chart)
    assert_gdp(chart, 2023, market_ids, axis)
    slider.focus()
    for key, year in [("Home", 2014), ("ArrowRight", 2015), ("End", 2023), ("Home", 2014)]:
        slider.press(key)
        expect(slider).to_be_focused()
        expect(slider).to_have_value(str(year))
        assert_gdp(chart, year, market_ids, axis)

    chart.get_by_role("button", name="Population", exact=True).click()
    expect(slider).to_have_count(0)
    population = chart.get_by_role("list", name="2023 Total population comparison")
    for market_id in market_ids:
        value = population.locator(f'li[data-market="{market_id}"] data')
        expect(value).to_have_attribute("value", POPULATION[market_id])
        expect(value).to_have_accessible_name(re.compile(r"people, 2023$"))
    per_person = chart.get_by_role("button", name="GDP per person", exact=True)
    per_person.focus()
    per_person.press("Enter")
    expect(per_person).to_have_attribute("aria-pressed", "true")
    expect(per_person).to_be_focused()
    expect(slider).to_have_count(0)
    assert_per_person(chart, market_ids)
    if per_person_screenshot:
        chart.screenshot(path=str(per_person_screenshot), animations="disabled")
    chart.get_by_role("button", name="GDP", exact=True).click()
    expect(slider).to_have_value("2014")
    assert_gdp(chart, 2014, market_ids, axis)
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    assert chart.evaluate("el => el.scrollWidth <= el.clientWidth + 1")
    return chart


def check(browser, width, theme):
    context = browser.new_context(viewport={"width": width, "height": 900}, color_scheme=theme, reduced_motion="reduce")
    context.route("**/*", lambda route: route.continue_() if urlsplit(route.request.url).netloc == urlsplit(BASE).netloc else route.abort())
    context.add_init_script(f"localStorage.setItem('theme', {json.dumps(theme)})")
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda exc: errors.append(str(exc)))
    try:
        page.goto(BASE, wait_until="networkidle")
        expect(page.locator("html")).to_have_class(theme)
        for country in ("Singapore", "Thailand"):
            page.get_by_role("button", name=f"Remove {country} from shortlist", exact=True).click()
        exercise_chart(page, GDP, len(MARKETS), ARTIFACTS / f"gdp-per-person-all-{theme}-{width}.png")
        for country in ("Cambodia", "Thailand"):
            page.get_by_role("button", name=f"Select {country}", exact=True).click()
        page.get_by_role("button", name="Data Visualization", exact=True).click()
        chart = exercise_chart(page, ("cambodia", "thailand"), 2)
        chart.screenshot(path=str(ARTIFACTS / f"gdp-2014-{theme}-{width}.png"), animations="disabled")
        assert not errors, errors
    finally:
        context.close()


if __name__ == "__main__":
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
        try:
            check(browser, 1440, "light")
            check(browser, 360, "dark")
            check(browser, 360, "light")
        finally:
            browser.close()
    print("PASS: keyboard GDP years, 2023 population and derived GDP per person, precise values and scaled bars, shortlist scope and readable desktop/mobile axes")
