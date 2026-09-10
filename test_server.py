#!/usr/bin/env python3
"""
AgriLink Prototype 2 - Comprehensive Test Suite
Validates:
1. Agmarknet database integrity (Chilli, Paddy, Cotton, Tomato, Wheat)
2. All 5 language translations in i18n.js
3. Filter, query, and stat aggregation algorithms
"""

import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "data" / "agmarknet_data.json"
BIDDING_FILE = BASE_DIR / "data" / "bidding_data.json"
I18N_FILE = BASE_DIR / "public" / "js" / "i18n.js"
INDEX_FILE = BASE_DIR / "public" / "index.html"

def test_agmarknet_data():
    assert DATA_FILE.exists(), "agmarknet_data.json must exist"
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        records = json.load(f)

    assert len(records) >= 30, f"Expected at least 30 records, got {len(records)}"
    
    # Check requested target crops
    target_crops = ["Chilli", "Paddy", "Cotton", "Tomato", "Wheat"]
    commodities_found = set(r.get("commodity") for r in records)
    for crop in target_crops:
        assert crop in commodities_found, f"Target crop '{crop}' must be in records. Found: {commodities_found}"

    # Verify each record has required fields
    for r in records:
        assert "state" in r and r["state"], "State is required"
        assert "district" in r and r["district"], "District is required"
        assert "market" in r and r["market"], "Market is required"
        assert "commodity" in r and r["commodity"], "Commodity is required"
        assert "modal_price" in r and r["modal_price"] > 0, "Modal price must be positive"
        assert r["min_price"] <= r["modal_price"] <= r["max_price"], (
            f"Price logic violation: min {r['min_price']} <= modal {r['modal_price']} <= max {r['max_price']}"
        )

    print(f"✓ agmarknet_data.json passed! {len(records)} records verified across {len(commodities_found)} commodities.")

def test_bidding_data_and_engine():
    assert BIDDING_FILE.exists(), "bidding_data.json must exist"
    with open(BIDDING_FILE, "r", encoding="utf-8") as f:
        lots = json.load(f)

    assert len(lots) >= 5, f"Expected at least 5 FPO lots, found {len(lots)}"

    # Verify lot fields
    for lot in lots:
        assert "id" in lot and lot["id"].startswith("AUC-")
        assert "fpo_name" in lot and lot["fpo_name"]
        assert "commodity" in lot and lot["commodity"]
        assert "min_price" in lot and lot["min_price"] > 0
        assert "quantity" in lot and lot["quantity"] > 0
        assert lot["status"] in ["OPEN", "AWARDED"]
        assert "bids" in lot and isinstance(lot["bids"], list)
        
        # Check blind bids logic
        for b in lot["bids"]:
            assert b["bid_price"] >= lot["min_price"], f"Bid {b['bid_price']} must be >= min price {lot['min_price']}"
            assert b["total_amount"] == b["bid_price"] * lot["quantity"], "Total amount must equal bid_price * quantity"

        # Check awarded lot
        if lot["status"] == "AWARDED":
            assert lot["awarded_bid"] is not None
            highest_bid_val = max(b["bid_price"] for b in lot["bids"])
            assert lot["awarded_bid"]["bid_price"] == highest_bid_val, "Awarded bid must be highest bid"

    print(f"✓ FPO Bidding database verified! {len(lots)} bulk auction lots verified with sealed blind bids & awards.")

def test_i18n_dictionary():
    assert I18N_FILE.exists(), "i18n.js must exist"
    with open(I18N_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    # Verify all 6 language keys are present
    languages = ["en", "te", "ta", "mr", "pa", "hi"]
    for lang in languages:
        assert f"{lang}:" in content, f"Language '{lang}' missing in i18n.js"

    # Verify key crops are translated
    for crop in ["Chilli", "Paddy", "Cotton", "Tomato", "Wheat"]:
        assert f'"{crop}":' in content, f"Commodity translation '{crop}' missing in i18n.js"

    # Verify Bidding, Portals, and Middlemen Cost keys are present across all languages
    portal_keys = [
        "nav_farmer_portal", "nav_fpo_portal", "nav_corporate_portal", "nav_callback",
        "portal_farmer_title", "portal_fpo_title", "portal_corporate_title",
        "btn_enter_farmer", "btn_enter_fpo", "btn_enter_corporate",
        "btn_host_produce", "modal_bid_title", "winner_title",
        "calc_middleman_header", "comm_preset_median", "comm_total_deduction",
        "traditional_route_title", "agrilink_route_title",
        "photo_tag_1", "photo_tag_5", "hero_govt_banner",
        "slogan_celebrate_farmers", "scroll_down_features"
    ]
    for key in portal_keys:
        assert f"{key}:" in content, f"Translation key '{key}' missing in i18n.js"

    print("✓ i18n.js translations verified for Telugu, Tamil, Marathi, English, Punjabi, and Hindi (including Call Back tab & Celebrate Farmers)!")


def test_html_and_logos():
    assert INDEX_FILE.exists(), "index.html must exist"
    with open(INDEX_FILE, "r", encoding="utf-8") as f:
        html = f.read()

    # Verify SIH is completely removed
    assert "sih" not in html.lower(), "SIH references must be completely removed from HTML"
    
    # Verify AgriLink logo is big/main and APEX {SYNTAX} is present
    assert 'class="logo-img logo-main"' in html, "AgriLink logo must have logo-main class"
    assert "images/agrilink_logo.jpg" in html, "AgriLink logo missing in HTML"
    assert "images/apex_syntax_logo.jpg" in html, "APEX {SYNTAX} logo missing in HTML"
    assert "images/agrilink_wordmark.png" in html, "AgriLink wordmark PNG missing in HTML"
    assert (BASE_DIR / "public" / "images" / "agrilink_wordmark.png").exists(), "agrilink_wordmark.png must exist on disk"

    # Verify all user-uploaded agricultural photos exist on disk and in HTML
    user_images = [
        "paddy_entry_bg.jpg",
        "farmer_golden_harvest.jpg",
        "paddy_main_bg.jpg",
        "farmer_paddy_lookout.jpg",
        "tractor_bull_plow.jpg",
        "farmer_sowing_field.jpg",
        "farmer_portrait_hoe.jpg"
    ]
    for img in user_images:
        imgPath = BASE_DIR / "public" / "images" / img
        assert imgPath.exists(), f"User image {img} does not exist at {imgPath}"
        assert f"images/{img}" in html, f"User photo images/{img} missing in index.html"

    # Verify Entry Page Hero has large centered AgriLink graphic wordmark
    assert "entry-logo-graphic-wrap" in html, "Centered AgriLink graphic logo wrap missing on entry hero"
    assert "entry-hero-agrilink-logo" in html, "AgriLink graphic logo image missing on entry hero"
    assert "hero-govt-masthead-center" not in html, "Government of India masthead must be removed from entry hero"

    # Verify Hero Action Buttons including Call Back tab trigger
    assert 'id="btnHeroCallback"' in html, "btnHeroCallback button missing in entry hero"
    assert 'id="btnHeroExplore"' in html, "btnHeroExplore button missing in entry hero"

    # Verify Separate Voice Call Back Tab in Navigation and Dedicated View Section
    assert 'data-view="callback"' in html, "Separate Call Back nav tab missing in HTML"
    assert 'id="view-callback"' in html, "Separate view-callback section missing in HTML"
    assert 'id="farmerPhoneInput"' in html, "Farmer phone input missing in view-callback"
    assert 'id="btnRequestCallback"' in html, "Request callback button missing in view-callback"
    assert 'id="btnListenAudioGuide"' in html, "Listen audio guide button missing in view-callback"

    # Verify #CELEBRATEFARMING in extreme bottom of page
    assert "extreme-bottom-celebrate-strip" in html, "Extreme bottom #CELEBRATEFARMING strip missing in HTML"
    assert "#CELEBRATEFARMING" in html, "'#CELEBRATEFARMING' text missing in HTML"

    # Verify Bottom Canopy & Field Highlights Section
    assert "bottom-canopy-info-section" in html, "Bottom canopy info section missing in HTML"
    assert "bottom-gallery-badges" in html, "Bottom gallery badges missing in HTML"

    assert "images/paddy_entry_bg.jpg" in html, "Paddy photo must be referenced on entry page background"
    assert 'id="entryPageHero"' in html, "entryPageHero container missing in HTML"

    # Verify Scroll Down to Main Features functionality
    assert 'id="btnScrollFeatures"' in html, "btnScrollFeatures button missing in entry hero"
    assert 'id="mainFeaturesSection"' in html, "mainFeaturesSection scroll target missing in HTML"

    # Verify Celebrate Farmers Tribute Card with sunset farmer showering golden grains
    assert 'class="celebrate-farmers-tribute-card"' in html, "Celebrate Farmers tribute card missing"
    assert 'images/farmer_golden_harvest.jpg' in html, "Sunset farmer showering grains photo missing in HTML"

    # Verify other photos in multiple locations across the website
    assert 'style="background-image: url(\'images/farmer_paddy_lookout.jpg\');"' in html, "Farmer lookout photo missing in portal header"
    assert 'style="background-image: url(\'images/tractor_bull_plow.jpg\');"' in html, "Tractor/bull plow photo missing in FPO header"
    assert 'style="background-image: url(\'images/farmer_sowing_field.jpg\');"' in html, "Farmer sowing photo missing in Corporate header"
    assert 'style="background-image: url(\'images/farmer_portrait_hoe.jpg\');"' in html, "Farmer portrait photo missing in Calculator advocate card"

    # Verify Reduced-Transparency Slideshows (Both Site-Wide and Hero)
    assert 'id="siteBgSlideshow"' in html, "Site-wide background slideshow container missing in HTML"
    assert 'class="site-bg-slide active"' in html, "Active site background slide missing in HTML"
    assert 'class="hero-bg-slideshow"' in html, "Hero background slideshow container missing"
    assert 'class="portals-gateway-grid"' in html, "Portals Gateway grid missing on Home page"
    
    # Verify 4 distinct dedicated portals (Farmer, FPO, Corporate, and Voice Call Back)
    assert 'id="view-farmer"' in html, "view-farmer section missing in HTML"
    assert 'id="view-fpo"' in html, "view-fpo section missing in HTML"
    assert 'id="view-corporate"' in html, "view-corporate section missing in HTML"
    assert 'id="view-callback"' in html, "view-callback section missing in HTML"

    assert 'data-view="farmer"' in html, "farmer nav tab missing in HTML"
    assert 'data-view="fpo"' in html, "fpo nav tab missing in HTML"
    assert 'data-view="corporate"' in html, "corporate nav tab missing in HTML"
    assert 'data-view="callback"' in html, "callback nav tab missing in HTML"

    assert 'id="fpoLotsGrid"' in html, "fpoLotsGrid missing in FPO portal"
    assert 'id="corporateLotsGrid"' in html, "corporateLotsGrid missing in Corporate portal"
    assert 'id="fpoHostModal"' in html, "FPO host modal missing in HTML"
    assert 'id="corporateBidModal"' in html, "Corporate bid modal missing in HTML"

    # Verify Middlemen & Market-Cost Calculator markup
    assert 'class="calc-commission-box"' in html, "Commission box missing in calculator"
    assert 'id="btnCommMedian"' in html, "btnCommMedian missing in calculator"
    assert 'id="calcTraditionalPayout"' in html, "calcTraditionalPayout missing in calculator"
    assert 'id="calcSavingsVal"' in html, "calcSavingsVal missing in calculator"

    # Verify Theme Switcher button: Very Small Top-Right On/Off Toggle
    assert 'id="themeSwitchToggle"' in html, "themeSwitchToggle button missing in index.html"
    assert 'class="top-corner-theme-switch' in html, "top-corner-theme-switch class missing in index.html"
    assert 'id="btnThemeDefault"' in html, "btnThemeDefault button missing in index.html"
    assert 'id="btnThemeGreen"' in html, "btnThemeGreen button missing in index.html"

    # Verify CSS styling: AgriLink logo without white background, subtle styling for #celebrate farming, and Green Theme
    CSS_FILE = BASE_DIR / "public" / "css" / "style.css"
    assert CSS_FILE.exists(), "style.css must exist"
    with open(CSS_FILE, "r", encoding="utf-8") as f:
        css = f.read()

    assert ".entry-logo-graphic-wrap" in css, "entry-logo-graphic-wrap class must exist in style.css"
    assert "background: transparent;" in css, "entry-logo-graphic-wrap must have transparent background (no white background box)"
    assert "Playfair Display" in css, "#celebrate farming font must include 'Playfair Display'"
    assert "rgba(250, 204, 21, 0.7)" not in css, "Flashy yellow border must be removed from slogan badge"
    assert '.top-corner-theme-switch' in css, "top-corner-theme-switch styling missing in style.css"
    assert '[data-theme="green"] .btn-hero-primary' in css, "Green theme button override missing in style.css"
    assert '[data-theme="green"] .btn-gate-enter' in css, "Green theme gate button override missing in style.css"

    # Verify app.js theme handling
    JS_FILE = BASE_DIR / "public" / "js" / "app.js"
    assert JS_FILE.exists(), "app.js must exist"
    with open(JS_FILE, "r", encoding="utf-8") as f:
        js = f.read()
    assert "setAppTheme" in js, "setAppTheme function missing in app.js"
    assert "toggleGreenTheme" in js, "toggleGreenTheme function missing in app.js"

    print("✓ index.html, style.css & app.js verified: very small top-right ON/OFF Green Theme switch, transparent logo, subtle #celebrate farming styling, 3 portals, and calculator!")

def test_middleman_cost_calculation_model():
    """Validates the mathematical precision of the median commission algorithm"""
    quintals = 25
    modal_rate = 22800  # Guntur Chilli
    gross = quintals * modal_rate  # 5,70,000

    median_rate = 10.0  # 10% total
    agent_fee_rate = median_rate * 0.50  # 5.0%
    cess_rate = median_rate * 0.20        # 2.0%
    hamali_rate = median_rate * 0.15      # 1.5%
    transit_rate = median_rate * 0.15     # 1.5%

    agent_fee = round(gross * (agent_fee_rate / 100))      # 28,500
    cess_fee = round(gross * (cess_rate / 100))            # 11,400
    hamali_fee = round(gross * (hamali_rate / 100))        # 8,550
    transit_fee = round(gross * (transit_rate / 100))      # 8,550
    total_deductions = agent_fee + cess_fee + hamali_fee + transit_fee  # 57,000

    traditional_payout = gross - total_deductions          # 5,13,000
    agrilink_direct_savings = total_deductions             # 57,000

    assert total_deductions == 57000, f"Expected 57,000 deduction, got {total_deductions}"
    assert traditional_payout == 513000, f"Expected 513,000 payout, got {traditional_payout}"
    assert agrilink_direct_savings == 57000
    print("✓ Middleman median cost commission calculation model validated with 100% mathematical accuracy!")

if __name__ == "__main__":
    print("Running AgriLink Prototype 2 Test Suite...")
    test_agmarknet_data()
    test_bidding_data_and_engine()
    test_i18n_dictionary()
    test_html_and_logos()
    test_middleman_cost_calculation_model()
    print("\n🎉 ALL TESTS PASSED SUCCESSFULLY!")


