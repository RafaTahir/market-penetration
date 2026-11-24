"""Exercise cross-region discovery, historical comparison and city planning on a production preview."""
import json
import os
import re
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get("FLOW_TEST_URL", "http://127.0.0.1:4173").rstrip("/")
ARTIFACTS = Path(os.environ.get("FLOW_TEST_ARTIFACTS", "/tmp/flow-regional-coverage"))
AUS_2023 = {"population": 26659922, "gdpUsd": 1723827215334.7063}
CITY_PROMPT = "Which federal, NSW and council questions apply to this activity?"
NOTE = "Prior-release test note on comparing Singapore premises."


def run(browser, width, theme):
    context = browser.new_context(viewport={"width": width, "height": 900}, reduced_motion="reduce")
    errors, external = [], []
    def local_only(route):
        if urlsplit(route.request.url).netloc == urlsplit(BASE).netloc:
            route.continue_()
        else:
            external.append(route.request.url.split("?")[0])
            route.abort()
    context.route("**/*", local_only)
    # Simulate returning with notes and a shortlist from before the coverage expansion.
    old_plan = {"version": 1, "notes": {"singapore": {"nextStep": NOTE, "updatedAt": None}}}
    context.add_init_script(f"""if (localStorage.getItem('flow-market-plans-v1') === null) {{
      localStorage.setItem('flow-market-plans-v1', {json.dumps(json.dumps(old_plan))});
      localStorage.setItem('flow-market-shortlist-v1', '{{"version":1,"countries":["singapore"]}}');
      localStorage.setItem('theme', {json.dumps(theme)});
    }}""")
    page = context.new_page()
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(BASE, wait_until="networkidle")
    selector = page.get_by_role("group", name="Filter market cards by region", exact=True)
    def region(name):
        return selector.get_by_role("button", name=re.compile(rf"^{name}\b", re.I))
    cards = page.locator(".market-country-card")
    australia = cards.filter(has=page.get_by_role("heading", name="Australia", exact=True))
    expect(region("All regions")).to_have_attribute("aria-pressed", "true")
    expect(cards).to_have_count(7)
    region("Southeast Asia").click()
    expect(cards).to_have_count(6)
    search = page.get_by_label("Search markets or cities", exact=True)
    search.fill("Sydney")
    expect(cards).to_have_count(0)
    region("Oceania").click()
    search.fill("Sydney")
    expect(cards).to_have_count(1)
    expect(australia).to_contain_text("2023 historical snapshot")
    australia.get_by_role("button", name="Add Australia to shortlist and explore", exact=True).click()
    city = page.locator("#city-research-australia")
    expect(city).to_be_focused()
    expect(city).to_contain_text("Greater Sydney")
    page.get_by_role("group", name="City research lens").get_by_role("button", name="Setup", exact=True).click()
    expect(city).to_contain_text(CITY_PROMPT)
    city.get_by_role("button", name="Save question", exact=True).click()
    expect(city.get_by_text("Saved to plan", exact=True)).to_be_visible()

    search.fill("")
    region("Southeast Asia").click()
    expect(page.get_by_text("Your shortlist includes 1 market outside Southeast Asia.", exact=True)).to_be_visible()
    expect(australia).to_have_count(0)
    page.get_by_role("button", name=re.compile("^Compare markets")).click()
    comparison = page.locator("#market-comparison")
    for name in ("Australia", "Singapore"):
        expect(comparison.get_by_role("columnheader").filter(has_text=name)).to_have_count(1)
    expect(comparison.get_by_role("row", name=re.compile("^Region"))).to_contain_text("Oceania")
    expect(comparison.get_by_role("row", name=re.compile("^Nominal GDP change"))).to_contain_text("+17.4%")
    with page.expect_download() as download:
        comparison.get_by_role("button", name="Export shortlist", exact=True).click()
    exported = json.loads(download.value.path().read_text())
    by_country = {row["countryCode"]: row for row in exported["historicalSnapshot"]["observations"]}
    assert set(by_country) == {"AUS", "SGP"}
    aus = by_country["AUS"]
    assert all(aus[key] == value for key, value in AUS_2023.items())
    assert [point["year"] for point in aus["gdpSeries"]] == list(range(2014, 2024))
    assert aus["nominalGdpChangePercent"] == 17.4
    assert aus["gdpSeries"][0]["value"] == 1468597690006.215
    assert aus["gdpSeries"][-1]["value"] == AUS_2023["gdpUsd"]
    assert exported["historicalSnapshot"]["provenance"]["observationYear"] == 2023
    page.screenshot(path=str(ARTIFACTS / f"comparison-{width}.png"))
    comparison.get_by_role("link", name="Plan these markets", exact=True).click()
    au_plan = page.locator('.mph-market[data-market="australia"]')
    expect(au_plan.get_by_text(CITY_PROMPT, exact=True)).to_be_visible()
    page.reload(wait_until="networkidle")
    with page.expect_download() as download:
        page.get_by_role("button", name="Export market plan", exact=True).click()
    plan = json.loads(download.value.path().read_text())
    by_market = {item["id"]: item for item in plan["markets"]}
    assert set(by_market) == {"australia", "singapore"}
    assert by_market["australia"]["region"] == "Oceania"
    assert by_market["singapore"]["region"] == "Southeast Asia"
    assert by_market["singapore"]["userNextStep"] == NOTE
    question, = by_market["australia"]["savedResearchQuestions"]
    assert question["kind"] == "unverified-research-prompt" and question["question"] == CITY_PROMPT
    assert {source["url"] for source in question["sources"]} == {"https://business.gov.au/", "https://www.cityofsydney.nsw.gov.au/"}
    assert plan["detailedNotebookCoverage"] == ["Jakarta province, excluding Greater Jakarta", "City of Manila, excluding the rest of Metro Manila"]

    page.get_by_role("link", name="Explore markets", exact=True).last.click()
    page.get_by_role("button", name="Deselect Singapore", exact=True).click()
    region("Oceania").click()
    expect(cards).to_have_count(1)
    page.get_by_role("button", name="View unverified reference examples", exact=True).click()
    archive_scope = page.get_by_role("status").filter(has_text="Reference examples cover Southeast Asia only")
    expect(archive_scope).to_be_visible()
    expect(archive_scope).to_contain_text("Australia")
    expect(page.locator(".reference-research")).to_have_count(0)
    expect(page.get_by_role("heading", name="Reference report studio", exact=True)).to_have_count(0)
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    assert not errors, errors
    assert not external, external
    context.close()

ARTIFACTS.mkdir(parents=True, exist_ok=True)
with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
    try:
        run(browser, 1440, "light")
        run(browser, 390, "dark")
    finally:
        browser.close()
print("PASS: cross-region search/shortlist, AU national observations, Sydney guidance, prior notes, exported sources and legacy coverage on desktop and phone")
