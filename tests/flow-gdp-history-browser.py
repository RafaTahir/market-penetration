"""Check keyboard-year selection and shared chart scales in both research views."""
import os
import re
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

from flow_coverage import MARKETS

BASE = os.environ.get("FLOW_TEST_URL", "http://127.0.0.1:4173").rstrip("/")
ARTIFACTS = Path(os.environ.get("FLOW_TEST_ARTIFACTS", "/tmp/flow-gdp-history"))

# Historical observations from the pinned CSV revisions in docs/FLOW_MARKET_SNAPSHOT.md.
GDP = {
    "cambodia": {2014: "16702610842.35294", 2015: "18049954289.472065", 2023: "31772759998.85713"},
    "thailand": {2014: "407339040197.65125", 2015: "401296238228.0839", 2023: "514944993833.5776"},
    "united-arab-emirates": {2014: "414105366752.8931", 2015: "370275469571.13684", 2023: "504173451327.43365"},
}
POPULATION = {"cambodia": "17423880", "thailand": "71702435", "united-arab-emirates": "10483751"}


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


def exercise_chart(page, market_ids, expected_rows):
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
    chart.get_by_role("button", name="GDP", exact=True).click()
    expect(slider).to_have_value("2014")
    assert_gdp(chart, 2014, market_ids, axis)
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    assert chart.evaluate("el => el.scrollWidth <= el.clientWidth + 1")
    return chart


def check(browser, width, theme):
    context = browser.new_context(viewport={"width": width, "height": 900}, color_scheme=theme, reduced_motion="reduce")
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda exc: errors.append(str(exc)))
    try:
        page.goto(BASE, wait_until="networkidle")
        for country in ("Singapore", "Thailand"):
            page.get_by_role("button", name=f"Remove {country} from shortlist", exact=True).click()
        exercise_chart(page, GDP, len(MARKETS))
        for country in ("Cambodia", "Thailand"):
            page.get_by_role("button", name=f"Select {country}", exact=True).click()
        page.get_by_role("button", name="Data Visualization", exact=True).click()
        chart = exercise_chart(page, ("cambodia", "thailand"), 2)
        chart.screenshot(path=str(ARTIFACTS / f"gdp-2014-{width}.png"), animations="disabled")
        assert not errors, errors
    finally:
        context.close()


if __name__ == "__main__":
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
        try:
            check(browser, 1440, "light")
            check(browser, 390, "dark")
        finally:
            browser.close()
    print("PASS: historical GDP years, full values, stable axes, shortlist scope and 2023 population on desktop and mobile")
