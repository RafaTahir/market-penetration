"""Check a synthetic, local two-market brief on screen and in Chromium's actual PDF output."""
import json
import os
from pathlib import Path
from urllib.parse import urlsplit

import fitz
from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get("FLOW_TEST_URL", "http://127.0.0.1:4173").rstrip("/")
ARTIFACTS = Path(os.environ.get("FLOW_TEST_ARTIFACTS", "/tmp/flow-plan-brief"))
HIDDEN = "SyntheticUnselectedMarketOnly"
DRAFT = "SyntheticUnsavedFindingOnly"
CHANGED_NOTE = "Synthetic plan update: request a written quote for a daytime delivery window."
SOURCE = "Synthetic interview record, binder R7"
DATE = "2024-02-29"
NOTE_PARTS = [f"Note{i:02d}: compare the premises quotes on equal terms." for i in range(1, 27)]
FINDING_PARTS = [f"Visit{i:02d}: check the delivery hours with the tenant." for i in range(1, 23)]
NOTE = "Synthetic next step <em>Lot42</em> & terms.\n" + "\n".join(NOTE_PARTS)
FINDING = "Synthetic site finding.\n" + "\n".join(FINDING_PARTS)
PORTALS = {"https://brs.go.ke/", "https://www.knbs.or.ke/", "https://nairobi.go.ke/",
           "https://www.gov.uk/set-up-business", "https://www.ons.gov.uk/",
           "https://www.gov.uk/find-local-council", "https://data.london.gov.uk/"}


def button(scope, name):
    return scope.get_by_role("button", name=name, exact=True)


def start(browser, width, session_only=False):
    context = browser.new_context(viewport={"width": width, "height": 900}, reduced_motion="reduce")
    errors, external = [], []

    def guard(route):
        if urlsplit(route.request.url).netloc == urlsplit(BASE).netloc:
            route.continue_()
        else:
            external.append(route.request.url.split("?")[0])
            route.abort()

    context.route("**/*", guard)
    if session_only:
        context.add_init_script("Object.defineProperty(window, 'localStorage', {get(){throw new DOMException('Blocked','SecurityError')}})")
    else:
        plans = {
            "version": 3,
            "notes": {"uk": {"nextStep": NOTE, "updatedAt": "2025-01-10T12:00:00Z"},
                      "singapore": {"nextStep": HIDDEN, "updatedAt": None}},
            "questions": {"kenya": ["setup", "customers"]},
            "findings": {"kenya": {"setup": {"text": FINDING, "source": SOURCE, "observedOn": DATE}}},
            "scenarios": {"kenya": {"currency": "KES", "monthlyFixedCosts": "30.00", "unitPrice": "12.50",
                                    "unitVariableCost": "7.50", "expectedMonthlyUnits": "0"}},
        }
        fixture = {"flow-market-plans-v1": json.dumps(plans),
                   "flow-market-shortlist-v1": json.dumps({"version": 1, "countries": ["uk", "kenya"]})}
        context.add_init_script(f"""if (location.origin === new URL({json.dumps(BASE)}).origin) {{
            for (const [key, value] of Object.entries({json.dumps(fixture)})) {{
                if (localStorage.getItem(key) === null) localStorage.setItem(key, value);
            }}
        }}""")
    page = context.new_page()
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(BASE + "/#/plan", wait_until="networkidle")
    return context, page, errors, external


def inspect_pdf(path, directories, market_headings):
    data = path.read_bytes()
    assert data.startswith(b"%PDF-") and data.rstrip().endswith(b"%%EOF")
    with fitz.open(path) as pdf:
        pages = [p.get_text() for p in pdf]
        text = " ".join(" ".join(pages).split())
        # The fixture has 48 lines of personal text, two countries and their source directories.
        assert 2 <= len(pages) <= 7, (path, len(pages))
        assert all(len(page.split()) >= 8 for page in pages), [p[:100] for p in pages]
        for token in ["Kenya", "United Kingdom", "<em>Lot42</em>", SOURCE, DATE, "-30.00 KES", "6 units/month"]:
            assert token in text, (path, token)
        for label in ["Market plan brief", "Open question", "No worksheet saved.", "user-entered and unverified", "publication dates"]:
            assert label.casefold() in text.casefold(), (path, label)
        for part in NOTE_PARTS + FINDING_PARTS:
            assert part in text, (path, part)
        for omitted in [HIDDEN, DRAFT, CHANGED_NOTE, "Print brief", "Close brief", "Preview plan brief",
                        "Restore market plan", "Open city notebook"]:
            assert omitted not in text, (path, omitted)
        links = {link.get("uri") for page in pdf for link in page.get_links()}
        assert PORTALS <= links, (path, PORTALS - links)
        compact_pages = ["".join(page.split()) for page in pages]
        for item in [*directories, *market_headings]:
            # Paper readers need the label on the same sheet as its value.
            pair = "".join(item.split())
            assert any(pair in page for page in compact_pages), (path, item)
        return len(pages)


def desktop_or_phone(browser, width):
    context, page, errors, external = start(browser, width)
    try:
        row = page.locator("#question-kenya-setup")
        button(row, "Edit finding").click()
        edit = row.get_by_label("Finding", exact=True)
        edit.fill(DRAFT)
        trigger = button(page, "Preview plan brief")
        trigger.click()
        dialog = page.get_by_role("dialog", name="Market plan brief", exact=True)
        expect(dialog).to_be_visible()
        assert dialog.evaluate("el => el instanceof HTMLDialogElement && el.matches(':modal')")
        notice = dialog.locator(".mpb-draft-notice")
        expect(notice).to_be_visible()
        article = dialog.locator(".mpb-paper")
        expect(article.get_by_role("heading", name="Market plan brief", exact=True)).to_be_visible()
        expect(article).to_contain_text("Open question")
        expect(article).to_contain_text("Personal finding")
        expect(article).to_contain_text(SOURCE)
        expect(article).to_contain_text(DATE)
        expect(article).to_contain_text("<em>Lot42</em> & terms")
        expect(article).to_contain_text("No worksheet saved.")
        kenya = article.locator(".mpb-market[data-market=kenya]")
        for label, value in [("Expected monthly sales (units)", "0"), ("Break-even sales", "6 units/month"),
                             ("Revenue", "0.00 KES"), ("Modeled costs", "30.00 KES"), ("Shortfall", "-30.00 KES")]:
            expect(kenya.get_by_text(label, exact=True).locator("xpath=following-sibling::dd")).to_have_text(value)
        for marker in (DRAFT, HIDDEN):
            expect(article).not_to_contain_text(marker)
        assert article.evaluate("el => el.scrollWidth <= el.clientWidth + 1")
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        # This open brief must keep the plan as it was when the user previewed it.
        peer = context.new_page()
        peer.goto(BASE + "/#/plan")
        peer.locator('.mph-market[data-market="uk"] .mph-next-step > summary').click()
        peer.get_by_label("Your next step for United Kingdom").fill(CHANGED_NOTE)
        expect(page.locator("#next-step-uk")).to_have_value(CHANGED_NOTE)
        peer.close()
        expect(article).not_to_contain_text(CHANGED_NOTE)
        page.evaluate("""() => { window.flowTestPrints = 0; window.print = () => {
          if (document.querySelector('dialog:modal .mpb-paper')) window.flowTestPrints++;
        }; }""")
        button(dialog, "Print brief").click()
        assert page.evaluate("window.flowTestPrints") == 1
        directories = article.locator(".mpb-directory a").all_text_contents()
        market_headings = article.locator(".mpb-market-heading").all_text_contents()
        pdf = ARTIFACTS / f"synthetic-plan-brief-{width}.pdf"
        page.pdf(path=str(pdf), format="A4", prefer_css_page_size=True, print_background=True, display_header_footer=False)
        count = inspect_pdf(pdf, directories, market_headings)
        page.keyboard.press("Escape")
        expect(dialog).to_have_count(0)
        expect(trigger).to_be_focused()
        expect(edit).to_have_value(DRAFT)
        trigger.click()
        expect(dialog.locator(".mpb-paper")).to_contain_text(CHANGED_NOTE)
        button(dialog, "Close brief").click()
        expect(trigger).to_be_focused()
        expect(edit).to_have_value(DRAFT)
        button(row, "Cancel").click()
        trigger.click()
        expect(dialog.locator(".mpb-draft-notice")).to_have_count(0)
        page.screenshot(path=str(ARTIFACTS / f"synthetic-brief-preview-{width}.png"))
        assert not errors and not external, (errors, external)
        print(f"PASS {width}px: {count}-page synthetic PDF validated")
    finally:
        context.close()


def blocked_storage(browser):
    context, page, errors, external = start(browser, 390, session_only=True)
    try:
        expect(page.locator(".mph-plan-status")).to_contain_text("Session only")
        sg = page.locator('.mph-market[data-market="singapore"]')
        sg.locator(".mph-next-step > summary").click()
        sg.get_by_label("Your next step for Singapore").fill("Synthetic session-only plan note.")
        button(page, "Preview plan brief").click()
        dialog = page.get_by_role("dialog", name="Market plan brief", exact=True)
        expect(dialog.locator(".mpb-paper")).to_contain_text("Synthetic session-only plan note.")
        button(dialog, "Close brief").click()
        assert not errors and not external, (errors, external)
    finally:
        context.close()


if __name__ == "__main__":
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
        try:
            for size in (1440, 390):
                desktop_or_phone(browser, size)
            blocked_storage(browser)
        finally:
            browser.close()
