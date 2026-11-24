"""Verify cross-field explorer searches and region recovery in a production browser build."""
import json
import os
import re
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright

from flow_coverage import MARKETS

BASE = os.environ.get("FLOW_TEST_URL", "http://127.0.0.1:4173").rstrip("/")
ARTIFACTS = Path(os.environ.get("FLOW_TEST_ARTIFACTS", "/tmp/flow-search"))
SHORTLIST_KEY = "flow-market-shortlist-v1"
PLAN_KEY = "flow-market-plans-v1"


def run(browser, width, theme, full_journey):
    context = browser.new_context(viewport={"width": width, "height": 900}, color_scheme=theme, reduced_motion="reduce")
    # Searching default worksheet currencies must preserve this user's chosen currency.
    old_plan = {"version": 1, "notes": {}, "scenarios": {"uk": {
        "currency": "USD", "monthlyFixedCosts": "20", "unitPrice": "8", "unitVariableCost": "3",
    }}}
    fixture = {SHORTLIST_KEY: json.dumps({"version": 1, "countries": ["uk", "vietnam"]}),
               PLAN_KEY: json.dumps(old_plan), "theme": theme}
    context.add_init_script(f"""for (const [key, value] of Object.entries({json.dumps(fixture)})) {{
        if (localStorage.getItem(key) === null) localStorage.setItem(key, value);
    }}""")
    errors, external = [], []

    def local_only(route):
        if urlsplit(route.request.url).netloc == urlsplit(BASE).netloc:
            route.continue_()
        else:
            external.append(route.request.url.split("?")[0])
            route.abort()

    context.route("**/*", local_only)
    page = context.new_page()
    page.on("pageerror", lambda exc: errors.append(str(exc)))
    try:
        page.goto(BASE, wait_until="networkidle")
        cards = page.locator(".market-country-card")
        catalog_ids = [market[0] for market in MARKETS]
        search = page.get_by_role("textbox", name="Search markets or cities", exact=True)
        regions = page.get_by_role("group", name="Filter market cards by region", exact=True)
        all_regions = regions.get_by_role("button", name=re.compile(r"^All regions\b"))
        broaden = page.get_by_role("button", name="Search all regions", exact=True)
        results = page.locator("#explore-markets")
        expect(page.locator("html")).to_have_class(theme)

        def expect_cards(expected):
            expect(cards).to_have_count(len(expected))
            assert cards.evaluate_all("rows => rows.map(row => row.dataset.market)") == expected

        def match(query, expected):
            search.fill(query)
            expect_cards(expected)

        # Retain the original search/plan navigation checks across all five layouts.
        expect(page.get_by_role("link", name="Plan my entry").first).to_be_visible()
        expect_cards(catalog_ids)
        match("Malaysia", ["malaysia"])
        search.press("Enter")
        expect(results).to_be_focused()
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        if not full_journey:
            assert not errors and not external, (errors, external)
            return

        # Multiple words can refer to different fields of the SAME country.
        for query, market_id in [
            ("nAiRoBi, KES", "kenya"), ("GBR London", "uk"), ("GBP U.K.", "uk"),
            ("Hồ Chí Minh Vietnam", "vietnam"), ("Africa / KEN", "kenya"), ("🇰🇪", "kenya"),
        ]:
            match(query, [market_id])
        match("KES London", [])
        expect(page.locator(".market-no-results")).to_contain_text("No markets match")
        expect(broaden).to_have_count(0)
        match(" , / ... ", [])
        match("   ", catalog_ids)
        match("", catalog_ids)

        # A valid result in a different region can be recovered without retyping.
        regions.get_by_role("button", name=re.compile(r"^Oceania\b")).click()
        match("Nairobi, KES", [])
        search.press("Enter")
        expect(results).to_be_focused()
        expect(page.locator(".market-no-results")).to_contain_text("Kenya")
        broaden.click()
        expect(all_regions).to_have_attribute("aria-pressed", "true")
        expect(results).to_be_focused()
        expect(search).to_have_value("Nairobi, KES")
        expect_cards(["kenya"])

        kenya = cards.first
        expect(kenya.get_by_role("button", name="Select Kenya", exact=True)).to_have_attribute("aria-pressed", "false")
        kenya.get_by_role("button", name="Sources for Kenya", exact=True).click()
        sources = kenya.locator(".market-source-panel")
        expect(sources).to_contain_text(re.compile(r"Default worksheet currency\s*KES", re.I))
        expect(sources).to_contain_text("Publication date")
        expect(sources).to_contain_text("Unknown")
        kenya.get_by_role("button", name="Sources for Kenya", exact=True).click()
        kenya.evaluate("el => el.scrollIntoView({block:'center', behavior:'instant'})")
        kenya.screenshot(path=str(ARTIFACTS / f"nairobi-search-{width}.png"))

        match("London GBP", ["uk"])
        uk = cards.first
        expect(uk.get_by_role("button", name="Deselect United Kingdom", exact=True)).to_have_attribute("aria-pressed", "true")
        uk.get_by_role("button", name="Sources for United Kingdom", exact=True).click()
        expect(uk.locator(".market-source-panel")).to_contain_text(re.compile(r"Default worksheet currency\s*GBP", re.I))
        match("London USD", [])
        page.get_by_role("button", name="Clear search", exact=True).click()
        expect(search).to_have_value("")
        expect_cards(catalog_ids)

        page.get_by_role("navigation", name="Main navigation").get_by_role("button", name="Compare", exact=True).click()
        row = page.locator("#market-comparison").get_by_role("row").filter(
            has=page.get_by_role("rowheader", name="Default worksheet currency", exact=True)
        )
        expect(row).to_contain_text("GBP")
        expect(row).to_contain_text("VND")

        page.get_by_role("navigation", name="Research modes", exact=True).get_by_role(
            "button", name="Data Visualization", exact=True
        ).click()
        page.get_by_role("button", name="Browse source library", exact=True).click()
        directory = page.get_by_role("main")
        source_search = directory.get_by_label("Search sources", exact=True)
        source_search.fill("Nairobi, KES statistics")
        expect(directory.get_by_role("status")).to_have_text("1 source")
        expect(directory.get_by_role("link")).to_have_attribute("href", "https://www.knbs.or.ke/")
        expect(directory).to_contain_text("Publication dates are unknown.")
        source_search.fill("KES London")
        expect(directory.get_by_role("status")).to_have_text("0 sources")

        saved_ids = page.evaluate("(key) => JSON.parse(localStorage.getItem(key)).countries", SHORTLIST_KEY)
        assert sorted(saved_ids) == ["uk", "vietnam"], saved_ids
        assert page.evaluate("(key) => JSON.parse(localStorage.getItem(key))", PLAN_KEY) == old_plan
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        assert not errors and not external, (errors, external)
    finally:
        context.close()


if __name__ == "__main__":
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
        try:
            for width, theme in [(360, "dark"), (390, "light"), (760, "dark"), (1165, "light"), (1440, "light")]:
                run(browser, width, theme, full_journey=width in (360, 1440))
        finally:
            browser.close()
    print("PASS: search focus and mobile planning at five widths; city/country/ISO/region/default-currency "
          "searches, punctuation, accents, flags, region recovery, personal currency and shortlist preservation")
