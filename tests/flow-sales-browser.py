"""Model one month's sales, compare two currencies and restore the inputs in a fresh browser."""
import json
import os
import re
from copy import deepcopy
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get("FLOW_TEST_URL", "http://127.0.0.1:4173").rstrip("/")
ARTIFACTS = Path(os.environ.get("FLOW_TEST_ARTIFACTS", "/tmp/flow-sales"))
FIELDS = ("Monthly fixed costs", "Price per unit", "Variable cost per unit")
GBP_INPUTS = ("30.00", "12.50", "7.50")


def button(scope, name):
    return scope.get_by_role("button", name=name, exact=True)


def session(browser, width):
    context = browser.new_context(viewport={"width": width, "height": 900}, reduced_motion="reduce", accept_downloads=True)
    errors, external = [], []

    def local_only(route):
        if urlsplit(route.request.url).netloc == urlsplit(BASE).netloc:
            route.continue_()
        else:
            external.append(urlsplit(route.request.url).netloc)
            route.abort()

    context.route("**/*", local_only)
    context.on("page", lambda p: p.on("pageerror", lambda error: errors.append(str(error))))
    return context, context.new_page(), errors, external


def download(page):
    with page.expect_download() as event:
        button(page, "Export market plan").click()
    assert event.value.suggested_filename == "flow-market-plan.json"
    return json.loads(event.value.path().read_text())


def scenario(plan, market):
    return next(row["breakEvenScenario"] for row in plan["markets"] if row["id"] == market)


def enter_costs(sheet, values):
    for label, value in zip(FIELDS, values):
        sheet.get_by_label(label, exact=True).fill(value)


def amount(area, term):
    return area.get_by_text(term, exact=True).locator("xpath=following-sibling::dd[1]")


def expect_break_even(sheet, count):
    expect(amount(sheet, "Break-even sales")).to_contain_text(re.compile(rf"{count}\s+units/month"))


def test_results(page, sheet):
    units = sheet.get_by_label("Expected monthly sales", exact=True)
    expect(units).to_have_value("")
    old = scenario(download(page), "uk")
    assert "expectedMonthlyUnits" not in old["inputs"]
    assert not old.get("monthlySales") or old["monthlySales"]["result"]["netResult"] is None
    area = sheet.get_by_role("region", name="Monthly sales scenario", exact=True)
    for quantity, revenue, costs, net, label in [
        ("0", "0.00", "30.00", "-30.00", "Shortfall"), ("4", "50.00", "60.00", "-10.00", "Shortfall"),
        ("6", "75.00", "75.00", "0.00", "Break-even"), ("8", "100.00", "90.00", "10.00", "Surplus"),
    ]:
        units.fill(quantity)
        expect_break_even(sheet, 6)
        for term, value in [("Revenue", revenue), ("Modeled costs", costs), (label, net)]:
            expect(amount(area, term)).to_contain_text(f"{value} GBP")
        largest = max(float(revenue), float(costs))
        for term, value in [("Revenue", revenue), ("Modeled costs", costs)]:
            bar = amount(area, term).locator(".me-track > span")
            width = bar.evaluate("el => parseFloat(el.style.width)")
            assert abs(width - 100 * float(value) / largest) < 0.011
        plan = download(page)
        result = scenario(plan, "uk")
        assert plan["version"] == 3 and result["inputs"]["expectedMonthlyUnits"] == quantity
        assert result["monthlySales"]["result"] == {
            "status": "calculated", "revenue": revenue, "totalCosts": costs, "netResult": net,
        }

    for draft in ("2.5", "-"):
        units.fill(draft)
        expect_break_even(sheet, 6)
        expect(units).to_have_attribute("aria-invalid", "true")
        expect(area).to_contain_text(re.compile("whole number", re.I))
        invalid = scenario(download(page), "uk")
        assert invalid["inputs"]["expectedMonthlyUnits"] == draft
        assert invalid["monthlySales"]["result"]["status"] == "invalid-volume"
        assert invalid["monthlySales"]["result"]["netResult"] is None
    units.fill("")
    expect_break_even(sheet, 6)
    again = download(page)
    assert again["version"] == 1 and "expectedMonthlyUnits" not in scenario(again, "uk")["inputs"]
    units.fill("8")


def currency_guard(context, page, sheet):
    units = sheet.get_by_label("Expected monthly sales", exact=True)
    currency = sheet.get_by_label("Currency", exact=True)
    confirm = sheet.get_by_role("group", name="Confirm worksheet change", exact=True)
    currency.select_option("USD")
    button(confirm, "Cancel").click()
    expect(units).to_have_value("8")
    currency.select_option("USD")
    peer = context.new_page()
    peer.goto(BASE + "/#/plan/worksheet/uk")
    peer.locator("#break-even-uk").get_by_label("Expected monthly sales", exact=True).fill("9")
    expect(units).to_have_value("9")
    if confirm.is_visible():
        button(confirm, "Switch to USD and clear amounts").click()
        expect(sheet.get_by_role("status").filter(has_text="another tab")).to_be_visible()
    expect(currency).to_have_value("GBP")
    expect(sheet.get_by_label("Price per unit", exact=True)).to_have_value("12.50")
    peer.close()
    currency.select_option("USD")
    button(confirm, "Switch to USD and clear amounts").click()
    expect(currency).to_have_value("USD")
    expect(units).to_have_value("9")
    for label in FIELDS:
        expect(sheet.get_by_label(label, exact=True)).to_have_value("")
    cleared = scenario(download(page), "uk")
    assert cleared["inputs"]["expectedMonthlyUnits"] == "9"
    assert cleared["monthlySales"]["result"]["status"] == "incomplete"
    assert cleared["monthlySales"]["result"]["netResult"] is None


def compare_and_reopen(page, uk, sg):
    comparison = page.locator("details.monthly-sales-comparison")
    comparison.locator(":scope > summary").click()
    london = comparison.locator('li[data-market="uk"]')
    singapore = comparison.locator('li[data-market="singapore"]')
    expect(amount(london, "Expected units")).to_have_text("8")
    expect(amount(london, "Break-even units")).to_have_text("6")
    expect(amount(london, "Monthly result")).to_contain_text("10.00 GBP")
    expect(amount(singapore, "Monthly result")).to_contain_text("8.00 SGD")
    # The current fragment already names the UK worksheet. Reopening must still move focus.
    uk.locator(":scope > summary").click()
    expect(uk).to_have_js_property("open", False)
    button(london, "Open worksheet for United Kingdom").click()
    expect(uk.locator(":scope > summary")).to_be_focused()
    expect(uk).to_have_js_property("open", True)
    expect(page).to_have_url(BASE + "/#/plan/worksheet/uk")
    button(singapore, "Open worksheet for Singapore").click()
    expect(page).to_have_url(BASE + "/#/plan/worksheet/singapore")
    expect(sg.locator(":scope > summary")).to_be_focused()
    expect(sg).to_have_js_property("open", True)


def model(browser, width):
    context, page, errors, external = session(browser, width)
    try:
        page.goto(BASE + "/#/research", wait_until="networkidle")
        button(page, "Remove Thailand from shortlist").click()
        button(page, "Select United Kingdom").click()
        button(page, "Industry Deep Dive").click()
        page.locator("summary").filter(has_text="Cost & delivery").click()
        page.get_by_role("combobox", name="Research in", exact=True).select_option("uk")
        button(page, "Open break-even worksheet").click()
        expect(page).to_have_url(BASE + "/#/plan/worksheet/uk")
        uk = page.locator("#break-even-uk")
        expect(uk.locator(":scope > summary")).to_be_focused()
        expect(uk.get_by_label("Currency", exact=True)).to_have_value("GBP")
        enter_costs(uk, GBP_INPUTS)
        test_results(page, uk)
        sg = page.locator("#break-even-singapore")
        sg.locator(":scope > summary").click()
        expect(sg.get_by_label("Currency", exact=True)).to_have_value("SGD")
        enter_costs(sg, ("12", "3", "1"))
        sg.get_by_label("Expected monthly sales", exact=True).fill("10")
        page.reload(wait_until="networkidle")
        expect(uk.get_by_label("Expected monthly sales", exact=True)).to_have_value("8")
        expect_break_even(uk, 6)
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        area = uk.get_by_role("region", name="Monthly sales scenario", exact=True)
        area.evaluate("el => el.scrollIntoView({block: 'center', behavior: 'instant'})")
        area.screenshot(path=str(ARTIFACTS / f"monthly-sales-gbp-{width}.png"))
        plan = download(page)
        assert set(row["id"] for row in plan["markets"]) == {"uk", "singapore"}
        assert scenario(plan, "singapore")["monthlySales"]["result"] == {
            "status": "calculated", "revenue": "30.00", "totalCosts": "22.00", "netResult": "8.00",
        }
        assert page.evaluate("JSON.parse(localStorage.getItem('flow-market-plans-v1')).version") == 3
        compare_and_reopen(page, uk, sg)
        currency_guard(context, page, uk)
        assert not errors and not external, (errors, external)
        return plan
    finally:
        context.close()


def restore(browser, width, plan):
    context, page, errors, external = session(browser, width)
    try:
        forged = deepcopy(plan)
        incoming = scenario(forged, "uk")
        incoming["monthlySales"]["result"].update({"netResult": "999999.99", "revenue": "0.01", "totalCosts": "0.01"})
        incoming["result"]["breakEvenUnits"] = -900
        page.goto(BASE + "/#/plan", wait_until="networkidle")
        button(page, "Restore market plan").click()
        dialog = page.get_by_role("dialog", name="Restore market plan", exact=True)
        dialog.get_by_label("Choose a Flow plan file").set_input_files({
            "name": "flow-market-plan.json", "mimeType": "application/json", "buffer": json.dumps(forged).encode(),
        })
        button(dialog, "Apply restore").click()
        page.goto(BASE + "/#/plan/worksheet/uk")
        uk = page.locator("#break-even-uk")
        expect_break_even(uk, 6)
        expect(uk.get_by_label("Expected monthly sales", exact=True)).to_have_value("8")
        expect(amount(uk, "Surplus")).to_contain_text("10.00 GBP")
        restored = download(page)
        for market in ("uk", "singapore"):
            assert scenario(restored, market) == scenario(plan, market)
        assert not errors and not external, (errors, external)
    finally:
        context.close()


if __name__ == "__main__":
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
        try:
            for width in (1440, 390):
                restore(browser, width, model(browser, width))
        finally:
            browser.close()
    print("PASS: expected monthly sales, blank and zero, decimal amounts, two currencies, concurrent edits and v3 restore")
