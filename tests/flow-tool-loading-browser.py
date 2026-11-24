"""Exercise optional tool downloads, failure recovery and direct-route guards on a production build."""
import json
import os
import re
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get("FLOW_TEST_URL", "http://127.0.0.1:4173").rstrip("/")
EXPLORER = BASE + "/#/research"
DIRECTORY = EXPLORER + "/reports"


def open_page(browser):
    context = browser.new_context(reduced_motion="reduce", service_workers="block")
    scripts = []
    origin = urlsplit(BASE).netloc
    context.route("**/*", lambda route: route.continue_() if urlsplit(route.request.url).netloc == origin else route.abort())

    def record(request):
        parts = urlsplit(request.url)
        if parts.netloc == origin and parts.path.endswith(".js"):
            scripts.append(request.url)

    page = context.new_page()
    page.on("request", record)
    return context, page, scripts


def deferred_chunk(browser, link, heading, module):
    context, page, scripts = open_page(browser)
    try:
        page.goto(EXPLORER, wait_until="networkidle")
        initial = set(scripts)
        page.get_by_role("link", name=link, exact=True).first.click()
        expect(page.get_by_role("heading", name=heading, exact=True)).to_be_visible()
        loaded = [url for url in scripts if url not in initial]
        assert loaded, f"Opening {heading} should request a deferred local module"
        # A build may also preload dependencies. Prefer the route module when named.
        return next((url for url in loaded if module in urlsplit(url).path), loaded[0])
    finally:
        context.close()


def blocked_tool(browser, chunk, session_only):
    context, page, _ = open_page(browser)
    blocked = []

    def block(route):
        blocked.append(route)

    if session_only:
        context.add_init_script("""{
            const save = Storage.prototype.setItem;
            Storage.prototype.setItem = function(key, value) {
                if (key === 'flow-market-shortlist-v1') throw new DOMException('Storage full', 'QuotaExceededError');
                return save.call(this, key, value);
            };
        }""")
    try:
        context.route(chunk, block)
        page.goto(EXPLORER, wait_until="networkidle")
        page.get_by_role("button", name="Select Cambodia", exact=True).click()
        if session_only:
            expect(page.locator(".explorer-shortlist")).to_contain_text("session only")
        page.evaluate("window.flowRecoveryDocument = 'original'")
        with page.expect_request(chunk):
            page.get_by_role("link", name="Source directory", exact=True).click()
        expect(page).to_have_url(DIRECTORY)
        expect(page.get_by_role("status").filter(has_text="Loading Source directory…")).to_be_visible()
        assert len(blocked) == 1 and blocked[0].request.url == chunk
        blocked[0].abort("failed")
        alert = page.get_by_role("alert")
        expect(alert.get_by_role("heading", name="Couldn’t open Source directory", exact=True)).to_be_visible()
        expect(alert.get_by_role("link", name="Return to explorer", exact=True)).to_be_visible()
        expect(alert.get_by_role("button", name="Reload Flow", exact=True)).to_be_visible()
        expect(page.get_by_role("heading", name="Institutional Reference Directory")).to_have_count(0)
        context.unroute(chunk, block)
        if session_only:
            alert.get_by_role("link", name="Return to explorer", exact=True).click()
            expect(page).to_have_url(EXPLORER)
            assert page.evaluate("window.flowRecoveryDocument") == "original"
        else:
            alert.get_by_role("button", name="Reload Flow", exact=True).click()
            expect(page.get_by_role("heading", name="Institutional Reference Directory")).to_be_visible()
            expect(page).to_have_url(DIRECTORY)
            assert page.evaluate("typeof window.flowRecoveryDocument") == "undefined"
            page.get_by_role("button", name=re.compile("Back to Research")).click()
        selected = page.get_by_role("button", name="Deselect Cambodia", exact=True)
        expect(selected).to_have_attribute("aria-pressed", "true")
    finally:
        context.close()


def direct_route_guards(browser):
    context, page, scripts = open_page(browser)
    try:
        page.goto(EXPLORER + "/analytics", wait_until="networkidle")
        expect(page.get_by_role("heading", name="Understand the market.", exact=True)).to_be_visible()
        dashboard = page.get_by_role("heading", name="Analytics Dashboard", exact=True)
        expect(dashboard).to_have_count(0)
        before = set(scripts)
        page.get_by_role("button", name="View unverified reference examples", exact=True).click()
        expect(dashboard).to_be_visible()
        assert set(scripts) - before, "Legacy analytics must load only after opt-in"
        page.reload(wait_until="networkidle")
        expect(page.get_by_role("heading", name="Understand the market.", exact=True)).to_be_visible()
        expect(dashboard).to_have_count(0)
        page.goto(EXPLORER + "/scheduler")
        expect(page.get_by_role("heading", name="An account is required for this workspace")).to_be_visible()
    finally:
        context.close()


def export_stranded_plan(browser, chunk):
    context, page, _ = open_page(browser)
    note = "Follow up with the premises manager."
    saved = {"version": 1, "notes": {"cambodia": {"nextStep": note, "updatedAt": None}},
             "questions": {"cambodia": ["location"]}}
    context.add_init_script(f"""{{
        localStorage.setItem('flow-market-plans-v1', {json.dumps(json.dumps(saved))});
        localStorage.setItem('flow-market-shortlist-v1', '{{"version":1,"countries":["cambodia"]}}');
        const save = Storage.prototype.setItem;
        Storage.prototype.setItem = function(key, value) {{
            if (key === 'flow-market-plans-v1') throw new DOMException('Storage full', 'QuotaExceededError');
            return save.call(this, key, value);
        }};
    }}""")
    try:
        context.route(chunk, lambda route: route.abort("failed"))
        page.goto(EXPLORER, wait_until="networkidle")
        page.get_by_role("button", name="City Analysis", exact=True).click()
        page.get_by_role("group", name="City research lens").get_by_role("button", name="Setup", exact=True).click()
        card = page.locator("#city-research-cambodia")
        card.get_by_role("button", name="Save question", exact=True).click()
        old_lenses = page.evaluate("JSON.parse(localStorage.getItem('flow-market-plans-v1')).questions.cambodia")
        assert old_lenses == ["location"], "The newly saved setup question must be in memory only"
        card.get_by_role("link", name="Add finding in plan", exact=True).click()
        alert = page.get_by_role("alert")
        expect(alert.get_by_role("heading", name="Couldn’t open Market plan", exact=True)).to_be_visible()
        with page.expect_download() as event:
            alert.get_by_role("button", name="Export market plan", exact=True).click()
        download = event.value
        assert download.suggested_filename == "flow-market-plan.json"
        plan = json.loads(download.path().read_text())
        assert plan["contentType"] == "user-market-plan-and-source-directory"
        market, = plan["markets"]
        assert market["id"] == "cambodia" and market["userNextStep"] == note
        assert {entry["lens"] for entry in market["savedResearchQuestions"]} == {"location", "setup"}
    finally:
        context.close()


if __name__ == "__main__":
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
        try:
            chunk = deferred_chunk(browser, "Source directory", "Institutional Reference Directory", "InstitutionalReports")
            blocked_tool(browser, chunk, session_only=True)
            blocked_tool(browser, chunk, session_only=False)
            direct_route_guards(browser)
            plan_chunk = deferred_chunk(browser, "Plan my entry", "Your market plan.", "MarketPlanHub")
            export_stranded_plan(browser, plan_chunk)
        finally:
            browser.close()
    print("PASS: cold tool downloads, recoverable failures, saved/session-only shortlist, direct routes, opt-in and offline plan export")
