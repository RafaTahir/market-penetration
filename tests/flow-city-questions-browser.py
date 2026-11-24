"""Save real guide questions through city research, comparison, plan and export."""
import json
import os
import re
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get("FLOW_TEST_URL", "http://127.0.0.1:4173").rstrip("/")
ARTIFACTS = Path(os.environ.get("FLOW_TEST_ARTIFACTS", "/tmp/flow-city-questions"))
ARTIFACTS.mkdir(parents=True, exist_ok=True)
CUSTOMERS = "Kuala Lumpur customers or a wider Klang Valley catchment?"
SETUP = "Which national setup and Kuala Lumpur premises routes fit?"
NOTE = "Browser test fixture: ask the property manager about the address."
PLANS = "flow-market-plans-v1"


def run_journey(browser, width, storage_blocked):
    context = browser.new_context(
        viewport={"width": width, "height": 900}, accept_downloads=True, reduced_motion="reduce"
    )
    errors, external = [], []

    def local_only(route):
        if urlsplit(route.request.url).netloc == urlsplit(BASE).netloc:
            route.continue_()
        else:
            external.append(route.request.url.split("?")[0])
            route.abort()

    context.route("**/*", local_only)
    if storage_blocked:
        context.add_init_script("Object.defineProperty(window, 'localStorage', {get(){throw new DOMException('Blocked', 'SecurityError')}})")
    else:
        # A prior-release note must survive adding, exporting and removing guide questions.
        stored = {"version": 1, "notes": {"malaysia": {"nextStep": NOTE, "updatedAt": None}}}
        context.add_init_script(f"""if (localStorage.getItem('{PLANS}') === null)
          localStorage.setItem('{PLANS}', {json.dumps(json.dumps(stored))});""")

    page = context.new_page()
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(BASE, wait_until="networkidle")
    for name in ("Thailand", "Singapore"):
        page.get_by_role("button", name=f"Deselect {name}", exact=True).click()

    search = page.get_by_label("Search markets or cities")
    search.fill("no-matching-market")
    page.get_by_role("button", name=re.compile("^Compare markets")).click()
    comparison = page.locator("#market-comparison")
    comparison.get_by_text("Choose markets", exact=True).click()
    expect(search).to_have_value("")
    expect(page.locator("#explore-markets")).to_be_focused()
    expect(page.locator(".market-country-card")).to_have_count(6)
    comparison.get_by_role("button", name="Close market comparison").click()

    page.get_by_role("button", name="City Analysis", exact=True).click()
    city = page.locator("#city-research-malaysia")
    expect(city).to_contain_text(CUSTOMERS)
    city.get_by_text("Shortlist & save", exact=True).click()
    expect(city.get_by_text("Saved to plan", exact=True)).to_be_visible()
    expect(page.get_by_role("button", name="Deselect Malaysia", exact=True)).to_have_count(1)
    page.get_by_role("group", name="City research lens").get_by_role("button", name="Setup", exact=True).click()
    expect(city).to_contain_text(SETUP)
    city.get_by_text("Save question", exact=True).click()
    page.get_by_role("button", name="Select Thailand", exact=True).click()
    page.get_by_role("button", name=re.compile("^Compare markets")).click()
    comparison.get_by_role("link", name="Plan these markets", exact=True).click()
    card = page.locator('.mph-market[data-market="malaysia"]')
    expect(card.get_by_role("heading", name="Saved research questions", exact=True)).to_be_visible()
    for question in (CUSTOMERS, SETUP):
        expect(card.get_by_text(question, exact=True)).to_be_visible()
    if storage_blocked:
        expect(page.get_by_text(re.compile("Session only"), exact=False).first).to_be_visible()
    else:
        card.locator(".mph-next-step summary").click()
        expect(page.get_by_label("Your next step for Malaysia")).to_have_value(NOTE)
        page.reload(wait_until="networkidle")
        expect(card.get_by_text(SETUP, exact=True)).to_be_visible()
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    page.screenshot(path=str(ARTIFACTS / f"plan-{width}.png"), full_page=True)

    with page.expect_download() as download:
        page.get_by_role("button", name="Export market plan", exact=True).click()
    plan = json.loads(download.value.path().read_text())
    by_market = {market["id"]: market for market in plan["markets"]}
    assert set(by_market) == {"malaysia", "thailand"}
    assert by_market["thailand"]["savedResearchQuestions"] == []
    market = by_market["malaysia"]
    if not storage_blocked:
        assert market["userNextStep"] == NOTE
    saved = {q["lens"]: q for q in market["savedResearchQuestions"]}
    assert set(saved) == {"customers", "setup"}
    assert saved["customers"]["question"] == CUSTOMERS and saved["setup"]["question"] == SETUP
    assert all(q["kind"] == "unverified-research-prompt" for q in saved.values())
    assert {s["url"] for s in saved["customers"]["sources"]} == {"https://www.dosm.gov.my/"}
    assert {s["url"] for s in saved["setup"]["sources"]} == {"https://www.mida.gov.my/", "https://www.dbkl.gov.my/"}

    card.get_by_role("button", name=f"Remove question: {CUSTOMERS}", exact=True).click()
    expect(card.get_by_role("button", name=re.compile("Remove"))).to_have_count(1)
    page.get_by_role("link", name="Explore markets", exact=True).last.click()
    page.get_by_role("button", name="City Analysis", exact=True).click()
    expect(city.get_by_text("Save question", exact=True)).to_be_visible()
    page.get_by_role("group", name="City research lens").get_by_role("button", name="Setup", exact=True).click()
    expect(city.get_by_text("Saved to plan", exact=True)).to_be_visible()
    if not storage_blocked:
        page.reload(wait_until="networkidle")
        page.get_by_role("button", name="City Analysis", exact=True).click()
        expect(city.get_by_text("Save question", exact=True)).to_be_visible()
        assert page.evaluate(f"JSON.parse(localStorage.getItem('{PLANS}')).notes.malaysia.nextStep") == NOTE
    assert not errors, errors
    assert not external, external
    context.close()


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
    try:
        run_journey(browser, 1280, False)
        run_journey(browser, 390, True)
    finally:
        browser.close()
print("PASS: city questions, stale search recovery, plan export, legacy notes, persistence and session-only navigation")
