/**
 * AgriLink - Multilingual Agricultural Price Portal
 * Team APEX {SYNTAX} @ MGIT.ac.in
 */

// Application State
const state = {
  activeView: "home",
  lang: localStorage.getItem("agrilink_lang") || "en",
  selectedCommodity: "all",
  selectedState: "all",
  selectedDistrict: "all",
  searchQuery: "",
  sortBy: "modal_price_desc",
  records: [],
  commodities: [],
  states: [],
  calcRecordIndex: 0,
  // Bidding & Dedicated Portals State
  biddingLots: [],
  selectedBiddingCrop: "all",
  selectedBiddingStatus: "all",
  fpoCropFilter: "all",
  fpoStatusFilter: "all",
  corpCropFilter: "all",
  corpStatusFilter: "all",
  commissionRate: 10.0 // Default Median APMC Middleman & Market Cost (10.0%)
};

// DOM Elements
const elements = {
  navTabs: document.querySelectorAll(".nav-tab"),
  pageViews: document.querySelectorAll(".page-view"),
  brandHomeClick: document.getElementById("brandHomeClick"),
  btnHeroExplore: document.getElementById("btnHeroExplore"),
  btnHeroCalc: document.getElementById("btnHeroCalc"),
  
  langButtons: document.querySelectorAll(".lang-btn"),
  cropPillsContainer: document.getElementById("cropPillsContainer"),
  mandiTableBody: document.getElementById("mandiTableBody"),
  recordsCountText: document.getElementById("recordsCountText"),
  
  // Filter inputs
  searchInput: document.getElementById("searchInput"),
  stateSelect: document.getElementById("stateSelect"),
  districtSelect: document.getElementById("districtSelect"),
  commoditySelect: document.getElementById("commoditySelect"),
  sortSelect: document.getElementById("sortSelect"),
  btnReset: document.getElementById("btnReset"),
  btnExport: document.getElementById("btnExport"),
  
  // Metrics
  metricAvgPrice: document.getElementById("metricAvgPrice"),
  metricAvgKg: document.getElementById("metricAvgKg"),
  metricHighestVal: document.getElementById("metricHighestVal"),
  metricHighestSub: document.getElementById("metricHighestSub"),
  metricLowestVal: document.getElementById("metricLowestVal"),
  metricLowestSub: document.getElementById("metricLowestSub"),
  metricMandisCount: document.getElementById("metricMandisCount"),
  
  // Calculator & Middleman Cost Elements
  calcMandiSelect: document.getElementById("calcMandiSelect"),
  calcQuantity: document.getElementById("calcQuantity"),
  calcUnitSelect: document.getElementById("calcUnitSelect"),
  calcAppliedRate: document.getElementById("calcAppliedRate"),
  calcTotalVal: document.getElementById("calcTotalVal"),
  calcCommissionBadge: document.getElementById("calcCommissionBadge"),
  btnCommMedian: document.getElementById("btnCommMedian"),
  btnCommLow: document.getElementById("btnCommLow"),
  btnCommHigh: document.getElementById("btnCommHigh"),
  calcAgentFeeVal: document.getElementById("calcAgentFeeVal"),
  calcCessVal: document.getElementById("calcCessVal"),
  calcHamaliVal: document.getElementById("calcHamaliVal"),
  calcTransitVal: document.getElementById("calcTransitVal"),
  calcTotalDeductionVal: document.getElementById("calcTotalDeductionVal"),
  calcTraditionalPayout: document.getElementById("calcTraditionalPayout"),
  calcLossVal: document.getElementById("calcLossVal"),
  calcSavingsVal: document.getElementById("calcSavingsVal"),
  
  // Modal
  syncModal: document.getElementById("syncModal"),
  btnOpenSync: document.getElementById("btnOpenSync"),
  btnCloseSync: document.getElementById("btnCloseSync"),
  btnModalClose: document.getElementById("btnModalClose"),
  btnSubmitSync: document.getElementById("btnSubmitSync"),
  apiKeyInput: document.getElementById("apiKeyInput"),
  apiSyncStatus: document.getElementById("apiSyncStatus"),

  // Dedicated Portals & Bidding Elements
  fpoLotsGrid: document.getElementById("fpoLotsGrid"),
  corporateLotsGrid: document.getElementById("corporateLotsGrid"),
  fpoCropFilter: document.getElementById("fpoCropFilter"),
  fpoStatusFilter: document.getElementById("fpoStatusFilter"),
  corporateCropFilter: document.getElementById("corporateCropFilter"),
  corporateStatusFilter: document.getElementById("corporateStatusFilter"),
  biddingCropFilter: document.getElementById("biddingCropFilter"),
  biddingStatusFilter: document.getElementById("biddingStatusFilter"),
  biddingLotsGrid: document.getElementById("biddingLotsGrid"),
  btnOpenHostModal: document.getElementById("btnOpenHostModal"),
  fpoHostModal: document.getElementById("fpoHostModal"),
  btnCloseHostModal: document.getElementById("btnCloseHostModal"),
  btnCloseHostModalBtn: document.getElementById("btnCloseHostModalBtn"),
  btnSubmitHostProduce: document.getElementById("btnSubmitHostProduce"),
  fpoHostForm: document.getElementById("fpoHostForm"),
  hostFormStatus: document.getElementById("hostFormStatus"),

  corporateBidModal: document.getElementById("corporateBidModal"),
  btnCloseBidModal: document.getElementById("btnCloseBidModal"),
  btnCloseBidModalBtn: document.getElementById("btnCloseBidModalBtn"),
  btnSubmitBlindBid: document.getElementById("btnSubmitBlindBid"),
  corporateBidForm: document.getElementById("corporateBidForm"),
  bidLotSummary: document.getElementById("bidLotSummary"),
  bidTargetLotId: document.getElementById("bidTargetLotId"),
  bidPriceInput: document.getElementById("bidPriceInput"),
  bidMinPriceGuide: document.getElementById("bidMinPriceGuide"),
  bidTotalContractVal: document.getElementById("bidTotalContractVal"),
  bidFormStatus: document.getElementById("bidFormStatus"),

  // Stats
  statActiveLots: document.getElementById("statActiveLots"),
  statTotalQuantity: document.getElementById("statTotalQuantity"),
  statSealedBids: document.getElementById("statSealedBids"),
  statAwardedLots: document.getElementById("statAwardedLots"),
  corpStatVolume: document.getElementById("corpStatVolume"),
  corpStatFpos: document.getElementById("corpStatFpos")
};

// Speech Synthesis Tracker
let activeUtterance = null;

// Initialize Application
async function init() {
  if (elements.apiKeyInput) {
    elements.apiKeyInput.value = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";
  }
  setupEventListeners();
  initTheme();
  initHeroSlideshow();
  updateLanguageUI();
  await fetchCommodities();
  await fetchStates();
  await loadPrices();
  await loadBiddingLots();
}

// Event Listeners
function setupEventListeners() {
  // Navigation Tabs
  elements.navTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const viewName = tab.dataset.view;
      switchView(viewName);
    });
  });

  if (elements.brandHomeClick) {
    elements.brandHomeClick.addEventListener("click", () => switchView("home"));
  }

  if (elements.btnHeroExplore) {
    elements.btnHeroExplore.addEventListener("click", () => switchView("farmer"));
  }

  if (elements.btnHeroCalc) {
    elements.btnHeroCalc.addEventListener("click", () => switchView("fpo"));
  }

  const btnScrollFeatures = document.getElementById("btnScrollFeatures");
  if (btnScrollFeatures) {
    btnScrollFeatures.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.getElementById("mainFeaturesSection");
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // Language Switchers
  elements.langButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const newLang = btn.dataset.lang;
      setLanguage(newLang);
    });
  });

  // Filter Events
  if (elements.searchInput) {
    elements.searchInput.addEventListener("input", debounce(() => {
      state.searchQuery = elements.searchInput.value.trim();
      loadPrices();
    }, 250));
  }

  if (elements.commoditySelect) {
    elements.commoditySelect.addEventListener("change", (e) => {
      state.selectedCommodity = e.target.value;
      syncPillSelection();
      loadPrices();
    });
  }

  if (elements.stateSelect) {
    elements.stateSelect.addEventListener("change", (e) => {
      state.selectedState = e.target.value;
      state.selectedDistrict = "all";
      populateDistricts();
      loadPrices();
    });
  }

  if (elements.districtSelect) {
    elements.districtSelect.addEventListener("change", (e) => {
      state.selectedDistrict = e.target.value;
      loadPrices();
    });
  }

  if (elements.sortSelect) {
    elements.sortSelect.addEventListener("change", (e) => {
      state.sortBy = e.target.value;
      loadPrices();
    });
  }

  if (elements.btnReset) elements.btnReset.addEventListener("click", resetFilters);
  if (elements.btnExport) elements.btnExport.addEventListener("click", exportToCSV);

  // Calculator Events
  if (elements.calcQuantity) elements.calcQuantity.addEventListener("input", calculateEarnings);
  if (elements.calcUnitSelect) elements.calcUnitSelect.addEventListener("change", calculateEarnings);
  if (elements.calcMandiSelect) elements.calcMandiSelect.addEventListener("change", calculateEarnings);

  // Middleman Commission Presets
  const commPresets = [
    { btn: elements.btnCommMedian, rate: 10.0 },
    { btn: elements.btnCommLow, rate: 6.0 },
    { btn: elements.btnCommHigh, rate: 15.0 }
  ];
  commPresets.forEach(preset => {
    if (preset.btn) {
      preset.btn.addEventListener("click", () => {
        commPresets.forEach(p => p.btn && p.btn.classList.remove("active"));
        preset.btn.classList.add("active");
        state.commissionRate = preset.rate;
        calculateEarnings();
      });
    }
  });

  // Modal Events
  if (elements.btnOpenSync) elements.btnOpenSync.addEventListener("click", () => elements.syncModal.classList.add("open"));
  if (elements.btnCloseSync) elements.btnCloseSync.addEventListener("click", () => elements.syncModal.classList.remove("open"));
  if (elements.btnModalClose) elements.btnModalClose.addEventListener("click", () => elements.syncModal.classList.remove("open"));
  if (elements.btnSubmitSync) elements.btnSubmitSync.addEventListener("click", handleLiveSync);

  // Legacy & General Bidding Filter Events
  if (elements.biddingCropFilter) {
    elements.biddingCropFilter.addEventListener("change", (e) => {
      state.selectedBiddingCrop = e.target.value;
      loadBiddingLots();
    });
  }

  if (elements.biddingStatusFilter) {
    elements.biddingStatusFilter.addEventListener("change", (e) => {
      state.selectedBiddingStatus = e.target.value;
      loadBiddingLots();
    });
  }

  // FPO Portal Filter Events
  if (elements.fpoCropFilter) {
    elements.fpoCropFilter.addEventListener("change", (e) => {
      state.fpoCropFilter = e.target.value;
      renderFpoLots(state.biddingLots);
    });
  }

  if (elements.fpoStatusFilter) {
    elements.fpoStatusFilter.addEventListener("change", (e) => {
      state.fpoStatusFilter = e.target.value;
      renderFpoLots(state.biddingLots);
    });
  }

  // Corporate Portal Filter Events
  if (elements.corporateCropFilter) {
    elements.corporateCropFilter.addEventListener("change", (e) => {
      state.corpCropFilter = e.target.value;
      renderCorporateLots(state.biddingLots);
    });
  }

  if (elements.corporateStatusFilter) {
    elements.corporateStatusFilter.addEventListener("change", (e) => {
      state.corpStatusFilter = e.target.value;
      renderCorporateLots(state.biddingLots);
    });
  }

  // FPO Host Produce Modal Events
  if (elements.btnOpenHostModal) {
    elements.btnOpenHostModal.addEventListener("click", openHostProduceModal);
  }
  if (elements.btnCloseHostModal) {
    elements.btnCloseHostModal.addEventListener("click", closeHostProduceModal);
  }
  if (elements.btnCloseHostModalBtn) {
    elements.btnCloseHostModalBtn.addEventListener("click", closeHostProduceModal);
  }
  if (elements.btnSubmitHostProduce) {
    elements.btnSubmitHostProduce.addEventListener("click", handleHostProduceSubmit);
  }

  // Corporate Blind Bid Modal Events
  if (elements.btnCloseBidModal) {
    elements.btnCloseBidModal.addEventListener("click", closeCorporateBidModal);
  }
  if (elements.btnCloseBidModalBtn) {
    elements.btnCloseBidModalBtn.addEventListener("click", closeCorporateBidModal);
  }
  if (elements.btnSubmitBlindBid) {
    elements.btnSubmitBlindBid.addEventListener("click", handleCorporateBidSubmit);
  }
  if (elements.bidPriceInput) {
    elements.bidPriceInput.addEventListener("input", updateBidContractPreview);
  }

  // Close modals on click outside
  window.addEventListener("click", (e) => {
    if (e.target === elements.syncModal) elements.syncModal.classList.remove("open");
    if (e.target === elements.fpoHostModal) closeHostProduceModal();
    if (e.target === elements.corporateBidModal) closeCorporateBidModal();
  });
}

// Tab View Switching
function switchView(viewName) {
  // Normalize aliases
  if (viewName === "prices" || viewName === "calculator") viewName = "farmer";
  if (viewName === "bidding") viewName = "fpo";

  state.activeView = viewName;
  elements.navTabs.forEach(tab => {
    tab.classList.toggle("active", tab.dataset.view === viewName);
  });

  const viewHome = document.getElementById("view-home");
  const viewFarmer = document.getElementById("view-farmer");
  const viewFpo = document.getElementById("view-fpo");
  const viewCorporate = document.getElementById("view-corporate");
  const viewCallback = document.getElementById("view-callback");

  // Fallbacks for legacy view IDs if present
  const viewPrices = document.getElementById("view-prices");
  const viewCalc = document.getElementById("view-calculator");
  const viewBidding = document.getElementById("view-bidding");

  if (viewHome) {
    viewHome.style.display = viewName === "home" ? "flex" : "none";
    viewHome.classList.toggle("hidden", viewName !== "home");
  }
  if (viewFarmer) {
    viewFarmer.style.display = viewName === "farmer" ? "flex" : "none";
    viewFarmer.classList.toggle("hidden", viewName !== "farmer");
    if (viewName === "farmer") {
      loadPrices();
    }
  } else if (viewPrices) {
    viewPrices.style.display = viewName === "farmer" ? "flex" : "none";
    viewPrices.classList.toggle("hidden", viewName !== "farmer");
  }

  if (viewFpo) {
    viewFpo.style.display = viewName === "fpo" ? "flex" : "none";
    viewFpo.classList.toggle("hidden", viewName !== "fpo");
    if (viewName === "fpo") {
      loadBiddingLots();
    }
  } else if (viewBidding) {
    viewBidding.style.display = viewName === "fpo" ? "flex" : "none";
    viewBidding.classList.toggle("hidden", viewName !== "fpo");
  }

  if (viewCorporate) {
    viewCorporate.style.display = viewName === "corporate" ? "flex" : "none";
    viewCorporate.classList.toggle("hidden", viewName !== "corporate");
    if (viewName === "corporate") {
      loadBiddingLots();
    }
  }

  if (viewCallback) {
    viewCallback.style.display = viewName === "callback" ? "block" : "none";
    viewCallback.classList.toggle("hidden", viewName !== "callback");
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}
window.switchView = switchView;

// Global action to jump from Home Page featured crop to Mandi Prices
window.goToCropPrices = function(cropName) {
  state.selectedCommodity = cropName;
  if (elements.commoditySelect) {
    elements.commoditySelect.value = cropName;
  }
  syncPillSelection();
  switchView("farmer");
  loadPrices();
};

// Language Switching
function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) return;
  state.lang = lang;
  localStorage.setItem("agrilink_lang", lang);
  
  // Update active button state
  elements.langButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  // Update HTML text nodes
  updateLanguageUI();

  // Refresh dynamic contents
  renderCropPills();
  populateCommodityDropdown();
  populateStateDropdown();
  populateDistricts();
  renderTable();
  populateCalculatorSelect();
  calculateEarnings();
  renderFpoLots(state.biddingLots);
  renderCorporateLots(state.biddingLots);
  renderBiddingLots(state.biddingLots);
}

function updateLanguageUI() {
  const lang = state.lang;
  
  // Generic data-i18n translation
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const translated = t(key, lang);
    if (translated) {
      el.textContent = translated;
    }
  });

  // Placeholder translation
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    const translated = t(key, lang);
    if (translated) {
      el.setAttribute("placeholder", translated);
    }
  });

  // Update featured crop names on the Home Page
  document.querySelectorAll("[data-crop-name]").forEach(el => {
    const crop = el.getAttribute("data-crop-name");
    const localized = getCommodityName(crop, lang);
    if (localized) {
      el.textContent = localized;
    }
  });

  // Update document title
  document.title = `${t("app_title", lang)} | ${t("app_subtitle", lang)}`;
}

// Fetch Commodities
async function fetchCommodities() {
  try {
    const res = await fetch("/api/commodities");
    const data = await res.json();
    if (data.success) {
      state.commodities = data.commodities;
      renderCropPills();
      populateCommodityDropdown();
    }
  } catch (err) {
    console.error("Error fetching commodities:", err);
  }
}

// Fetch States & Districts
async function fetchStates() {
  try {
    const res = await fetch("/api/states");
    const data = await res.json();
    if (data.success) {
      state.states = data.states;
      populateStateDropdown();
    }
  } catch (err) {
    console.error("Error fetching states:", err);
  }
}

// Render Crop Filter Pills
function renderCropPills() {
  if (!elements.cropPillsContainer) return;
  const lang = state.lang;
  let html = `
    <button class="crop-pill ${state.selectedCommodity === 'all' ? 'active' : ''}" data-crop="all">
      <span>🌾</span> ${t("all_crops", lang)}
    </button>
  `;

  // Focus crops explicitly requested: Chilli, Paddy, Cotton, Tomato, Wheat
  const priorityCrops = ["Chilli", "Paddy", "Cotton", "Tomato", "Wheat"];
  
  const sorted = [...state.commodities].sort((a, b) => {
    const aIdx = priorityCrops.indexOf(a.id);
    const bIdx = priorityCrops.indexOf(b.id);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

  sorted.forEach(c => {
    const isActive = state.selectedCommodity.toLowerCase() === c.id.toLowerCase();
    const localizedName = getCommodityName(c.id, lang);
    html += `
      <button class="crop-pill ${isActive ? 'active' : ''}" data-crop="${c.id}">
        <span>${c.icon}</span> ${localizedName}
      </button>
    `;
  });

  elements.cropPillsContainer.innerHTML = html;

  // Add click handlers
  elements.cropPillsContainer.querySelectorAll(".crop-pill").forEach(btn => {
    btn.addEventListener("click", () => {
      state.selectedCommodity = btn.dataset.crop;
      syncPillSelection();
      if (elements.commoditySelect) elements.commoditySelect.value = state.selectedCommodity;
      loadPrices();
    });
  });
}

function syncPillSelection() {
  if (!elements.cropPillsContainer) return;
  elements.cropPillsContainer.querySelectorAll(".crop-pill").forEach(btn => {
    const isSelected = btn.dataset.crop.toLowerCase() === state.selectedCommodity.toLowerCase();
    btn.classList.toggle("active", isSelected);
  });
}

function populateCommodityDropdown() {
  if (!elements.commoditySelect) return;
  const lang = state.lang;
  let html = `<option value="all">${t("all_crops", lang)}</option>`;
  state.commodities.forEach(c => {
    const localizedName = getCommodityName(c.id, lang);
    html += `<option value="${c.id}">${c.icon} ${localizedName}</option>`;
  });
  elements.commoditySelect.innerHTML = html;
  elements.commoditySelect.value = state.selectedCommodity;
}

function populateStateDropdown() {
  if (!elements.stateSelect) return;
  const lang = state.lang;
  let html = `<option value="all">${t("all_states", lang)}</option>`;
  state.states.forEach(s => {
    const localizedState = getStateName(s.state, lang);
    html += `<option value="${s.state}">${localizedState}</option>`;
  });
  elements.stateSelect.innerHTML = html;
  elements.stateSelect.value = state.selectedState;
}

function populateDistricts() {
  if (!elements.districtSelect) return;
  const lang = state.lang;
  if (state.selectedState === "all") {
    elements.districtSelect.innerHTML = `<option value="all">${t("all_districts", lang)}</option>`;
    elements.districtSelect.disabled = true;
    return;
  }

  const found = state.states.find(s => s.state === state.selectedState);
  if (!found || !found.districts.length) {
    elements.districtSelect.innerHTML = `<option value="all">${t("all_districts", lang)}</option>`;
    elements.districtSelect.disabled = true;
    return;
  }

  elements.districtSelect.disabled = false;
  let html = `<option value="all">${t("all_districts", lang)}</option>`;
  found.districts.forEach(d => {
    html += `<option value="${d}">${d}</option>`;
  });
  elements.districtSelect.innerHTML = html;
  elements.districtSelect.value = state.selectedDistrict;
}

// Load Prices from Server
async function loadPrices() {
  const params = new URLSearchParams();
  if (state.selectedCommodity !== "all") params.append("commodity", state.selectedCommodity);
  if (state.selectedState !== "all") params.append("state", state.selectedState);
  if (state.selectedDistrict !== "all") params.append("district", state.selectedDistrict);
  if (state.searchQuery) params.append("search", state.searchQuery);
  if (state.sortBy) params.append("sort", state.sortBy);

  try {
    const res = await fetch(`/api/prices?${params.toString()}`);
    const data = await res.json();
    if (data.success) {
      state.records = data.records;
      updateMetrics(data.stats);
      renderTable();
      populateCalculatorSelect();
      calculateEarnings();
    }
  } catch (err) {
    console.error("Error loading prices:", err);
  }
}

// Update Summary Metric Cards
function updateMetrics(stats) {
  const lang = state.lang;
  const perQ = t("per_quintal", lang);
  const perKg = t("per_kg", lang);

  if (!stats || stats.total_markets === 0) {
    if (elements.metricAvgPrice) elements.metricAvgPrice.textContent = "₹0";
    if (elements.metricAvgKg) elements.metricAvgKg.textContent = `₹0 ${perKg}`;
    if (elements.metricHighestVal) elements.metricHighestVal.textContent = "₹0";
    if (elements.metricHighestSub) elements.metricHighestSub.textContent = "-";
    if (elements.metricLowestVal) elements.metricLowestVal.textContent = "₹0";
    if (elements.metricLowestSub) elements.metricLowestSub.textContent = "-";
    if (elements.metricMandisCount) elements.metricMandisCount.textContent = "0";
    return;
  }

  // Average
  if (elements.metricAvgPrice) elements.metricAvgPrice.textContent = `₹${stats.avg_price.toLocaleString("en-IN")}`;
  const kgPrice = (stats.avg_price / 100).toFixed(1);
  if (elements.metricAvgKg) elements.metricAvgKg.textContent = `₹${kgPrice} ${perKg}`;

  // Highest
  if (elements.metricHighestVal) elements.metricHighestVal.textContent = `₹${stats.highest_price.toLocaleString("en-IN")}`;
  const highestRecord = state.records.find(r => r.modal_price === stats.highest_price);
  if (highestRecord && elements.metricHighestSub) {
    elements.metricHighestSub.textContent = `${highestRecord.market} (${getStateName(highestRecord.state, lang)})`;
  }

  // Lowest
  if (elements.metricLowestVal) elements.metricLowestVal.textContent = `₹${stats.lowest_price.toLocaleString("en-IN")}`;
  const lowestRecord = state.records.find(r => r.modal_price === stats.lowest_price);
  if (lowestRecord && elements.metricLowestSub) {
    elements.metricLowestSub.textContent = `${lowestRecord.market} (${getStateName(lowestRecord.state, lang)})`;
  }

  // Count
  if (elements.metricMandisCount) elements.metricMandisCount.textContent = stats.total_markets.toString();
}

// Render Mandi Price Table
function renderTable() {
  if (!elements.mandiTableBody) return;
  const lang = state.lang;
  const count = state.records.length;
  if (elements.recordsCountText) {
    elements.recordsCountText.textContent = t("records_count", lang).replace("{count}", count);
  }

  if (count === 0) {
    elements.mandiTableBody.innerHTML = `
      <tr>
        <td colspan="11" class="empty-state">
          <div>🔍 ${t("no_records", lang)}</div>
        </td>
      </tr>
    `;
    return;
  }

  let html = "";
  state.records.forEach((r, idx) => {
    const cropName = getCommodityName(r.commodity, lang);
    const stateName = getStateName(r.state, lang);
    const meta = state.commodities.find(c => c.id.toLowerCase() === r.commodity.toLowerCase()) || { icon: "🌱" };
    const perKg = (r.modal_price / 100).toFixed(1);
    
    // Spread calculation
    const spreadRange = r.max_price - r.min_price;
    const spreadPct = spreadRange > 0 ? Math.min(100, Math.max(10, Math.round(((r.modal_price - r.min_price) / spreadRange) * 100))) : 50;

    html += `
      <tr>
        <td>
          <div class="crop-badge">
            <span class="crop-icon-chip">${meta.icon}</span>
            <span>${cropName}</span>
          </div>
        </td>
        <td>
          <strong>${stateName}</strong><br>
          <small class="text-muted">${r.district}</small>
        </td>
        <td><strong>${r.market}</strong></td>
        <td><span class="variety-pill">${r.variety || 'FAQ'}</span></td>
        <td><small class="text-muted">${r.arrival_date || '10/09/2026'}</small></td>
        <td>₹${r.min_price.toLocaleString("en-IN")}</td>
        <td>₹${r.max_price.toLocaleString("en-IN")}</td>
        <td><span class="modal-price-tag">₹${r.modal_price.toLocaleString("en-IN")}</span></td>
        <td><span class="unit-price-tag">₹${perKg}</span></td>
        <td>
          <div class="spread-bar-wrap" title="Min: ₹${r.min_price} | Max: ₹${r.max_price}">
            <div class="spread-bar-fill" style="width: ${spreadPct}%"></div>
          </div>
          <small class="text-muted" style="font-size:0.75rem;">₹${r.min_price} - ₹${r.max_price}</small>
        </td>
        <td>
          <button class="btn-voice" onclick="readPriceAudio(${idx})">
            🔊 ${t("voice_btn", lang)}
          </button>
        </td>
      </tr>
    `;
  });

  elements.mandiTableBody.innerHTML = html;
}

// Speech Synthesis / Audio Readout
window.readPriceAudio = function(index) {
  const r = state.records[index];
  if (!r) return;

  const lang = state.lang;
  const cropName = getCommodityName(r.commodity, lang);
  const stateName = getStateName(r.state, lang);
  const kgPrice = (r.modal_price / 100).toFixed(0);

  // Map application language to BCP 47 voice tag
  const langCodeMap = {
    en: "en-IN",
    te: "te-IN",
    ta: "ta-IN",
    mr: "mr-IN",
    pa: "pa-IN",
    hi: "hi-IN"
  };

  const template = t("voice_template", lang);
  const speechText = template
    .replace("{state}", stateName)
    .replace("{district}", r.district)
    .replace("{market}", r.market)
    .replace("{commodity}", cropName)
    .replace("{variety}", r.variety)
    .replace("{price}", r.modal_price.toString())
    .replace("{kg_price}", kgPrice.toString());

  if (!("speechSynthesis" in window)) {
    alert("Audio speech synthesis is not supported on this browser.");
    return;
  }

  // Cancel any existing utterance
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(speechText);
  utterance.lang = langCodeMap[lang] || "hi-IN";
  utterance.rate = 0.9; // Slightly slower for clear agricultural comprehension

  const voices = window.speechSynthesis.getVoices();
  const regionalVoice = voices.find(v => v.lang.startsWith(utterance.lang) || v.lang.includes(lang));
  if (regionalVoice) {
    utterance.voice = regionalVoice;
  }

  window.speechSynthesis.speak(utterance);
};

// Reset All Filters
function resetFilters() {
  state.selectedCommodity = "all";
  state.selectedState = "all";
  state.selectedDistrict = "all";
  state.searchQuery = "";
  state.sortBy = "modal_price_desc";

  if (elements.searchInput) elements.searchInput.value = "";
  if (elements.commoditySelect) elements.commoditySelect.value = "all";
  if (elements.stateSelect) elements.stateSelect.value = "all";
  if (elements.districtSelect) elements.districtSelect.value = "all";
  if (elements.sortSelect) elements.sortSelect.value = "modal_price_desc";

  syncPillSelection();
  populateDistricts();
  loadPrices();
}

// Export Filtered Records to CSV
function exportToCSV() {
  if (!state.records.length) {
    alert("No records to export.");
    return;
  }

  const lang = state.lang;
  const headers = [
    t("th_commodity", lang),
    t("select_state", lang),
    t("select_district", lang),
    t("th_mandi", lang),
    t("th_variety", lang),
    t("th_date", lang),
    t("th_min_price", lang),
    t("th_max_price", lang),
    t("th_modal_price", lang),
    t("th_unit_price", lang)
  ];

  const rows = state.records.map(r => [
    `"${getCommodityName(r.commodity, lang)}"`,
    `"${getStateName(r.state, lang)}"`,
    `"${r.district}"`,
    `"${r.market.replace(/"/g, '""')}"`,
    `"${(r.variety || '').replace(/"/g, '""')}"`,
    `"${r.arrival_date || ''}"`,
    r.min_price,
    r.max_price,
    r.modal_price,
    (r.modal_price / 100).toFixed(2)
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `AgriLink_Mandi_Prices_${state.selectedCommodity}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Populate Farmer Calculator Mandi Selection
function populateCalculatorSelect() {
  if (!elements.calcMandiSelect) return;
  const lang = state.lang;
  let html = "";
  state.records.forEach((r, idx) => {
    const cropName = getCommodityName(r.commodity, lang);
    html += `<option value="${idx}">${cropName} - ${r.market} (₹${r.modal_price}/q)</option>`;
  });
  if (!state.records.length) {
    html = `<option value="-1">${t("no_records", lang)}</option>`;
  }
  elements.calcMandiSelect.innerHTML = html;
}

// Calculate Farmer Earnings & Middleman Market Cost Deductions
function calculateEarnings() {
  if (!elements.calcMandiSelect || !elements.calcQuantity || !elements.calcUnitSelect) return;
  const selectedIdx = parseInt(elements.calcMandiSelect.value);
  const qty = parseFloat(elements.calcQuantity.value) || 0;
  const unit = elements.calcUnitSelect.value;
  const lang = state.lang;
  const commRate = state.commissionRate || 10.0;

  if (selectedIdx < 0 || !state.records[selectedIdx] || qty <= 0) {
    if (elements.calcTotalVal) elements.calcTotalVal.textContent = "₹0";
    if (elements.calcAppliedRate) elements.calcAppliedRate.textContent = "-";
    if (elements.calcTraditionalPayout) elements.calcTraditionalPayout.textContent = "₹0";
    if (elements.calcLossVal) elements.calcLossVal.textContent = "₹0";
    if (elements.calcSavingsVal) elements.calcSavingsVal.textContent = "+₹0";
    if (elements.calcAgentFeeVal) elements.calcAgentFeeVal.textContent = "-₹0";
    if (elements.calcCessVal) elements.calcCessVal.textContent = "-₹0";
    if (elements.calcHamaliVal) elements.calcHamaliVal.textContent = "-₹0";
    if (elements.calcTransitVal) elements.calcTransitVal.textContent = "-₹0";
    if (elements.calcTotalDeductionVal) elements.calcTotalDeductionVal.textContent = "-₹0";
    return;
  }

  const record = state.records[selectedIdx];
  const modalRate = record.modal_price; // per quintal (100kg)
  
  let quintals = 0;
  if (unit === "quintal") {
    quintals = qty;
  } else if (unit === "kg") {
    quintals = qty / 100;
  } else if (unit === "bag") {
    quintals = (qty * 50) / 100; // 50kg bag
  }

  // 1. Full Gross Fair Realization (Official Modal Benchmark)
  const grossValue = Math.round(quintals * modalRate);

  // 2. Middlemen & Market-Cost Breakdown (Based on Median Market Rates)
  // Median distribution of the selected commission rate (default 10% total):
  // Agent commission: 50% of total rate (5.0% for 10% median)
  // Mandi Cess & fee: 20% of total rate (2.0% for 10% median)
  // Hamali & Weighing: 15% of total rate (1.5% for 10% median)
  // Transport/transit margin: 15% of total rate (1.5% for 10% median)
  const agentFeeRate = (commRate * 0.50);
  const cessRate = (commRate * 0.20);
  const hamaliRate = (commRate * 0.15);
  const transitRate = (commRate * 0.15);

  const agentFee = Math.round(grossValue * (agentFeeRate / 100));
  const cessFee = Math.round(grossValue * (cessRate / 100));
  const hamaliFee = Math.round(grossValue * (hamaliRate / 100));
  const transitFee = Math.round(grossValue * (transitRate / 100));
  const totalDeductions = agentFee + cessFee + hamaliFee + transitFee;

  // 3. Traditional Middleman Channel Payout
  const traditionalPayout = Math.max(0, grossValue - totalDeductions);

  // 4. AgriLink Direct Savings (Kept in Farmer's Pocket)
  const farmerSavings = totalDeductions;

  // Update DOM Elements
  if (elements.calcTotalVal) elements.calcTotalVal.textContent = `₹${grossValue.toLocaleString("en-IN")}`;
  if (elements.calcTraditionalPayout) elements.calcTraditionalPayout.textContent = `₹${traditionalPayout.toLocaleString("en-IN")}`;
  if (elements.calcLossVal) elements.calcLossVal.textContent = `₹${totalDeductions.toLocaleString("en-IN")}`;
  if (elements.calcSavingsVal) elements.calcSavingsVal.textContent = `+₹${farmerSavings.toLocaleString("en-IN")} (${commRate.toFixed(1)}%)`;

  if (elements.calcAgentFeeVal) elements.calcAgentFeeVal.textContent = `-₹${agentFee.toLocaleString("en-IN")} (${agentFeeRate.toFixed(1)}%)`;
  if (elements.calcCessVal) elements.calcCessVal.textContent = `-₹${cessFee.toLocaleString("en-IN")} (${cessRate.toFixed(1)}%)`;
  if (elements.calcHamaliVal) elements.calcHamaliVal.textContent = `-₹${hamaliFee.toLocaleString("en-IN")} (${hamaliRate.toFixed(1)}%)`;
  if (elements.calcTransitVal) elements.calcTransitVal.textContent = `-₹${transitFee.toLocaleString("en-IN")} (${transitRate.toFixed(1)}%)`;
  if (elements.calcTotalDeductionVal) elements.calcTotalDeductionVal.textContent = `-₹${totalDeductions.toLocaleString("en-IN")} (${commRate.toFixed(1)}%)`;

  if (elements.calcCommissionBadge) {
    elements.calcCommissionBadge.textContent = `${t("calc_middleman_badge_label", lang) || "Commission Cost"}: ${commRate.toFixed(1)}%`;
  }

  if (elements.calcAppliedRate) {
    elements.calcAppliedRate.textContent = `₹${modalRate.toLocaleString("en-IN")} ${t("per_quintal", lang)} (₹${(modalRate / 100).toFixed(1)} ${t("per_kg", lang)})`;
  }
}

// Live Government API Sync Handler
async function handleLiveSync() {
  const apiKey = elements.apiKeyInput.value.trim();
  elements.btnSubmitSync.disabled = true;
  elements.apiSyncStatus.innerHTML = `<span style="color:#0284c7;">Connecting to Government of India (data.gov.in) API...</span>`;

  try {
    const res = await fetch("/api/fetch-live", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: apiKey, commodity: state.selectedCommodity })
    });
    const data = await res.json();
    if (data.success) {
      elements.apiSyncStatus.innerHTML = `<span style="color:#16a34a;">✓ ${data.message}</span>`;
      setTimeout(() => {
        elements.syncModal.classList.remove("open");
        elements.btnSubmitSync.disabled = false;
        loadPrices();
      }, 1200);
    } else {
      elements.apiSyncStatus.innerHTML = `<span style="color:#dc2626;">Error: ${data.message || 'Failed to sync'}</span>`;
      elements.btnSubmitSync.disabled = false;
    }
  } catch (err) {
    elements.apiSyncStatus.innerHTML = `<span style="color:#dc2626;">Connection failed. Using verified local Agmarknet records.</span>`;
    elements.btnSubmitSync.disabled = false;
  }
}

// Debounce helper
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// ================================================================
// BACKGROUND SLIDESHOW CONTROLLER (Site-Wide & Hero 5-Second Cycle)
// ================================================================
let heroSlideIndex = 0;
let heroSlideInterval = null;

function initHeroSlideshow() {
  const heroSlides = document.querySelectorAll(".hero-bg-slide");
  const siteSlides = document.querySelectorAll(".site-bg-slide");
  const badges = document.querySelectorAll(".hero-slide-badge");
  if (!heroSlides.length && !siteSlides.length) return;

  function showSlide(index) {
    const total = Math.max(heroSlides.length, siteSlides.length);
    heroSlideIndex = (index + total) % total;
    heroSlides.forEach((s, idx) => s.classList.toggle("active", idx === heroSlideIndex));
    siteSlides.forEach((s, idx) => s.classList.toggle("active", idx === heroSlideIndex));
    badges.forEach((b, idx) => b.classList.toggle("active", idx === heroSlideIndex));
  }

  badges.forEach((badge, idx) => {
    badge.addEventListener("click", () => {
      showSlide(idx);
      restartInterval();
    });
  });

  function restartInterval() {
    if (heroSlideInterval) clearInterval(heroSlideInterval);
    // Automatic cycle every 5 seconds as requested by the user
    heroSlideInterval = setInterval(() => {
      showSlide(heroSlideIndex + 1);
    }, 5000);
  }

  restartInterval();
}

// ================================================================
// FPO BULK BIDDING & CORPORATE BLIND AUCTION SYSTEM
// ================================================================

const CROP_ICONS = {
  "Chilli": "🌶️",
  "Paddy": "🌾",
  "Cotton": "☁️",
  "Tomato": "🍅",
  "Wheat": "🌾",
  "Onion": "🧅",
  "Potato": "🥔",
  "Maize": "🌽",
  "Soyabean": "🌱",
  "Mustard": "🌼"
};

// Fetch and render bidding lots
async function loadBiddingLots() {
  try {
    const res = await fetch("/api/bidding/listings?commodity=all&status=all");
    const data = await res.json();
    
    if (data.success) {
      state.biddingLots = data.lots || [];
      updateBiddingStats(data.lots || []);
      renderFpoLots(data.lots || []);
      renderCorporateLots(data.lots || []);
      renderBiddingLots(data.lots || []);
    }
  } catch (err) {
    console.error("Error loading bidding lots:", err);
  }
}

// Update high-level stat numbers
function updateBiddingStats(lots) {
  const activeLots = lots.filter(l => l.status === "OPEN");
  const awardedLots = lots.filter(l => l.status === "AWARDED");
  
  const totalQty = lots.reduce((acc, l) => acc + (l.quantity || 0), 0);
  const totalSealedBids = lots.reduce((acc, l) => acc + (l.bid_count || (l.bids ? l.bids.length : 0)), 0);

  if (elements.statActiveLots) elements.statActiveLots.textContent = activeLots.length;
  if (elements.statTotalQuantity) elements.statTotalQuantity.textContent = `${totalQty.toLocaleString("en-IN")} Qtl`;
  if (elements.statSealedBids) elements.statSealedBids.textContent = totalSealedBids;
  if (elements.statAwardedLots) elements.statAwardedLots.textContent = awardedLots.length;

  if (elements.corpStatVolume) elements.corpStatVolume.textContent = `${totalQty.toLocaleString("en-IN")} Qtl`;
  if (elements.corpStatFpos) {
    const fpos = new Set(lots.map(l => l.fpo_name));
    elements.corpStatFpos.textContent = `${Math.max(fpos.size, 12)}+`;
  }
}

// Render FPO Portal Lots Grid (FPO persona: auction management, base prices, awarding contracts)
function renderFpoLots(lots) {
  if (!elements.fpoLotsGrid) return;
  const lang = state.lang;
  lots = lots || state.biddingLots || [];

  const cropFilter = state.fpoCropFilter || "all";
  const statusFilter = state.fpoStatusFilter || "all";

  const filtered = lots.filter(lot => {
    const matchCrop = (cropFilter === "all" || lot.commodity === cropFilter);
    const matchStatus = (statusFilter === "all" || lot.status === statusFilter);
    return matchCrop && matchStatus;
  });

  if (!filtered.length) {
    elements.fpoLotsGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; padding: 60px 20px;">
        <div style="font-size: 3rem; margin-bottom: 12px;">🌾</div>
        <h3>${t("no_records", lang)}</h3>
        <p style="color: var(--text-muted); margin-top: 6px;">No bulk produce lots found matching your filter. Click "+ Host Bulk Produce (FPO)" to list member harvests.</p>
      </div>
    `;
    return;
  }

  let html = "";
  filtered.forEach(lot => {
    const icon = CROP_ICONS[lot.commodity] || "📦";
    const cropName = getCommodityName(lot.commodity, lang);
    const isOpen = lot.status === "OPEN";
    const bidCount = lot.bid_count || (lot.bids ? lot.bids.length : 0);
    const statusText = isOpen ? t("status_open", lang) : t("status_awarded", lang);
    const statusClass = isOpen ? "status-open" : "status-awarded";

    let winnerHtml = "";
    if (!isOpen && lot.awarded_bid) {
      winnerHtml = `
        <div class="winner-strip" style="margin-top: 14px;">
          <span class="winner-title">${t("winner_title", lang)}</span>
          <span class="winner-name">🏢 ${escapeHtml(lot.awarded_bid.company_name)}</span>
          <span class="winner-price">₹${lot.awarded_bid.bid_price.toLocaleString("en-IN")} / Quintal • Direct Contract: ₹${lot.awarded_bid.total_amount.toLocaleString("en-IN")}</span>
        </div>
      `;
    }

    let actionButtonsHtml = "";
    if (isOpen) {
      actionButtonsHtml = `
        <div class="auction-actions">
          <button class="btn-award-action" style="width: 100%; padding: 12px;" onclick="handleAwardLot('${lot.id}')" title="Award produce to current highest sealed bidder">
            <span>🏆</span> <span>${t("btn_award_action", lang)}</span>
          </button>
        </div>
      `;
    } else {
      actionButtonsHtml = `
        <div class="auction-actions">
          <button class="btn-award-action" style="width: 100%; padding: 12px; background: #059669; color: #ffffff; cursor: default;" disabled>
            <span>✓</span> <span>Contract Concluded & Harvest Awarded</span>
          </button>
        </div>
      `;
    }

    html += `
      <div class="auction-card ${isOpen ? '' : 'awarded'}">
        <div>
          <div class="auction-header">
            <div class="fpo-identity">
              <span class="fpo-name-title">🌾 ${escapeHtml(lot.fpo_name)}</span>
              <span class="fpo-loc">📍 ${escapeHtml(lot.district)}, ${escapeHtml(lot.state)}</span>
            </div>
            <span class="lot-status-pill ${statusClass}">${statusText}</span>
          </div>

          <div class="commodity-lot-box" style="margin-top: 14px;">
            <div class="com-lot-icon">${icon}</div>
            <div class="com-lot-meta">
              <span class="com-lot-name">${cropName}</span>
              <span class="com-lot-variety">${escapeHtml(lot.variety)}</span>
            </div>
          </div>

          <div class="lot-specs-row" style="margin-top: 14px;">
            <div class="lot-spec-item">
              <span class="spec-label">${t("label_quantity", lang).replace('*','')}</span>
              <span class="spec-val">${lot.quantity.toLocaleString("en-IN")} ${lot.unit || 'Quintals'}</span>
            </div>
            <div class="lot-spec-item">
              <span class="spec-label">${t("label_min_price", lang).replace('*','')}</span>
              <span class="spec-val" style="color: #166534;">₹${lot.min_price.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div class="blind-status-strip" style="margin-top: 14px;">
            <span>🔒 ${t("sealed_bids_count", lang).replace("{count}", bidCount)}</span>
            <span style="font-size: 0.76rem; color: #047857;">Sealed Blind Bids</span>
          </div>

          ${winnerHtml}
        </div>

        <div style="margin-top: 12px;">
          ${actionButtonsHtml}
        </div>
      </div>
    `;
  });

  elements.fpoLotsGrid.innerHTML = html;
}

// Render Corporate Portal Lots Grid (Corporate persona: sourcing & placing sealed blind bids)
function renderCorporateLots(lots) {
  if (!elements.corporateLotsGrid) return;
  const lang = state.lang;
  lots = lots || state.biddingLots || [];

  const cropFilter = state.corpCropFilter || "all";
  const statusFilter = state.corpStatusFilter || "all";

  const filtered = lots.filter(lot => {
    const matchCrop = (cropFilter === "all" || lot.commodity === cropFilter);
    const matchStatus = (statusFilter === "all" || lot.status === statusFilter);
    return matchCrop && matchStatus;
  });

  if (!filtered.length) {
    elements.corporateLotsGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; padding: 60px 20px;">
        <div style="font-size: 3rem; margin-bottom: 12px;">🏢</div>
        <h3>${t("no_records", lang)}</h3>
        <p style="color: var(--text-muted); margin-top: 6px;">No certified FPO lots found matching your procurement filter.</p>
      </div>
    `;
    return;
  }

  let html = "";
  filtered.forEach(lot => {
    const icon = CROP_ICONS[lot.commodity] || "📦";
    const cropName = getCommodityName(lot.commodity, lang);
    const isOpen = lot.status === "OPEN";
    const bidCount = lot.bid_count || (lot.bids ? lot.bids.length : 0);
    const statusText = isOpen ? t("status_open", lang) : t("status_awarded", lang);
    const statusClass = isOpen ? "status-open" : "status-awarded";

    let winnerHtml = "";
    if (!isOpen && lot.awarded_bid) {
      winnerHtml = `
        <div class="winner-strip" style="margin-top: 14px;">
          <span class="winner-title">${t("winner_title", lang)}</span>
          <span class="winner-name">🏢 ${escapeHtml(lot.awarded_bid.company_name)}</span>
          <span class="winner-price">Winning Rate: ₹${lot.awarded_bid.bid_price.toLocaleString("en-IN")}/q</span>
        </div>
      `;
    }

    let actionButtonsHtml = "";
    if (isOpen) {
      actionButtonsHtml = `
        <div class="auction-actions">
          <button class="btn-bid-action" style="width: 100%; padding: 12px;" onclick="openCorporateBidModal('${lot.id}')">
            <span>🔒</span> <span>${t("btn_bid_action", lang)}</span>
          </button>
        </div>
      `;
    } else {
      actionButtonsHtml = `
        <div class="auction-actions">
          <button class="btn-bid-action" style="width: 100%; padding: 12px; background: #64748b; cursor: default;" disabled>
            <span>✓</span> <span>Supply Contract Awarded</span>
          </button>
        </div>
      `;
    }

    html += `
      <div class="auction-card ${isOpen ? '' : 'awarded'}">
        <div>
          <div class="auction-header">
            <div class="fpo-identity">
              <span class="fpo-name-title">🌾 ${escapeHtml(lot.fpo_name)}</span>
              <span class="fpo-loc">📍 ${escapeHtml(lot.district)}, ${escapeHtml(lot.state)}</span>
            </div>
            <span class="lot-status-pill ${statusClass}">${statusText}</span>
          </div>

          <div class="commodity-lot-box" style="margin-top: 14px;">
            <div class="com-lot-icon">${icon}</div>
            <div class="com-lot-meta">
              <span class="com-lot-name">${cropName}</span>
              <span class="com-lot-variety">${escapeHtml(lot.variety)}</span>
            </div>
          </div>

          <div class="lot-specs-row" style="margin-top: 14px;">
            <div class="lot-spec-item">
              <span class="spec-label">${t("label_quantity", lang).replace('*','')}</span>
              <span class="spec-val">${lot.quantity.toLocaleString("en-IN")} ${lot.unit || 'Quintals'}</span>
            </div>
            <div class="lot-spec-item">
              <span class="spec-label">${t("label_min_price", lang).replace('*','')}</span>
              <span class="spec-val" style="color: #166534;">₹${lot.min_price.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div class="blind-status-strip" style="margin-top: 14px;">
            <span>🔒 Confidential Sealed Blind Bidding</span>
            <span style="font-size: 0.76rem; color: #047857;">${bidCount} Bids Submitted</span>
          </div>

          ${winnerHtml}
        </div>

        <div style="margin-top: 12px;">
          ${actionButtonsHtml}
        </div>
      </div>
    `;
  });

  elements.corporateLotsGrid.innerHTML = html;
}

// Render legacy auction lots grid (fallback if elements.biddingLotsGrid exists)
function renderBiddingLots(lots) {
  if (!elements.biddingLotsGrid) return;
  const lang = state.lang;

  if (!lots.length) {
    elements.biddingLotsGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; padding: 60px 20px;">
        <div style="font-size: 3rem; margin-bottom: 12px;">🌾</div>
        <h3>${t("no_records", lang)}</h3>
        <p style="color: var(--text-muted); margin-top: 6px;">No bulk produce lots found matching your filter.</p>
      </div>
    `;
    return;
  }

  let html = "";
  lots.forEach(lot => {
    const icon = CROP_ICONS[lot.commodity] || "📦";
    const cropName = getCommodityName(lot.commodity, lang);
    const isOpen = lot.status === "OPEN";
    const bidCount = lot.bid_count || (lot.bids ? lot.bids.length : 0);
    const statusText = isOpen ? t("status_open", lang) : t("status_awarded", lang);
    const statusClass = isOpen ? "status-open" : "status-awarded";

    let winnerHtml = "";
    if (!isOpen && lot.awarded_bid) {
      winnerHtml = `
        <div class="winner-strip">
          <span class="winner-title">${t("winner_title", lang)}</span>
          <span class="winner-name">🏢 ${escapeHtml(lot.awarded_bid.company_name)}</span>
          <span class="winner-price">₹${lot.awarded_bid.bid_price.toLocaleString("en-IN")} / Quintal • Total: ₹${lot.awarded_bid.total_amount.toLocaleString("en-IN")}</span>
        </div>
      `;
    }

    let actionButtonsHtml = "";
    if (isOpen) {
      actionButtonsHtml = `
        <div class="auction-actions">
          <button class="btn-bid-action" onclick="openCorporateBidModal('${lot.id}')">
            <span>🔒</span> <span>${t("btn_bid_action", lang)}</span>
          </button>
          <button class="btn-award-action" onclick="handleAwardLot('${lot.id}')" title="Award produce to current highest sealed bidder">
            <span>🏆</span> <span>${t("btn_award_action", lang)}</span>
          </button>
        </div>
      `;
    } else {
      actionButtonsHtml = `
        <div class="auction-actions">
          <button class="btn-bid-action" style="background:#64748b; cursor:default;" disabled>
            <span>✓</span> <span>Auction Concluded & Delivered</span>
          </button>
        </div>
      `;
    }

    html += `
      <div class="auction-card ${isOpen ? '' : 'awarded'}">
        <div>
          <div class="auction-header">
            <div class="fpo-identity">
              <span class="fpo-name-title">👨‍🌾 ${escapeHtml(lot.fpo_name)}</span>
              <span class="fpo-loc">📍 ${escapeHtml(lot.district)}, ${escapeHtml(lot.state)}</span>
            </div>
            <span class="lot-status-pill ${statusClass}">${statusText}</span>
          </div>

          <div class="commodity-lot-box" style="margin-top: 14px;">
            <div class="com-lot-icon">${icon}</div>
            <div class="com-lot-meta">
              <span class="com-lot-name">${cropName}</span>
              <span class="com-lot-variety">${escapeHtml(lot.variety)}</span>
            </div>
          </div>

          <div class="lot-specs-row" style="margin-top: 14px;">
            <div class="lot-spec-item">
              <span class="spec-label">${t("label_quantity", lang).replace('*','')}</span>
              <span class="spec-val">${lot.quantity.toLocaleString("en-IN")} ${lot.unit || 'Quintals'}</span>
            </div>
            <div class="lot-spec-item">
              <span class="spec-label">${t("label_min_price", lang).replace('*','')}</span>
              <span class="spec-val" style="color: #166534;">₹${lot.min_price.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div class="blind-status-strip" style="margin-top: 14px;">
            <span>🔒 ${t("sealed_bids_count", lang).replace("{count}", bidCount)}</span>
            <span style="font-size: 0.76rem; color: #047857;">Sealed Blind Bids</span>
          </div>

          ${winnerHtml}
        </div>

        <div style="margin-top: 8px;">
          ${actionButtonsHtml}
        </div>
      </div>
    `;
  });

  elements.biddingLotsGrid.innerHTML = html;
}

// Modal: Open FPO Host Produce
function openHostProduceModal() {
  if (!elements.fpoHostModal) return;
  if (elements.fpoHostForm) elements.fpoHostForm.reset();
  if (elements.hostFormStatus) elements.hostFormStatus.innerHTML = "";
  elements.fpoHostModal.classList.add("open");
}

function closeHostProduceModal() {
  if (elements.fpoHostModal) elements.fpoHostModal.classList.remove("open");
}

// Handle FPO Host Produce Submission
async function handleHostProduceSubmit(e) {
  if (e) e.preventDefault();
  const fpoName = document.getElementById("hostFpoName").value.trim();
  const fpoReg = document.getElementById("hostFpoReg").value.trim();
  const commodity = document.getElementById("hostCommodity").value;
  const variety = document.getElementById("hostVariety").value.trim();
  const stateVal = document.getElementById("hostState").value.trim();
  const district = document.getElementById("hostDistrict").value.trim();
  const quantity = parseInt(document.getElementById("hostQuantity").value);
  const minPrice = parseInt(document.getElementById("hostMinPrice").value);
  const closingDays = parseInt(document.getElementById("hostClosingDays").value) || 3;

  if (!fpoName || !commodity || !variety || !stateVal || !district || !quantity || !minPrice) {
    if (elements.hostFormStatus) {
      elements.hostFormStatus.innerHTML = `<span style="color:#dc2626;">⚠️ Please fill in all required fields marked with *.</span>`;
    }
    return;
  }

  if (quantity <= 0 || minPrice <= 0) {
    if (elements.hostFormStatus) {
      elements.hostFormStatus.innerHTML = `<span style="color:#dc2626;">⚠️ Quantity and Minimum Reserve Price must be greater than 0.</span>`;
    }
    return;
  }

  elements.btnSubmitHostProduce.disabled = true;
  elements.hostFormStatus.innerHTML = `<span style="color:#0284c7;">Publishing lot to B2B Auction Board...</span>`;

  try {
    const res = await fetch("/api/bidding/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fpo_name: fpoName,
        registration_no: fpoReg,
        commodity: commodity,
        variety: variety,
        state: stateVal,
        district: district,
        location: district,
        quantity: quantity,
        unit: "Quintals",
        min_price: minPrice,
        closing_days: closingDays
      })
    });

    const data = await res.json();
    if (data.success) {
      elements.hostFormStatus.innerHTML = `<span style="color:#16a34a;">✓ ${data.message}</span>`;
      setTimeout(() => {
        closeHostProduceModal();
        elements.btnSubmitHostProduce.disabled = false;
        loadBiddingLots();
      }, 1000);
    } else {
      elements.hostFormStatus.innerHTML = `<span style="color:#dc2626;">Error: ${data.error || 'Failed to publish lot'}</span>`;
      elements.btnSubmitHostProduce.disabled = false;
    }
  } catch (err) {
    elements.hostFormStatus.innerHTML = `<span style="color:#dc2626;">Server error. Could not publish lot.</span>`;
    elements.btnSubmitHostProduce.disabled = false;
  }
}

// Modal: Open Corporate Blind Bid
window.openCorporateBidModal = function(lotId) {
  const lot = state.biddingLots.find(l => l.id === lotId);
  if (!lot) return;

  const lang = state.lang;
  const cropName = getCommodityName(lot.commodity, lang);

  if (elements.corporateBidForm) elements.corporateBidForm.reset();
  if (elements.bidFormStatus) elements.bidFormStatus.innerHTML = "";
  if (elements.bidTargetLotId) elements.bidTargetLotId.value = lot.id;
  if (elements.bidPriceInput) {
    elements.bidPriceInput.min = lot.min_price;
    elements.bidPriceInput.placeholder = `Minimum ₹${lot.min_price.toLocaleString("en-IN")}`;
  }
  if (elements.bidMinPriceGuide) {
    elements.bidMinPriceGuide.textContent = `Reserve Min: ₹${lot.min_price.toLocaleString("en-IN")}/q`;
  }
  if (elements.bidTotalContractVal) elements.bidTotalContractVal.textContent = "₹0";

  if (elements.bidLotSummary) {
    elements.bidLotSummary.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong style="color:var(--text-dark); font-size:1.05rem;">${cropName} (${escapeHtml(lot.variety)})</strong>
        <span class="badge-tag tag-success" style="font-size:0.75rem;">Lot: ${lot.id}</span>
      </div>
      <div style="font-size:0.85rem; color:#475569; margin-top:4px;">
        FPO: <strong>${escapeHtml(lot.fpo_name)}</strong> • ${escapeHtml(lot.district)}, ${escapeHtml(lot.state)}
      </div>
      <div style="font-size:0.85rem; color:#166534; font-weight:700; margin-top:4px;">
        Quantity: ${lot.quantity.toLocaleString("en-IN")} Quintals • Minimum Base Rate: ₹${lot.min_price.toLocaleString("en-IN")}/Quintal
      </div>
    `;
  }

  if (elements.corporateBidModal) elements.corporateBidModal.classList.add("open");
};

function closeCorporateBidModal() {
  if (elements.corporateBidModal) elements.corporateBidModal.classList.remove("open");
}

// Real-time contract calculation in modal
function updateBidContractPreview() {
  const lotId = elements.bidTargetLotId.value;
  const lot = state.biddingLots.find(l => l.id === lotId);
  if (!lot) return;

  const bidPrice = parseFloat(elements.bidPriceInput.value) || 0;
  const totalVal = Math.round(bidPrice * lot.quantity);
  if (elements.bidTotalContractVal) {
    elements.bidTotalContractVal.textContent = `₹${totalVal.toLocaleString("en-IN")}`;
  }
}

// Submit Corporate Blind Bid
async function handleCorporateBidSubmit(e) {
  if (e) e.preventDefault();
  const lotId = elements.bidTargetLotId.value;
  const lot = state.biddingLots.find(l => l.id === lotId);
  if (!lot) return;

  const companyName = document.getElementById("bidCompanyName").value.trim();
  const buyerName = document.getElementById("bidBuyerName").value.trim();
  const gstin = document.getElementById("bidGstin").value.trim();
  const bidPrice = parseInt(elements.bidPriceInput.value);

  if (!companyName || !buyerName || !gstin || !bidPrice) {
    if (elements.bidFormStatus) {
      elements.bidFormStatus.innerHTML = `<span style="color:#dc2626;">⚠️ Please fill in all corporate fields and bid price.</span>`;
    }
    return;
  }

  if (bidPrice < lot.min_price) {
    if (elements.bidFormStatus) {
      elements.bidFormStatus.innerHTML = `<span style="color:#dc2626;">⚠️ Blind bid cannot be lower than the FPO reserve price (₹${lot.min_price.toLocaleString("en-IN")}/q).</span>`;
    }
    return;
  }

  elements.btnSubmitBlindBid.disabled = true;
  elements.bidFormStatus.innerHTML = `<span style="color:#0284c7;">Submitting sealed confidential bid...</span>`;

  try {
    const res = await fetch("/api/bidding/bid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lot_id: lotId,
        company_name: companyName,
        buyer_name: buyerName,
        gstin: gstin,
        bid_price: bidPrice
      })
    });

    const data = await res.json();
    if (data.success) {
      elements.bidFormStatus.innerHTML = `<span style="color:#16a34a;">✓ ${data.message}</span>`;
      setTimeout(() => {
        closeCorporateBidModal();
        elements.btnSubmitBlindBid.disabled = false;
        loadBiddingLots();
      }, 1200);
    } else {
      elements.bidFormStatus.innerHTML = `<span style="color:#dc2626;">Error: ${data.error || 'Failed to submit bid'}</span>`;
      elements.btnSubmitBlindBid.disabled = false;
    }
  } catch (err) {
    elements.bidFormStatus.innerHTML = `<span style="color:#dc2626;">Error submitting bid to server.</span>`;
    elements.btnSubmitBlindBid.disabled = false;
  }
}

// Award Lot to Highest Bidder
window.handleAwardLot = async function(lotId) {
  const lot = state.biddingLots.find(l => l.id === lotId);
  if (!lot) return;

  const bidCount = lot.bid_count || (lot.bids ? lot.bids.length : 0);
  if (bidCount === 0) {
    alert("Cannot award lot: No corporate blind bids have been placed on this lot yet.");
    return;
  }

  const confirmAward = confirm(`Resolve Auction for ${lot.fpo_name} (${lot.commodity})?\n\nThe engine will unseal all blind bids and award the harvest to the highest corporate bidder.`);
  if (!confirmAward) return;

  try {
    const res = await fetch("/api/bidding/award", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lot_id: lotId })
    });

    const data = await res.json();
    if (data.success) {
      alert(`🎉 AUCTION AWARDED!\n\nWinner: ${data.lot.awarded_bid.company_name}\nWinning Price: ₹${data.lot.awarded_bid.bid_price.toLocaleString("en-IN")}/Quintal\nTotal Contract Payout: ₹${data.lot.awarded_bid.total_amount.toLocaleString("en-IN")}\n\nDirect settlement contract generated with zero middleman deductions!`);
      loadBiddingLots();
    } else {
      alert(`Error awarding lot: ${data.error || 'Failed'}`);
    }
  } catch (err) {
    alert("Failed to connect to bidding engine.");
  }
};

// ================================================================
// Illiterate Farmer Voice Assistance & Call Back Handlers
// ================================================================
const callbackSpokenGuides = {
  te: "నమస్కారం అన్నదాత! మీకు చదవడం, రాయడం రాకపోయినా ఏమీ ఫర్వాలేదు. మీ 10 అంకెల ఫోన్ నంబర్ నమోదు చేసి, కాల్ రిక్వెస్ట్ బటన్ నొక్కండి. మా అగ్రిలింక్ కృషి మిత్ర అధికారి 2 నిమిషాల్లో మీకు ఫోన్ చేసి, మీ పంట మార్కెట్ ధరలు ఎలా చూడాలో తెలుగులో వివరంగా నేర్పిస్తారు.",
  hi: "नमस्ते किसान भाई! अगर आपको पढ़ना या लिखना नहीं आता तो कोई चिंता नहीं। अपना 10 अंकों का मोबाइल नंबर दर्ज करें और कॉल बटन दबाएं। हमारे एग्रीलिंक कृषि मित्र आपको 2 मिनट में फोन करके बोलकर समझाएंगे कि अपनी फसल का मंडी भाव कैसे देखना है।",
  ta: "வணக்கம் விவசாயி அவர்களே! உங்களுக்கு படிக்கத் தெரியாவிட்டாலும் கவலை வேண்டாம். உங்கள் 10 இலக்க மொபைல் எண்ணை உள்ளிட்டு அழைப்பு பொத்தானை அழுத்தவும். எங்கள் விவசாய ஆலோசகர் 2 நிமிடங்களில் உங்களை அழைத்து உங்கள் பயிருக்கான சந்தை விலையை எவ்வாறு அறிவது என்று தமிழில் குரல் மூலம் கற்றுக்கொடுப்பார்.",
  mr: "नमस्कार शेतकरी मित्रांनो! तुम्हाला वाचता येत नसेल तरी काही काळजी करू नका. तुमचा १० अंकी मोबाईल नंबर टाका आणि कॉल बटण दाबा. आमचे ॲग्रीलिंक कृषी मित्र तुम्हाला २ मिनिटांत फोन करून तुमच्या पिकाचे बाजारभाव कसे पाहायचे ते मराठीत बोलून शिकवतील.",
  pa: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ! ਜੇਕਰ ਤੁਹਾਨੂੰ ਪੜ੍ਹਨਾ-ਲਿਖਣਾ ਨਹੀਂ ਆਉਂਦਾ ਤਾਂ ਕੋਈ ਫ਼ਿਕਰ ਨਾ ਕਰੋ। ਆਪਣਾ 10 ਅੰਕਾਂ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ ਦਰਜ ਕਰੋ ਅਤੇ ਕਾਲ ਬਟਨ ਦਬਾਓ। ਸਾਡੇ ਕ੍ਰਿਸ਼ੀ ਮਿੱਤਰ ਤੁਹਾਨੂੰ 2 ਮਿੰਟਾਂ ਵਿੱਚ ਫ਼ੋਨ ਕਰਕੇ ਬੋਲ ਕੇ ਮੰਡੀ ਦੇ ਭਾਅ ਵੇਖਣਾ ਸਿਖਾਉਣਗੇ।",
  en: "Hello Farmer! Even if you cannot read or write, do not worry. Enter your 10-digit mobile number and click request call. Our AgriLink Krishi Mitra voice assistant will call you within 2 minutes to explain everything over phone in your language."
};

const callbackSpokenConfirmations = {
  te: "ధన్యవాదాలు అన్నదాత! మీ కాల్ అభ్యర్థన నమోదైంది. మా అగ్రిలింక్ కృషి మిత్ర మీకు 2 నిమిషాల్లో ఫోన్ చేస్తున్నారు. దయచేసి మీ ఫోన్ దగ్గర ఉంచుకోండి.",
  hi: "धन्यवाद किसान भाई! आपका कॉल अनुरोध दर्ज हो गया है। हमारे कृषि मित्र 2 मिनट में आपको फोन कर रहे हैं। कृपया अपना फोन पास रखें।",
  ta: "நன்றி விவசாயி அவர்களே! உங்கள் அழைப்பு கோரிக்கை பதிவாகிவிட்டது. எங்கள் விவசாய ஆலோசகர் 2 நிமிடங்களில் உங்களை அழைக்கிறார். கைபேசியை அருகில் வைத்திருக்கவும்.",
  mr: "धन्यवाद शेतकरी बांधवांनो! तुमची कॉल विनंती नोंदवली गेली आहे. आमचे कृषी मित्र २ मिनिटांत तुम्हाला फोन करत आहेत. कृपया मोबाईल जवळ ठेवा.",
  pa: "ਧੰਨਵਾਦ ਕਿਸਾਨ ਵੀਰੋ! ਤੁਹਾਡੀ ਕਾਲ ਦੀ ਬੇਨਤੀ ਦਰਜ ਕਰ ਲਈ ਗਈ ਹੈ। ਸਾਡੇ ਕ੍ਰਿਸ਼ੀ ਮਿੱਤਰ 2 ਮਿੰਟਾਂ ਵਿੱਚ ਤੁਹਾਨੂੰ ਕਾਲ ਕਰ ਰਹੇ ਹਨ। ਕਿਰਪਾ ਕਰਕੇ ਫ਼ੋਨ ਕੋਲ ਰੱਖੋ।",
  en: "Thank you Farmer! Your call back request is registered. Our AgriLink Krishi Mitra is calling your number within 2 minutes. Please keep your phone nearby."
};

window.speakAudioCallbackGuide = function() {
  const langSelect = document.getElementById("farmerLangSelect");
  const selectedLang = langSelect ? langSelect.value : state.lang;
  const guideText = callbackSpokenGuides[selectedLang] || callbackSpokenGuides["en"];

  if (!("speechSynthesis" in window)) {
    alert("Voice audio playback is not supported on this browser.");
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(guideText);
  utterance.lang = langCodeMap[selectedLang] || "hi-IN";
  utterance.rate = 0.88;

  const voices = window.speechSynthesis.getVoices();
  const regionalVoice = voices.find(v => v.lang.startsWith(utterance.lang) || v.lang.includes(selectedLang));
  if (regionalVoice) utterance.voice = regionalVoice;

  window.speechSynthesis.speak(utterance);
};

window.requestFarmerCallback = function() {
  const phoneInput = document.getElementById("farmerPhoneInput");
  const langSelect = document.getElementById("farmerLangSelect");
  const toastEl = document.getElementById("callbackToast");

  const phone = phoneInput ? phoneInput.value.trim() : "";
  const selectedLang = langSelect ? langSelect.value : state.lang;

  if (!phone || phone.length < 10 || !/^\d{10}$/.test(phone)) {
    if (toastEl) {
      toastEl.style.display = "block";
      toastEl.style.background = "rgba(153, 27, 27, 0.95)";
      toastEl.style.borderColor = "#f87171";
      toastEl.innerHTML = "⚠️ <strong>దయచేసి మీ 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి</strong> / Please enter a valid 10-digit mobile number.";
    }
    return;
  }

  // Success Confirmation
  if (toastEl) {
    toastEl.style.display = "block";
    toastEl.style.background = "rgba(20, 83, 45, 0.96)";
    toastEl.style.borderColor = "#4ade80";
    toastEl.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;">
        <span style="font-size:1.4rem;">📲</span>
        <strong style="color:#fef08a; font-size:1.05rem;">Call Requested Successfully! (కాల్ అభ్యర్థన విజయవంతం)</strong>
      </div>
      <p style="margin:0; font-size:0.92rem; color:#f0fdf4;">
        Our <strong>AgriLink Krishi Mitra</strong> is dialing <strong>+91 ${escapeHtml(phone)}</strong> in <strong>${langSelect.options[langSelect.selectedIndex].text}</strong>. Please keep your phone nearby! An assistant will guide you step-by-step through checking your mandi rates.
      </p>
    `;
  }

  // Trigger Spoken Confirmation
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const confText = callbackSpokenConfirmations[selectedLang] || callbackSpokenConfirmations["en"];
    const utterance = new SpeechSynthesisUtterance(confText);
    utterance.lang = langCodeMap[selectedLang] || "hi-IN";
    utterance.rate = 0.88;
    const voices = window.speechSynthesis.getVoices();
    const regionalVoice = voices.find(v => v.lang.startsWith(utterance.lang) || v.lang.includes(selectedLang));
    if (regionalVoice) utterance.voice = regionalVoice;
    window.speechSynthesis.speak(utterance);
  }
};

// Helper: Escape HTML to prevent injection
function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[m]);
}

// THEME CONTROLLER (Turn ON / OFF Green Theme with Very Small Top-Right Switch)
function initTheme() {
  const savedTheme = (typeof localStorage !== "undefined" && localStorage.getItem("agrilink_theme")) || "default";
  setAppTheme(savedTheme);
}

function toggleGreenTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme") || "default";
  const newTheme = (currentTheme === "green") ? "default" : "green";
  setAppTheme(newTheme);
}

function setAppTheme(theme) {
  const isGreen = (theme === "green");
  const toggleBtns = document.querySelectorAll(".top-corner-theme-switch");
  const statusTop = document.getElementById("miniStatusTextTop");
  const statusHeader = document.getElementById("miniStatusText");
  const btnGreen = document.getElementById("btnThemeGreen");
  const btnDefault = document.getElementById("btnThemeDefault");

  if (isGreen) {
    document.documentElement.setAttribute("data-theme", "green");
    document.body.classList.add("theme-green");
    toggleBtns.forEach(btn => {
      btn.classList.add("is-on");
      btn.setAttribute("aria-checked", "true");
    });
    if (statusTop) statusTop.textContent = "ON";
    if (statusHeader) statusHeader.textContent = "ON";
    if (btnGreen) btnGreen.classList.add("active");
    if (btnDefault) btnDefault.classList.remove("active");
    localStorage.setItem("agrilink_theme", "green");
  } else {
    document.documentElement.setAttribute("data-theme", "default");
    document.body.classList.remove("theme-green");
    toggleBtns.forEach(btn => {
      btn.classList.remove("is-on");
      btn.setAttribute("aria-checked", "false");
    });
    if (statusTop) statusTop.textContent = "OFF";
    if (statusHeader) statusHeader.textContent = "OFF";
    if (btnGreen) btnGreen.classList.remove("active");
    if (btnDefault) btnDefault.classList.add("active");
    localStorage.setItem("agrilink_theme", "default");
  }
}
window.toggleGreenTheme = toggleGreenTheme;
window.setAppTheme = setAppTheme;
window.initTheme = initTheme;

// Immediately apply theme from storage to avoid flash
initTheme();

// Start
document.addEventListener("DOMContentLoaded", init);

