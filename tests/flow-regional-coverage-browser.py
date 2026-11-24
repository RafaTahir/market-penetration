"""Exercise cross-region discovery, historical comparison and city planning on a production preview."""
import json
import os
import re
from pathlib import Path
from urllib.parse import urlsplit

from flow_coverage import MARKETS
from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get("FLOW_TEST_URL", "http://127.0.0.1:4173").rstrip("/")
ARTIFACTS = Path(os.environ.get("FLOW_TEST_ARTIFACTS", "/tmp/flow-regional-coverage"))
UAE = "united-arab-emirates"
ARE_2023 = {"population": 10483751, "gdpUsd": 504173451327.43365}
DUBAI_PROMPT = "Who can confirm the setup route for your proposed Dubai activity?"
AUS_2023 = {"population": 26659922, "gdpUsd": 1723827215334.7063}
NZL_2023 = {"population": 5200000, "gdpUsd": 253465703232.14594}
KHM_2023 = {"population": 17423880, "gdpUsd": 31772759998.85713}
PHNOM_PENH_PROMPT = "Where do your first buyers in Phnom Penh buy today?"
AUCKLAND_PROMPT = "Which Auckland premises work for your deliveries and staff?"
CITY_PROMPT = "Which federal, NSW and council questions apply to this activity?"
NOTE = "Prior-release test note on comparing Singapore premises."


def cambodia_worksheet(page, width):
    sheet = page.locator("#break-even-cambodia")
    sheet.locator(":scope > summary").click()
    currency = sheet.get_by_label("Currency", exact=True)
    fixed = sheet.get_by_label("Monthly fixed costs", exact=True)
    price = sheet.get_by_label("Price per unit", exact=True)
    variable = sheet.get_by_label("Variable cost per unit", exact=True)
    expect(currency).to_have_value("KHR")
    fixed.fill("900000")
    price.fill("12000")
    variable.fill("6000")
    page.reload(wait_until="networkidle")
    sheet.locator(":scope > summary").click()
    expect(currency).to_have_value("KHR")
    expect(sheet).to_contain_text(re.compile(r"150\s+units/month"))
    currency.select_option("USD")
    change = sheet.get_by_role("group", name="Confirm worksheet change")
    expect(change).to_contain_text("Changing from KHR to USD clears the three amounts")
    change.get_by_role("button", name="Cancel").click()
    expect(currency).to_have_value("KHR")
    expect(fixed).to_have_value("900000")
    sheet.evaluate("node => node.scrollIntoView({block: 'center', behavior: 'instant'})")
    sheet.screenshot(path=str(ARTIFACTS / f"cambodia-worksheet-{width}.png"))
    currency.select_option("USD")
    change.get_by_role("button", name="Switch to USD and clear amounts").click()
    expect(currency).to_have_value("USD")
    for field in (fixed, price, variable):
        expect(field).to_have_value("")
    fixed.fill("480")
    price.fill("10")
    variable.fill("4")
    expect(sheet).to_contain_text(re.compile(r"80\s+units/month"))


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
    new_zealand = cards.filter(has=page.get_by_role("heading", name="New Zealand", exact=True))
    expect(region("All regions")).to_have_attribute("aria-pressed", "true")
    expect(cards).to_have_count(len(MARKETS))
    region("Southeast Asia").click()
    expect(cards).to_have_count(7)
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

    search.fill("Auckland")
    expect(cards).to_have_count(1)
    expect(new_zealand).to_contain_text("2023 historical snapshot")
    new_zealand.get_by_role("button", name="Add New Zealand to shortlist and explore", exact=True).click()
    auckland = page.locator("#city-research-new-zealand")
    expect(auckland).to_be_focused()
    expect(auckland).to_contain_text("Auckland region")
    page.get_by_role("group", name="City research lens").get_by_role("button", name="Location", exact=True).click()
    expect(auckland).to_contain_text(AUCKLAND_PROMPT)
    auckland.get_by_role("button", name="Save question", exact=True).click()
    expect(auckland.get_by_text("Saved to plan", exact=True)).to_be_visible()

    search.fill("")
    expect(cards).to_have_count(2)
    expect(australia.get_by_role("button", name="Deselect Australia", exact=True)).to_have_attribute("aria-pressed", "true")
    expect(new_zealand.get_by_role("button", name="Deselect New Zealand", exact=True)).to_have_attribute("aria-pressed", "true")
    # An active region can hide a global search result; broadening the search must keep the shortlist.
    search.fill("Dubai")
    expect(cards).to_have_count(0)
    page.get_by_role("button", name="Search all regions", exact=True).click()
    expect(search).to_have_value("Dubai")
    expect(region("All regions")).to_have_attribute("aria-pressed", "true")
    expect(cards).to_have_count(1)
    uae = page.locator(f'.market-country-card[data-market="{UAE}"]')
    expect(uae.get_by_role("heading", name="United Arab Emirates", exact=True)).to_be_visible()
    expect(uae.get_by_role("button", name="Select United Arab Emirates", exact=True)).to_have_attribute("aria-pressed", "false")
    region("Middle East").click()
    search.fill("UAE")
    expect(cards).to_have_count(1)
    expect(uae).to_contain_text("2023 historical snapshot")
    uae.evaluate("card => card.scrollIntoView({block: 'center', behavior: 'instant'})")
    uae.screenshot(path=str(ARTIFACTS / f"uae-card-{width}.png"))
    uae.get_by_role("button", name="Add United Arab Emirates to shortlist and explore", exact=True).click()
    dubai = page.locator(f"#city-research-{UAE}")
    expect(dubai).to_be_focused()
    expect(dubai).to_contain_text("Dubai emirate")
    page.get_by_role("group", name="City research lens").get_by_role("button", name="Setup", exact=True).click()
    expect(dubai).to_contain_text(DUBAI_PROMPT)
    expect(dubai).to_contain_text("free zone")
    dubai.get_by_role("button", name="Save question", exact=True).click()
    expect(dubai.get_by_text("Saved to plan", exact=True)).to_be_visible()
    search.fill("")
    region("Southeast Asia").click()
    expect(page.get_by_text("Your shortlist includes 3 markets outside Southeast Asia.", exact=True)).to_be_visible()
    expect(australia).to_have_count(0)
    search.fill("Phnom Penh")
    cambodia = cards.filter(has=page.get_by_role("heading", name="Cambodia", exact=True))
    expect(cards).to_have_count(1)
    expect(cambodia).to_contain_text("2023 historical snapshot")
    expect(cambodia.get_by_label("17,423,880 people, 2023", exact=True)).to_be_visible()
    search.fill("KHM")
    expect(cards).to_have_count(1)
    outline = page.locator('.explorer-atlas path[data-market="cambodia"]')
    expect(outline).to_have_count(1)
    expect(outline).not_to_have_class(re.compile("is-selected"))
    cambodia.evaluate("card => card.scrollIntoView({block: 'center', behavior: 'instant'})")
    cambodia.screenshot(path=str(ARTIFACTS / f"cambodia-card-{width}.png"))
    sources = cambodia.get_by_role("button", name="Sources for Cambodia")
    sources.click()
    expect(cambodia).to_contain_text("Not cross-checked against the primary World Bank API")
    expect(cambodia.locator('a[href*="/datasets/gdp/36d761dc5617982d3e50b213e02b9a1b47c4e958/"]')).to_have_count(1)
    sources.click()
    cambodia.get_by_role("button", name="Add Cambodia to shortlist and explore").click()
    expect(outline).to_have_class(re.compile("is-selected"))
    phnom_penh = page.locator("#city-research-cambodia")
    expect(phnom_penh).to_be_focused()
    page.get_by_role("group", name="City research lens").get_by_role("button", name="Customers", exact=True).click()
    expect(phnom_penh).to_contain_text(PHNOM_PENH_PROMPT)
    expect(phnom_penh).to_contain_text("sangkat")
    phnom_penh.get_by_role("button", name="Save question", exact=True).click()
    expect(phnom_penh.get_by_role("link", name="Add finding in plan")).to_be_visible()
    page.get_by_role("button", name=re.compile("^Compare markets")).click()
    comparison = page.locator("#market-comparison")
    for name in ("Australia", "New Zealand", "Singapore", "United Arab Emirates", "Cambodia"):
        expect(comparison.get_by_role("columnheader").filter(has_text=name)).to_have_count(1)
    expect(comparison.get_by_role("row", name=re.compile("^Region"))).to_contain_text("Oceania")
    expect(comparison.get_by_role("row", name=re.compile("^Nominal GDP change"))).to_contain_text("+17.4%")
    expect(comparison.get_by_role("row", name=re.compile("^Nominal GDP change"))).to_contain_text("+25.9%")
    expect(comparison.get_by_role("row", name=re.compile("^Region"))).to_contain_text("Middle East")
    expect(comparison.get_by_role("row", name=re.compile("^Nominal GDP change"))).to_contain_text("+21.8%")
    expect(comparison.get_by_role("row", name=re.compile("^Nominal GDP change"))).to_contain_text("+90.2%")
    expect(comparison).to_contain_text("Prices and exchange rates affect the result.")
    uae_column = comparison.get_by_role("columnheader").filter(has_text="United Arab Emirates")
    uae_column.evaluate("cell => cell.scrollIntoView({block: 'center', inline: 'end', behavior: 'instant'})")
    expect(uae_column).to_be_in_viewport(ratio=0.8)
    page.screenshot(path=str(ARTIFACTS / f"comparison-{width}.png"))
    with page.expect_download() as download:
        comparison.get_by_role("button", name="Export shortlist", exact=True).click()
    exported = json.loads(download.value.path().read_text())
    by_country = {row["countryCode"]: row for row in exported["historicalSnapshot"]["observations"]}
    assert set(by_country) == {"AUS", "NZL", "SGP", "ARE", "KHM"}
    khm = by_country["KHM"]
    assert khm["region"] == "Southeast Asia"
    assert all(khm[key] == value for key, value in KHM_2023.items())
    assert [point["year"] for point in khm["gdpSeries"]] == list(range(2014, 2024))
    assert khm["gdpSeries"][0]["value"] == 16702610842.35294
    assert khm["gdpSeries"][-1]["value"] == KHM_2023["gdpUsd"]
    assert khm["nominalGdpChangePercent"] == 90.2
    aus = by_country["AUS"]
    assert all(aus[key] == value for key, value in AUS_2023.items())
    assert [point["year"] for point in aus["gdpSeries"]] == list(range(2014, 2024))
    assert aus["nominalGdpChangePercent"] == 17.4
    assert aus["gdpSeries"][0]["value"] == 1468597690006.215
    assert aus["gdpSeries"][-1]["value"] == AUS_2023["gdpUsd"]
    nzl = by_country["NZL"]
    assert all(nzl[key] == value for key, value in NZL_2023.items())
    assert nzl["nominalGdpChangePercent"] == 25.9
    assert [point["year"] for point in nzl["gdpSeries"]] == list(range(2014, 2024))
    assert nzl["gdpSeries"][0]["value"] == 201337554959.48953
    assert nzl["gdpSeries"][-1]["value"] == NZL_2023["gdpUsd"]
    are = by_country["ARE"]
    assert are["region"] == "Middle East"
    assert all(are[key] == value for key, value in ARE_2023.items())
    assert [point["year"] for point in are["gdpSeries"]] == list(range(2014, 2024))
    assert are["gdpSeries"][0]["value"] == 414105366752.8931
    assert are["gdpSeries"][-1]["value"] == ARE_2023["gdpUsd"]
    assert are["nominalGdpChangePercent"] == 21.8
    assert exported["historicalSnapshot"]["provenance"]["observationYear"] == 2023
    comparison.get_by_role("link", name="Plan these markets", exact=True).click()
    au_plan = page.locator('.mph-market[data-market="australia"]')
    expect(au_plan.get_by_text(CITY_PROMPT, exact=True)).to_be_visible()
    nz_plan = page.locator('.mph-market[data-market="new-zealand"]')
    expect(nz_plan.get_by_text(AUCKLAND_PROMPT, exact=True)).to_be_visible()
    ae_plan = page.locator(f'.mph-market[data-market="{UAE}"]')
    expect(ae_plan.get_by_text(DUBAI_PROMPT, exact=True)).to_be_visible()
    worksheet = ae_plan.locator(f"#break-even-{UAE}")
    worksheet.locator(":scope > summary").click()
    expect(worksheet.get_by_label("Currency", exact=True)).to_have_value("AED")
    worksheet.get_by_label("Monthly fixed costs", exact=True).fill("1000")
    worksheet.get_by_label("Price per unit", exact=True).fill("30")
    worksheet.get_by_label("Variable cost per unit", exact=True).fill("10")
    expect(worksheet).to_contain_text(re.compile(r"50\s+units/month"))
    expect(page.locator('.mph-market[data-market="cambodia"]').get_by_text(PHNOM_PENH_PROMPT, exact=True)).to_be_visible()
    cambodia_worksheet(page, width)
    page.reload(wait_until="networkidle")
    with page.expect_download() as download:
        page.get_by_role("button", name="Export market plan", exact=True).click()
    plan = json.loads(download.value.path().read_text())
    by_market = {item["id"]: item for item in plan["markets"]}
    assert set(by_market) == {"australia", "new-zealand", "singapore", "cambodia", UAE}
    kh = by_market["cambodia"]
    assert kh["countryCode"] == "KHM" and kh["cityResearchStartingPoint"] == "Phnom Penh"
    assert kh["sources"]["sourcePublicationDate"] is None and kh["sources"]["sourceContentsVerified"] is False
    assert kh["sources"]["businessSetup"]["url"] == "https://www.registrationservices.gov.kh/"
    assert kh["sources"]["cityAndLocation"]["url"] == "https://phnompenh.gov.kh/"
    question, = kh["savedResearchQuestions"]
    assert question["kind"] == "unverified-research-prompt" and question["question"] == PHNOM_PENH_PROMPT
    assert [source["url"] for source in question["sources"]] == ["https://www.nis.gov.kh/"]
    assert kh["breakEvenScenario"]["inputs"]["currency"] == "USD"
    assert kh["breakEvenScenario"]["result"]["breakEvenUnits"] == 80
    assert by_market["australia"]["region"] == "Oceania"
    assert by_market["singapore"]["region"] == "Southeast Asia"
    assert by_market["singapore"]["userNextStep"] == NOTE
    question, = by_market["australia"]["savedResearchQuestions"]
    assert question["kind"] == "unverified-research-prompt" and question["question"] == CITY_PROMPT
    assert {source["url"] for source in question["sources"]} == {"https://business.gov.au/", "https://www.cityofsydney.nsw.gov.au/"}
    nz_question, = by_market["new-zealand"]["savedResearchQuestions"]
    assert by_market["new-zealand"]["region"] == "Oceania"
    assert nz_question["kind"] == "unverified-research-prompt" and nz_question["question"] == AUCKLAND_PROMPT
    assert [source["url"] for source in nz_question["sources"]] == ["https://www.aucklandcouncil.govt.nz/"]
    ae = by_market[UAE]
    assert ae["region"] == "Middle East" and ae["cityResearchStartingPoint"] == "Dubai"
    assert ae["sources"]["sourcePublicationDate"] is None and ae["sources"]["sourceContentsVerified"] is False
    question, = ae["savedResearchQuestions"]
    assert question["kind"] == "unverified-research-prompt" and question["question"] == DUBAI_PROMPT
    assert {s["url"] for s in question["sources"]} == {
        "https://u.ae/en/information-and-services/business", "https://www.dubaidet.gov.ae/en/"
    }
    assert ae["sources"]["countryStatistics"]["url"] == "https://fcsc.gov.ae/"
    assert ae["breakEvenScenario"]["inputs"]["currency"] == "AED"
    assert ae["breakEvenScenario"]["result"]["breakEvenUnits"] == 50
    assert plan["detailedNotebookCoverage"] == ["Jakarta province, excluding Greater Jakarta", "City of Manila, excluding the rest of Metro Manila"]

    page.get_by_role("link", name="Explore markets", exact=True).last.click()
    region("Oceania").click()
    expect(cards).to_have_count(2)
    page.get_by_role("button", name="View unverified reference examples", exact=True).click()
    page.get_by_role("button", name="Data status: unverified reference examples enabled", exact=True).click()
    status = page.get_by_role("dialog", name="Reference examples enabled")
    expect(status).to_contain_text("Thailand, Singapore, Malaysia, Indonesia, the Philippines and Vietnam")
    status.get_by_role("button", name="Close data status").click()
    archive_scope = page.get_by_role("status").filter(has_text="Reference examples cover six markets")
    expect(archive_scope).to_be_visible()
    expect(archive_scope).to_contain_text("Australia")
    expect(archive_scope).to_contain_text("New Zealand")
    expect(archive_scope).to_contain_text("United Arab Emirates")
    expect(archive_scope).to_contain_text("Cambodia")
    reference = page.locator(".reference-research")
    expect(reference.get_by_role("cell", name=re.compile("^singapore$", re.I))).to_be_visible()
    expect(reference.get_by_role("cell", name=re.compile("^cambodia$", re.I))).to_have_count(0)
    expect(page.get_by_role("heading", name="Reference report studio", exact=True)).to_be_visible()
    page.get_by_role("button", name="Remove Singapore from shortlist", exact=True).click()
    expect(page.locator(".reference-research")).to_have_count(0)
    expect(page.get_by_role("heading", name="Reference report studio", exact=True)).to_have_count(0)
    for name in ("Australia", "New Zealand", "United Arab Emirates"):
        page.get_by_role("button", name=f"Remove {name} from shortlist", exact=True).click()
    expect(page.locator(".explorer-shortlist button")).to_have_count(1)
    expect(archive_scope).to_contain_text("Cambodia")
    expect(reference).to_have_count(0)
    expect(page.get_by_role("heading", name="Reference report studio", exact=True)).to_have_count(0)
    page.get_by_role("button", name="Return to research guides").click()
    page.get_by_role("button", name="City Analysis", exact=True).click()
    expect(phnom_penh.get_by_text(PHNOM_PENH_PROMPT, exact=True)).to_be_visible()
    expect(page.locator('[id^="city-research-"]')).to_have_count(1)
    phnom_penh.evaluate("panel => panel.scrollIntoView({block: 'center', behavior: 'instant'})")
    phnom_penh.screenshot(path=str(ARTIFACTS / f"phnom-penh-guide-{width}.png"))
    page.goto(BASE + "/#/research/reports", wait_until="networkidle")
    directory = page.get_by_role("main")
    directory.get_by_label("Search sources").fill("UAE statistics")
    expect(directory.get_by_role("status")).to_have_text("1 source")
    expect(directory.get_by_role("link")).to_have_attribute("href", "https://fcsc.gov.ae/")
    directory.get_by_label("Search sources").fill("KHM statistics")
    expect(directory.get_by_role("status")).to_have_text("1 source")
    expect(directory.get_by_role("link")).to_have_attribute("href", "https://www.nis.gov.kh/")
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
print("PASS: cross-region shortlist, four national GDP histories, Sydney/Auckland/Dubai/Phnom Penh guides, "
      "AED and KHR/USD planning, prior notes, exported sources and six-market archive boundaries on desktop and phone")
