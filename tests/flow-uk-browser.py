"""Explore London, compare UK national observations, and transfer a GBP plan to a fresh browser."""
import json
import os
import re
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get("FLOW_TEST_URL", "http://127.0.0.1:4173").rstrip("/")
ARTIFACTS = Path(os.environ.get("FLOW_TEST_ARTIFACTS", "/tmp/flow-uk"))
FINDING = {"kind": "user-entered-research-finding", "text": "Fixture: follow up on the quoted premises.",
           "source": "Personal site visit notes", "observedOn": "2023-04-17"}
GBR_POPULATION = 68526000
GBR_GDP = 3340032380668.0356
GOV_SETUP = "https://www.gov.uk/set-up-business"
GOV_COUNCIL = "https://www.gov.uk/find-local-council"
ONS = "https://www.ons.gov.uk/"
LONDON_DATA = "https://data.london.gov.uk/"


def button(scope, name):
    return scope.get_by_role("button", name=name, exact=True)


def open_context(browser, width):
    context = browser.new_context(viewport={"width": width, "height": 900}, reduced_motion="reduce")
    errors, external = [], []

    def local_only(route):
        if urlsplit(route.request.url).netloc == urlsplit(BASE).netloc:
            route.continue_()
        else:
            external.append(route.request.url.split("?")[0])
            route.abort()

    context.route("**/*", local_only)
    page = context.new_page()
    page.on("pageerror", lambda error: errors.append(str(error)))
    return context, page, errors, external


def download(scope, page, label):
    with page.expect_download() as event:
        button(scope, label).click()
    return json.loads(event.value.path().read_text())


def london_scene(scope):
    image = scope.locator(".market-scene-rendered[data-market=uk] img")
    expect(image).to_be_visible()
    expect(image).to_have_attribute("src", "/art/london-thames.webp")
    assert image.evaluate("async img => { await img.decode(); return img.naturalWidth > 0; }")


def explore_and_plan(browser, width):
    context, page, errors, external = open_context(browser, width)
    try:
        page.goto(BASE, wait_until="networkidle")
        button(page, "Remove Thailand from shortlist").click()
        regions = page.get_by_role("group", name="Filter market cards by region")
        regions.get_by_role("button", name=re.compile("^Southeast Asia")).click()
        search = page.get_by_label("Search markets or cities", exact=True)
        search.fill("London")
        cards = page.locator(".market-country-card")
        expect(cards).to_have_count(0)
        button(page, "Search all regions").click()
        expect(cards).to_have_count(1)
        regions.get_by_role("button", name=re.compile("^Europe")).click()
        uk = cards.filter(has=page.get_by_role("heading", name="United Kingdom", exact=True))
        for term in ("GBR", "Britain", "UK", "London"):
            search.fill(term)
            expect(cards).to_have_count(1)
            expect(uk).to_be_visible()
        expect(uk.get_by_label("68,526,000 people, 2023", exact=True)).to_be_visible()
        london_scene(uk)
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        uk.evaluate("card => card.scrollIntoView({block: 'center', behavior: 'instant'})")
        uk.screenshot(path=str(ARTIFACTS / f"uk-card-{width}.png"))
        button(uk, "Add United Kingdom to shortlist and explore").click()
        city = page.locator("#city-research-uk")
        expect(city).to_be_focused()
        expect(city.get_by_role("heading", name="London", exact=True)).to_be_visible()
        london_scene(city)
        for source in (ONS, LONDON_DATA):
            expect(city.locator(f'a[href="{source}"]')).to_be_visible()
        button(page.get_by_role("group", name="City research lens"), "Setup").click()
        for source in (GOV_SETUP, GOV_COUNCIL):
            expect(city.locator(f'a[href="{source}"]')).to_be_visible()
        prompt = city.locator(".mr-city-question strong").inner_text()
        button(city, "Save question").click()
        city.get_by_role("link", name="Add finding in plan").click()
        expect(page).to_have_url(BASE + "/#/plan/question/uk/setup")
        row = page.locator("#question-uk-setup")
        expect(row).to_be_focused()
        expect(row).to_contain_text(prompt)
        button(row, "Add finding").click()
        row.get_by_label("Finding", exact=True).fill(FINDING["text"])
        row.get_by_label("Source (optional)", exact=True).fill(FINDING["source"])
        row.get_by_label("Observation date (optional)", exact=True).fill(FINDING["observedOn"])
        button(row, "Save finding").click()
        expect(row).to_contain_text(re.compile("user-entered.*unverified", re.I))
        page.goto(BASE + "/#/plan/worksheet/uk")
        sheet = page.locator("#break-even-uk")
        expect(sheet.locator(":scope > summary")).to_be_focused()
        expect(sheet.get_by_label("Currency", exact=True)).to_have_value("GBP")
        for label, amount in [("Monthly fixed costs", "1200"), ("Price per unit", "20"), ("Variable cost per unit", "8")]:
            sheet.get_by_label(label, exact=True).fill(amount)
        expect(sheet).to_contain_text(re.compile(r"100\s+units/month"))
        page.reload(wait_until="networkidle")
        plan_card = page.locator('.mph-market[data-market="uk"]')
        london_scene(plan_card)
        expect(row).to_contain_text(FINDING["text"])
        expect(sheet).to_contain_text(re.compile(r"100\s+units/month"))
        plan = download(page, page, "Export market plan")
        assert plan["version"] == 2 and plan["contentType"] == "user-market-plan-and-source-directory"
        assert {m["id"] for m in plan["markets"]} == {"singapore", "uk"}
        market = next(m for m in plan["markets"] if m["id"] == "uk")
        assert (market["region"], market["countryCode"], market["cityResearchStartingPoint"]) == ("Europe", "GBR", "London")
        assert market["sources"]["sourcePublicationDate"] is None and market["sources"]["sourceContentsVerified"] is False
        assert market["sources"]["countryStatistics"]["url"] == ONS
        assert market["sources"]["cityStatistics"]["url"] == LONDON_DATA
        question, = market["savedResearchQuestions"]
        assert question["kind"] == "unverified-research-prompt" and question["question"] == prompt
        assert {source["url"] for source in question["sources"]} == {GOV_SETUP, GOV_COUNCIL}
        assert question["userFinding"] == FINDING
        assert market["breakEvenScenario"]["inputs"]["currency"] == "GBP"
        assert market["breakEvenScenario"]["result"]["breakEvenUnits"] == 100

        page.locator(".mph-back").click()
        chart = page.locator(".market-fundamentals")
        button(chart, "GDP per person").click()
        ratio = chart.locator('li[data-market="uk"] data')
        expect(ratio).to_have_attribute("value", str(GBR_GDP / GBR_POPULATION))
        expect(ratio).to_have_accessible_name(re.compile(r"current US dollars per person, 2023$"))
        expect(chart.get_by_role("slider")).to_have_count(0)
        page.get_by_role("button", name=re.compile("^Compare markets")).click()
        compare = page.locator("#market-comparison")
        for country in ("Singapore", "United Kingdom"):
            expect(compare.get_by_role("columnheader").filter(has_text=country)).to_be_visible()
        expect(compare.get_by_role("row", name=re.compile("^Region"))).to_contain_text("Europe")
        if width <= 390:
            compare.get_by_role("columnheader").filter(has_text="United Kingdom").scroll_into_view_if_needed()
        if width in (1440, 390):
            compare.screenshot(path=str(ARTIFACTS / f"uk-singapore-comparison-{width}.png"))
        export = download(compare, page, "Export shortlist")
        snapshot = export["historicalSnapshot"]
        assert {r["countryCode"] for r in snapshot["observations"]} == {"GBR", "SGP"}
        national = next(r for r in snapshot["observations"] if r["countryCode"] == "GBR")
        assert national["population"] == GBR_POPULATION and national["gdpUsd"] == GBR_GDP
        assert national["gdpPerPersonUsd"] == GBR_GDP / GBR_POPULATION
        derived = snapshot["gdpPerPerson"]
        assert derived["year"] == 2023 and derived["unit"] == "current US dollars per person"
        assert "population" in derived["method"].lower() and "gdp" in derived["method"].lower()
        assert "income" in derived["limitation"].lower()
        assert [p["year"] for p in national["gdpSeries"]] == list(range(2014, 2024))
        assert national["gdpSeries"][0]["value"] == 3064708247921.4277
        assert national["gdpSeries"][-1]["value"] == national["gdpUsd"]
        assert snapshot["provenance"]["observationYear"] == 2023
        assert snapshot["provenance"]["gdp"]["indicator"] == "NY.GDP.MKTP.CD"
        assert "national" in export["limitation"].lower()
        button(page, "Close market comparison").click()
        button(page, "Remove Singapore from shortlist").click()
        button(page, "View unverified reference examples").click()
        expect(page.get_by_role("status").filter(has_text="Reference examples cover six markets")).to_contain_text("United Kingdom")
        expect(page.locator(".reference-research")).to_have_count(0)
        expect(page.get_by_role("heading", name="Reference report studio")).to_have_count(0)
        page.goto(BASE + "/#/research/reports")
        directory = page.get_by_role("main")
        directory.get_by_label("Search sources").fill("GBR city statistics")
        expect(directory.get_by_role("status")).to_have_text("1 source")
        expect(directory.get_by_role("link")).to_have_attribute("href", LONDON_DATA)
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        assert not errors and not external, (errors, external)
        return plan, market
    finally:
        context.close()


def restore(browser, width, plan, expected_market):
    context, page, errors, external = open_context(browser, width)
    try:
        page.goto(BASE + "/#/plan", wait_until="networkidle")
        expect(page.locator('.mph-market[data-market="uk"]')).to_have_count(0)
        button(page, "Restore market plan").click()
        dialog = page.get_by_role("dialog", name="Restore market plan")
        dialog.get_by_label("Choose a Flow plan file").set_input_files({
            "name": "flow-market-plan.json", "mimeType": "application/json", "buffer": json.dumps(plan).encode(),
        })
        expect(dialog).to_contain_text("United Kingdom")
        button(dialog, "Apply restore").click()
        expect(page.locator("#question-uk-setup")).to_contain_text(FINDING["source"])
        page.reload(wait_until="networkidle")
        restored = download(page, page, "Export market plan")
        assert next(m for m in restored["markets"] if m["id"] == "uk") == expected_market
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        assert not errors and not external, (errors, external)
    finally:
        context.close()


if __name__ == "__main__":
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
        try:
            for width in (1440, 1165, 768, 390, 320):
                plan, market = explore_and_plan(browser, width)
                restore(browser, width, plan, market)
        finally:
            browser.close()
    print("PASS: Europe/London discovery, UK–Singapore historical comparison, GBP plan, finding export/restore and archive scope")
