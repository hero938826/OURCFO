const STORAGE_KEY = "home-wealth-dashboard-v2";
const LEGACY_STORAGE_KEY = "home-wealth-dashboard-v1";
const MARKET_CACHE_KEY = "home-wealth-market-cache-v1";
const REMOTE_STATE_ENDPOINT = "/api/state";
const EXCLUDED_ACCOUNT = "메리츠W";
const FIXED_EXPENSE_TYPE = "지출(고정)";
const VARIABLE_EXPENSE_TYPE = "지출(변동)";
const VARIABLE_CHART_EXCLUDED_CATEGORIES = ["예비비"];

const COLORS = ["#8FB8F4", "#86D8C0", "#F5A3AC", "#F3C681", "#B8A7EB", "#AAB8C7", "#8ED6DF"];
const ACCESS_PIN = "1056";

const MARKET_CONFIG = [
  { symbol: "^IXIC", label: "나스닥", kind: "index" },
  { symbol: "^DJI", label: "다우", kind: "index" },
  { symbol: "^GSPC", label: "S&P 500", kind: "index" },
  { symbol: "KRW=X", label: "달러/원", kind: "krw" },
  { symbol: "EURKRW=X", label: "유로/원", kind: "krw" },
  { symbol: "JPYKRW=X", label: "엔/원 (100엔)", kind: "jpy" }
];

const WATCH_SYMBOLS = ["QQQ", "SPY", "QQQM", "SPYM", "QLD", "TQQQ"];
const LEDGER_PAGE_SIZE = 30;
const STOCK_PAGE_SIZE = 15;
const ASSET_PAGE_SIZE = 30;
const INCLUDED_ACCOUNTS = ["카카오연금", "미래에셋ISA", "메리츠M"];
const STOCK_CASH_CONFIG = [
  { account: "메리츠M", currency: "USD", excluded: false },
  { account: "메리츠W", currency: "USD", excluded: true },
  { account: "카카오연금", currency: "KRW", excluded: false },
  { account: "미래에셋ISA", currency: "KRW", excluded: false }
];
const DEFAULT_INPUT_OPTIONS = {
  ledgerCategories: ["H급여", "M급여", "H보너스", "M보너스", "이자", "관리비", "가스비", "보험료", "통신비", "자동차 할부", "식비", "준원돌봄", "생활용품", "예/적금", "연금저축", "ISA(경주)", "해외직투", "예비비", "기타"],
  ledgerPayments: ["-", "삼성M", "국민M", "생활비계좌", "현대H", "비씨M", "비씨H", "신한M", "안양페이M", "안양페이H", "토스적금", "카카오연금M", "카카오연금H", "미래에셋M", "메리츠M", "메리츠W", "네이버CMA"],
  stockAccounts: ["카카오연금", "미래에셋ISA", "메리츠M", "메리츠W"],
  assetCategories: [
    { label: "부동산", type: "realEstate" },
    { label: "금융자산", type: "financial" },
    { label: "차량", type: "vehicle" },
    { label: "부채", type: "debt" }
  ]
};

const DEFAULT_UI_LABELS = {
  tabHome: "홈",
  tabLedger: "가계부",
  tabStocks: "주식",
  tabAssets: "자산현황",
  homeGoalTitle: "Goal Progress",
  homeCashTitle: "Cashflow Snapshot",
  homeMarketsTitle: "Market Overview",
  homeWatchTitle: "Watchlist Prices",
  ledgerPageTitle: "가계부",
  ledgerRecentTitle: "최근 6개월 수입·지출",
  ledgerYtdTitle: "당해 연도 누적",
  ledgerFixedTitle: "고정지출 분류",
  ledgerVariableTitle: "변동지출 분류",
  ledgerSavingsTitle: "수입 대비 저축",
  stocksPageTitle: "주식 포트폴리오",
  stockSectorTitle: "섹터별 비중",
  stockAccountTitle: "계좌별 종목 비중",
  stockTreemapTitle: "보유 종목 당일 등락",
  stockGrowthTitle: "주식 자산가치 월 누적",
  stockSeparateGrowthTitle: "메리츠W 월 누적",
  stockSeparateTitle: "메리츠W 계좌",
  assetsPageTitle: "자산현황",
  assetAllocationTitle: "자산 비중",
  assetHistoryTitle: "자산 추이"
};

const UI_LABEL_NAMES = {
  tabHome: "홈 탭",
  tabLedger: "가계부 탭",
  tabStocks: "주식 탭",
  tabAssets: "자산현황 탭",
  homeGoalTitle: "Home · Goal Progress",
  homeCashTitle: "Home · Cashflow",
  homeMarketsTitle: "Home · Markets",
  homeWatchTitle: "Home · Watchlist",
  ledgerPageTitle: "가계부 페이지",
  ledgerRecentTitle: "가계부 · 최근 6개월",
  ledgerYtdTitle: "가계부 · 연간 누적",
  ledgerFixedTitle: "가계부 · 고정지출",
  ledgerVariableTitle: "가계부 · 변동지출",
  ledgerSavingsTitle: "가계부 · 저축률",
  stocksPageTitle: "주식 페이지",
  stockSectorTitle: "주식 · 섹터",
  stockAccountTitle: "주식 · 계좌",
  stockTreemapTitle: "주식 · 당일 등락",
  stockGrowthTitle: "주식 · 월 누적",
  stockSeparateGrowthTitle: "주식 · 메리츠W 월 누적",
  stockSeparateTitle: "주식 · 별도 계좌",
  assetsPageTitle: "자산현황 페이지",
  assetAllocationTitle: "자산 · 비중",
  assetHistoryTitle: "자산 · 추이"
};

const DEFAULT_LAYOUT_ORDERS = {
  homeCharts: ["markets", "watch"],
  ledgerCharts: ["recent6", "ytd", "fixed", "variable", "savings"],
  stockCharts: ["sector", "account"],
  assetCharts: ["allocation", "history"]
};

const DEFAULT_V2_GOALS = {
  financialAssets: { title: "Financial Assets", target: 500000000, startMonth: todayMonth(), endMonth: "2035-12" },
  netWorth: { title: "Net Worth", target: 1000000000, startMonth: todayMonth(), endMonth: "2040-12" },
  meritzW: { title: "Junwon Account", target: 100000000, startMonth: todayMonth(), endMonth: "2040-12" }
};

const LAYOUT_GROUP_NAMES = {
  homeCharts: "홈 차트",
  ledgerCharts: "가계부 차트",
  stockCharts: "주식 차트",
  assetCharts: "자산현황 차트"
};

const LAYOUT_ITEM_LABEL_KEYS = {
  markets: "homeMarketsTitle",
  watch: "homeWatchTitle",
  recent6: "ledgerRecentTitle",
  ytd: "ledgerYtdTitle",
  fixed: "ledgerFixedTitle",
  variable: "ledgerVariableTitle",
  savings: "ledgerSavingsTitle",
  sector: "stockSectorTitle",
  account: "stockAccountTitle",
  allocation: "assetAllocationTitle",
  history: "assetHistoryTitle"
};

const sampleData = {
  ledgerEntries: [],
  stockHoldings: [],
  assetItems: [],
  financialGoal: 0,
  financialGoalStartMonth: todayMonth(),
  financialGoalEndMonth: todayMonth(),
  variableBudgets: {},
  stockTransactions: [],
  stockCashBalances: {},
  stockValueHistory: {},
  monthlyClosings: {},
  inputOptions: structuredClone(DEFAULT_INPUT_OPTIONS),
  excludedStockAccount: EXCLUDED_ACCOUNT,
  editorLocks: { ledger: true, stocks: true, assets: true },
  uiConfig: {
    layoutLocked: true,
    labels: {},
    orders: structuredClone(DEFAULT_LAYOUT_ORDERS),
    meritzScenario: 0.1,
    dismissedAlerts: [],
    v2Goals: structuredClone(DEFAULT_V2_GOALS)
  },
  theme: "light"
};

let state = loadState();
let marketQuotes = loadMarketCache();
let activeView = location.hash.replace("#", "") || "home";
let currentLedgerFilter = "all";
let selectedLedgerMonth = latestLedgerMonth();
let stockSort = "added";
let historyMode = "monthly";
let ledgerPage = 1;
let stockPage = 1;
let assetPage = 1;
let toastTimer = null;
let selectedLedgerIds = new Set();
let optionManagerScope = null;
let optionManagerDraft = [];
let remoteStateEnabled = false;
let remoteSaveTimer = null;
let remoteSaveInFlight = false;

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return normalizeState(JSON.parse(stored));
    } catch {
      return normalizeState(structuredClone(sampleData));
    }
  }

  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (legacy) {
    try {
      const old = JSON.parse(legacy);
      const month = new Date().toISOString().slice(0, 7);
      const migratedAssets = [
        ...(old.assets || []).map((item) => ({
          id: uid("asset"),
          month,
          category: item.category === "부동산" ? "부동산" : "금융자산",
          name: item.name || "이전 자산",
          amount: Number(item.amount) || 0
        })),
        ...(old.debts || []).map((item) => ({
          id: uid("debt"),
          month,
          category: "부채",
          name: item.name || "이전 부채",
          amount: Number(item.amount) || 0
        }))
      ];

      return normalizeState({
        ...sampleData,
        ledgerEntries: old.ledgerEntries || [],
        assetItems: migratedAssets.length ? migratedAssets : sampleData.assetItems
      });
    } catch {
    return normalizeState(structuredClone(sampleData));
    }
  }

  return normalizeState(structuredClone(sampleData));
}

function normalizeState(data) {
  return {
    ledgerEntries: (Array.isArray(data.ledgerEntries) ? data.ledgerEntries : []).map((item) => ({
      ...item,
      id: item.id || uid("ledger"),
      amount: Number(item.amount) || 0
    })),
    stockHoldings: Array.isArray(data.stockHoldings)
      ? data.stockHoldings.map((item) => ({
          id: item.id || uid("stock"),
          ticker: String(item.ticker || "").toUpperCase(),
          country: item.country === "KR" ? "KR" : "US",
          quantity: Number(item.quantity) || 0,
          purchasePrice: Number(item.purchasePrice) || 0,
          account: item.account || "메리츠M",
          createdAt: Number(item.createdAt) || Date.now()
        }))
      : structuredClone(sampleData.stockHoldings),
    assetItems: Array.isArray(data.assetItems)
      ? data.assetItems.map((item) => ({
          id: item.id || uid("asset"),
          month: item.month || todayMonth(),
          category: String(item.category || "금융자산"),
          name: item.name || "기타",
          amount: Number(item.amount) || 0
        }))
      : structuredClone(sampleData.assetItems),
    financialGoal: Number(data.financialGoal) || sampleData.financialGoal,
    financialGoalStartMonth: data.financialGoalStartMonth || sampleData.financialGoalStartMonth,
    financialGoalEndMonth: data.financialGoalEndMonth || sampleData.financialGoalEndMonth,
    variableBudgets: Object.fromEntries(
      Object.entries(data.variableBudgets || sampleData.variableBudgets).map(([month, amount]) => [month, Number(amount) || 0])
    ),
    stockTransactions: (Array.isArray(data.stockTransactions) ? data.stockTransactions : []).map((item) => ({
      id: item.id || uid("trade"),
      date: item.date || todayDate(),
      type: item.type === "sell" ? "sell" : "buy",
      ticker: String(item.ticker || "").toUpperCase(),
      country: item.country === "KR" ? "KR" : "US",
      account: item.account || "메리츠M",
      quantity: Number(item.quantity) || 0,
      price: Number(item.price) || 0,
      fxRate: Number(item.fxRate) || 1,
      amountKrw: Number(item.amountKrw) || 0,
      costBasisKrw: Number(item.costBasisKrw) || 0,
      realizedProfitKrw: Number(item.realizedProfitKrw) || 0,
      memo: String(item.memo || ""),
      createdAt: Number(item.createdAt) || Date.now()
    })),
    stockCashBalances: normalizeStockCashBalances(data.stockCashBalances),
    stockValueHistory: Object.fromEntries(
      Object.entries(data.stockValueHistory || {}).map(([month, values]) => [
        month,
        { included: Number(values?.included) || 0, excluded: Number(values?.excluded) || 0 }
      ])
    ),
    monthlyClosings: Object.fromEntries(
      Object.entries(data.monthlyClosings || {}).map(([month, item]) => [
        month,
        {
          month,
          netWorth: Number(item?.netWorth) || 0,
          savingRate: Number(item?.savingRate) || 0,
          budgetBurnRate: Number(item?.budgetBurnRate) || 0,
          investmentPrincipalKrw: Number(item?.investmentPrincipalKrw) || 0,
          investmentValueKrw: Number(item?.investmentValueKrw) || 0,
          investmentProfitKrw: Number(item?.investmentProfitKrw) || 0,
          investmentReturnRate: Number(item?.investmentReturnRate) || 0,
          closedAt: item?.closedAt || new Date().toISOString(),
          updatedAt: item?.updatedAt || item?.closedAt || new Date().toISOString()
        }
      ])
    ),
    inputOptions: {
      ledgerCategories: uniqueOptions([
        ...(data.inputOptions?.ledgerCategories || [
          ...DEFAULT_INPUT_OPTIONS.ledgerCategories,
          ...(data.ledgerEntries || []).map((item) => item.category)
        ])
      ]),
      ledgerPayments: uniqueOptions([
        ...(data.inputOptions?.ledgerPayments || [
          ...DEFAULT_INPUT_OPTIONS.ledgerPayments,
          ...(data.ledgerEntries || []).map((item) => item.payment)
        ])
      ]),
      stockAccounts: uniqueOptions([
        ...(data.inputOptions?.stockAccounts || [
          ...DEFAULT_INPUT_OPTIONS.stockAccounts,
          ...(data.stockHoldings || []).map((item) => item.account),
          ...(data.stockTransactions || []).map((item) => item.account)
        ])
      ]),
      assetCategories: normalizeAssetCategories(data.inputOptions?.assetCategories, data.inputOptions?.assetCategories ? [] : data.assetItems)
    },
    excludedStockAccount: String(data.excludedStockAccount || EXCLUDED_ACCOUNT),
    editorLocks: {
      ledger: data.editorLocks?.ledger !== false,
      stocks: data.editorLocks?.stocks !== false,
      assets: data.editorLocks?.assets !== false
    },
    uiConfig: {
      layoutLocked: data.uiConfig?.layoutLocked !== false,
      labels: { ...(data.uiConfig?.labels || {}) },
      meritzScenario: Number(data.uiConfig?.meritzScenario) || 0.1,
      dismissedAlerts: Array.isArray(data.uiConfig?.dismissedAlerts) ? data.uiConfig.dismissedAlerts.map(String) : [],
      v2Goals: normalizeV2Goals({
        ...(data.uiConfig?.v2Goals || {}),
        financialGoal: data.financialGoal,
        financialGoalStartMonth: data.financialGoalStartMonth,
        financialGoalEndMonth: data.financialGoalEndMonth
      }),
      orders: Object.fromEntries(
        Object.entries(DEFAULT_LAYOUT_ORDERS).map(([group, defaults]) => {
          const saved = Array.isArray(data.uiConfig?.orders?.[group]) ? data.uiConfig.orders[group] : [];
          return [group, [...saved.filter((id) => defaults.includes(id)), ...defaults.filter((id) => !saved.includes(id))]];
        })
      )
    },
    theme: data.theme === "dark" ? "dark" : "light"
  };
}

function uniqueOptions(values) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
}

function normalizeV2Goals(saved = {}) {
  const legacy = {
    financialAssets: {
      target: Number(saved.financialAssets?.target ?? saved.financialGoal ?? 0) || DEFAULT_V2_GOALS.financialAssets.target,
      startMonth: saved.financialAssets?.startMonth || saved.financialGoalStartMonth || DEFAULT_V2_GOALS.financialAssets.startMonth,
      endMonth: saved.financialAssets?.endMonth || saved.financialGoalEndMonth || DEFAULT_V2_GOALS.financialAssets.endMonth
    },
    netWorth: saved.netWorth || {},
    meritzW: saved.meritzW || {}
  };

  return Object.fromEntries(
    Object.entries(DEFAULT_V2_GOALS).map(([key, defaults]) => {
      const input = legacy[key] || {};
      return [
        key,
        {
          title: defaults.title,
          target: Number(input.target) || defaults.target,
          startMonth: /^\d{4}-\d{2}$/.test(String(input.startMonth || "")) ? input.startMonth : defaults.startMonth,
          endMonth: /^\d{4}-\d{2}$/.test(String(input.endMonth || "")) ? input.endMonth : defaults.endMonth
        }
      ];
    })
  );
}

function normalizeStockCashBalances(saved = {}) {
  return Object.fromEntries(
    STOCK_CASH_CONFIG.map((config) => {
      const item = saved?.[config.account] || {};
      return [
        config.account,
        {
          amount: Number(item.amount) || 0,
          currency: config.currency,
          updatedAt: item.updatedAt || ""
        }
      ];
    })
  );
}

function normalizeAssetCategories(saved, items = []) {
  const source = Array.isArray(saved) && saved.length ? saved : DEFAULT_INPUT_OPTIONS.assetCategories;
  const normalized = source.map((item) =>
    typeof item === "string"
      ? { label: item, type: item === "부동산" ? "realEstate" : item === "차량" ? "vehicle" : item === "부채" ? "debt" : "financial" }
      : { label: String(item.label || "").trim(), type: ["realEstate", "financial", "vehicle", "debt"].includes(item.type) ? item.type : "financial" }
  ).filter((item) => item.label);
  items.forEach((item) => {
    const label = String(item.category || "").trim();
    if (label && !normalized.some((entry) => entry.label === label)) normalized.push({ label, type: "financial" });
  });
  if (!normalized.some((entry) => entry.type === "vehicle" || entry.label === "차량")) {
    normalized.push({ label: "차량", type: "vehicle" });
  }
  return normalized;
}

function excludedStockAccount() {
  return state.excludedStockAccount || EXCLUDED_ACCOUNT;
}

function saveState({ remote = true } = {}) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const label = document.getElementById("dataUpdatedAt");
  if (label) label.textContent = `${new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 저장됨`;
  if (remote) queueRemoteStateSave();
}

async function hydrateRemoteState() {
  try {
    const response = await fetch(REMOTE_STATE_ENDPOINT, { headers: { accept: "application/json" } });
    if (!response.ok) return;

    const payload = await response.json();
    remoteStateEnabled = payload.source === "supabase";
    if (!remoteStateEnabled || !remoteHasData(payload.counts)) return;

    state = normalizeState(payload.state || {});
    saveState({ remote: false });
    applyTheme();
    renderAll();
    const label = document.getElementById("dataUpdatedAt");
    if (label) label.textContent = "온라인 DB에서 불러옴";
  } catch {
    remoteStateEnabled = false;
  }
}

function remoteHasData(counts = {}) {
  return Number(counts.assets) + Number(counts.stockHoldings) + Number(counts.ledgerEntries) + Number(counts.stockTransactions) + Number(counts.stockCashBalances) > 0;
}

function queueRemoteStateSave() {
  if (!remoteStateEnabled) return;
  clearTimeout(remoteSaveTimer);
  remoteSaveTimer = setTimeout(syncRemoteState, 900);
}

async function syncRemoteState() {
  if (remoteSaveInFlight) {
    queueRemoteStateSave();
    return;
  }

  remoteSaveInFlight = true;
  try {
    const response = await fetch(REMOTE_STATE_ENDPOINT, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        "x-ourcfo-pin": ACCESS_PIN
      },
      body: JSON.stringify({ state })
    });

    if (!response.ok) throw new Error("remote sync failed");
    const label = document.getElementById("dataUpdatedAt");
    if (label) label.textContent = `${new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 온라인 저장됨`;
  } catch {
    const label = document.getElementById("dataUpdatedAt");
    if (label) label.textContent = "로컬 저장됨 · 온라인 저장 대기";
  } finally {
    remoteSaveInFlight = false;
  }
}

function loadMarketCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(MARKET_CACHE_KEY));
    if (!cached?.quotes || Date.now() - cached.savedAt > 24 * 60 * 60 * 1000) return {};
    return cached.quotes;
  } catch {
    return {};
  }
}

function saveMarketCache() {
  localStorage.setItem(MARKET_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), quotes: marketQuotes }));
}

function money(value) {
  const number = Number(value) || 0;
  const abs = Math.abs(number);
  if (abs >= 100000000) return `${(number / 100000000).toFixed(1).replace(".0", "")}억원`;
  if (abs >= 10000) return `${Math.round(number / 10000).toLocaleString("ko-KR")}만원`;
  return `${Math.round(number).toLocaleString("ko-KR")}원`;
}

function fullMoney(value) {
  return `${Math.round(Number(value) || 0).toLocaleString("ko-KR")}원`;
}

function inputNumber(value) {
  return Number(String(value ?? "").replaceAll(",", "").trim()) || 0;
}

function formatKrwInput(input, value = input.value) {
  const negative = String(value).trim().startsWith("-");
  const digits = String(value).replace(/[^0-9]/g, "");
  input.value = digits ? `${negative ? "-" : ""}${Number(digits).toLocaleString("ko-KR")}` : "";
}

function syncLocalPriceInput(form) {
  const input = form.elements.purchasePrice || form.elements.price;
  if (!input) return;
  const isKrw = form.elements.country?.value === "KR";
  const value = inputNumber(input.value);
  input.type = isKrw ? "text" : "number";
  input.inputMode = isKrw ? "numeric" : "decimal";
  input.classList.toggle("krw-input", isKrw);
  input.value = value ? (isKrw ? value.toLocaleString("ko-KR") : String(value)) : "";
}

function usd(value) {
  return `$${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function percent(value, signed = false) {
  const number = Number.isFinite(Number(value)) ? Number(value) : 0;
  const sign = signed && number > 0 ? "+" : "";
  return `${sign}${number.toFixed(1)}%`;
}

function sum(items, selector = (item) => item.amount) {
  return items.reduce((total, item) => total + (Number(selector(item)) || 0), 0);
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function todayDate() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function todayMonth() {
  return todayDate().slice(0, 7);
}

function css(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function changeClass(value) {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "neutral";
}

function latestAssetItems() {
  const latest = new Map();
  [...state.assetItems]
    .sort((a, b) => a.month.localeCompare(b.month))
    .forEach((item) => latest.set(`${item.category}::${item.name}`, item));
  return [...latest.values()];
}

function usdKrwRate() {
  return Number(marketQuotes["KRW=X"]?.price) || 1380;
}

function quoteFor(ticker) {
  return marketQuotes[String(ticker).toUpperCase()] || null;
}

function countryFlag(country) {
  return country === "KR" ? "🇰🇷" : "🇺🇸";
}

function localPrice(value, country) {
  return country === "KR" ? fullMoney(value) : usd(value);
}

function stockCashConfig(account) {
  return STOCK_CASH_CONFIG.find((item) => item.account === account);
}

function stockCashBalances() {
  return STOCK_CASH_CONFIG.map((config) => {
    const balance = state.stockCashBalances?.[config.account] || {};
    const amount = Number(balance.amount) || 0;
    const valueKrw = config.currency === "USD" ? amount * usdKrwRate() : amount;
    return {
      ...config,
      amount,
      valueKrw,
      valueUsd: valueKrw / usdKrwRate(),
      updatedAt: balance.updatedAt || ""
    };
  });
}

function formatStockCashAmount(balance) {
  if (balance.currency === "USD") {
    return `${Number(balance.amount || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}달러`;
  }
  return fullMoney(balance.amount);
}

function holdingMetrics(holding) {
  const quote = quoteFor(holding.ticker);
  const currentPrice = Number(quote?.price);
  const hasPrice = Number.isFinite(currentPrice) && currentPrice > 0;
  const effectivePrice = hasPrice ? currentPrice : holding.purchasePrice;
  const isKorean = holding.country === "KR";
  const costLocal = holding.quantity * holding.purchasePrice;
  const valueLocal = holding.quantity * effectivePrice;
  const profitLocal = valueLocal - costLocal;
  const valueKrw = isKorean ? valueLocal : valueLocal * usdKrwRate();
  const costKrw = isKorean ? costLocal : costLocal * usdKrwRate();
  const profitKrw = valueKrw - costKrw;
  const returnRate = costLocal ? (profitLocal / costLocal) * 100 : 0;
  const annualDividendPerShare = Number(quote?.annualDividend) || 0;
  const annualDividendLocal = annualDividendPerShare * holding.quantity;
  const annualDividendKrw = isKorean ? annualDividendLocal : annualDividendLocal * usdKrwRate();
  const yieldOnCost = holding.purchasePrice ? (annualDividendPerShare / holding.purchasePrice) * 100 : 0;

  return {
    ...holding,
    quote,
    hasPrice,
    currentPrice: effectivePrice,
    costUsd: costKrw / usdKrwRate(),
    costKrw,
    valueUsd: valueKrw / usdKrwRate(),
    valueKrw,
    profitUsd: profitKrw / usdKrwRate(),
    profitKrw,
    returnRate,
    annualDividendUsd: annualDividendKrw / usdKrwRate(),
    annualDividendKrw,
    yieldOnCost,
    sector: quote?.sector || "미분류",
    shortName: quote?.shortName || holding.ticker,
    dividendMonths: quote?.dividendMonths || []
  };
}

function portfolioSnapshot() {
  const holdings = state.stockHoldings.map(holdingMetrics);
  const included = holdings.filter((item) => item.account !== excludedStockAccount());
  const excluded = holdings.filter((item) => item.account === excludedStockAccount());
  const cashBalances = stockCashBalances();
  const includedCash = cashBalances.filter((item) => !item.excluded && item.account !== excludedStockAccount());
  const excludedCash = cashBalances.filter((item) => item.excluded || item.account === excludedStockAccount());
  const holdingsValueKrw = sum(included, (item) => item.valueKrw);
  const includedCashKrw = sum(includedCash, (item) => item.valueKrw);
  const valueKrw = holdingsValueKrw + includedCashKrw;
  const costKrw = sum(included, (item) => item.costUsd * usdKrwRate());
  const profitKrw = holdingsValueKrw - costKrw;

  return {
    holdings,
    included,
    excluded,
    cashBalances,
    includedCash,
    excludedCash,
    includedCashKrw,
    excludedCashKrw: sum(excludedCash, (item) => item.valueKrw),
    holdingsValueKrw,
    valueKrw,
    valueUsd: valueKrw / usdKrwRate(),
    costKrw,
    profitKrw,
    returnRate: costKrw ? (profitKrw / costKrw) * 100 : 0,
    annualDividendKrw: sum(included, (item) => item.annualDividendKrw),
    dividendYield: holdingsValueKrw ? (sum(included, (item) => item.annualDividendKrw) / holdingsValueKrw) * 100 : 0,
    excludedValueKrw: sum(excluded, (item) => item.valueKrw) + sum(excludedCash, (item) => item.valueKrw)
  };
}

function assetSnapshot() {
  const current = latestAssetItems();
  const portfolio = portfolioSnapshot();
  const realEstate = sum(current.filter((item) => assetCategoryType(item.category) === "realEstate"));
  const manualFinancial = sum(current.filter((item) => assetCategoryType(item.category) === "financial"));
  const vehicle = sum(current.filter((item) => assetCategoryType(item.category) === "vehicle"));
  const debt = sum(current.filter((item) => assetCategoryType(item.category) === "debt"));
  const financial = manualFinancial + portfolio.valueKrw;

  return {
    current,
    realEstate,
    manualFinancial,
    stockFinancial: portfolio.valueKrw,
    financial,
    vehicle,
    debt,
    netWorth: realEstate + financial + vehicle - debt,
    grossAssets: realEstate + financial + vehicle,
    portfolio
  };
}

function latestLedgerMonth() {
  const months = state.ledgerEntries.map((entry) => String(entry.date || "").slice(0, 7)).filter(Boolean).sort();
  return months.at(-1) || todayMonth();
}

function ledgerSummary(entries) {
  const income = sum(entries.filter((entry) => entry.type === "수입"));
  const expense = sum(entries.filter((entry) => entry.type === "지출(고정)" || entry.type === "지출(변동)"));
  const saving = sum(entries.filter((entry) => entry.type === "저축"));
  return {
    income,
    expense,
    saving,
    balance: income - expense - saving,
    spendRate: income ? (expense / income) * 100 : 0,
    savingRate: income ? (saving / income) * 100 : 0
  };
}

function buildMonthlyCloseSnapshot(month = todayMonth()) {
  const assets = assetSnapshot();
  const entries = state.ledgerEntries.filter((entry) => String(entry.date).startsWith(month));
  const ledger = ledgerSummary(entries);
  const variableSpent = sum(entries.filter((entry) => entry.type === "지출(변동)"));
  const budget = Number(state.variableBudgets[month]) || 0;
  const portfolio = portfolioSnapshot();
  const investmentPrincipalKrw = sum(portfolio.holdings, (item) => item.costKrw);
  const investmentValueKrw = sum(portfolio.holdings, (item) => item.valueKrw);
  const investmentProfitKrw = investmentValueKrw - investmentPrincipalKrw;

  return {
    month,
    netWorth: assets.netWorth,
    savingRate: ledger.savingRate,
    budgetBurnRate: budget ? (variableSpent / budget) * 100 : 0,
    investmentPrincipalKrw,
    investmentValueKrw,
    investmentProfitKrw,
    investmentReturnRate: investmentPrincipalKrw ? (investmentProfitKrw / investmentPrincipalKrw) * 100 : 0,
    closedAt: state.monthlyClosings[month]?.closedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function signedMoney(value) {
  const number = Number(value) || 0;
  return `${number > 0 ? "+" : ""}${money(number)}`;
}

function signedPoints(value) {
  const number = Number(value) || 0;
  return `${number > 0 ? "+" : ""}${number.toFixed(1)}%p`;
}

function renderMonthlyManagement() {
  const month = todayMonth();
  const stored = state.monthlyClosings[month];
  const snapshot = stored || buildMonthlyCloseSnapshot(month);
  const previousMonth = Object.keys(state.monthlyClosings).filter((key) => key < month).sort().at(-1);
  const previous = previousMonth ? state.monthlyClosings[previousMonth] : null;
  const netWorthDelta = previous ? snapshot.netWorth - previous.netWorth : 0;
  const netWorthDeltaRate = previous?.netWorth ? (netWorthDelta / previous.netWorth) * 100 : 0;

  setText("kpiNetWorth", money(snapshot.netWorth));
  setText("kpiSavingRate", percent(snapshot.savingRate));
  setText("kpiBudgetRate", percent(snapshot.budgetBurnRate));
  setText("kpiInvestmentReturn", percent(snapshot.investmentReturnRate, true));
  setText("kpiInvestmentDetail", `원금 ${money(snapshot.investmentPrincipalKrw)} · 손익 ${signedMoney(snapshot.investmentProfitKrw)}`);
  setText("kpiNetWorthCompare", previous ? `전월 ${signedMoney(netWorthDelta)} (${percent(netWorthDeltaRate, true)})` : "첫 마감 전");
  setText("kpiSavingCompare", previous ? `전월 대비 ${signedPoints(snapshot.savingRate - previous.savingRate)}` : "수입 대비 저축");
  setText("kpiBudgetCompare", previous ? `전월 대비 ${signedPoints(snapshot.budgetBurnRate - previous.budgetBurnRate)}` : "변동지출 예산 기준");
  setText("kpiInvestmentCompare", previous ? `전월 대비 ${signedPoints(snapshot.investmentReturnRate - previous.investmentReturnRate)}` : "보유 종목 전체 기준");

  const [year, monthNumber] = month.split("-");
  setText("monthlyCloseMonth", `${year}년 ${Number(monthNumber)}월`);
  setText("monthlyCloseStatus", stored ? "마감 완료" : "마감 전");
  setText(
    "monthlyCloseCaption",
    stored ? `마감값 고정 · ${new Date(stored.updatedAt).toLocaleDateString("ko-KR")} 반영` : "현재 데이터 실시간 계산"
  );

  document.getElementById("closeCurrentMonthBtn").disabled = Boolean(stored);
  document.getElementById("editMonthlyCloseBtn").disabled = !stored;
  document.getElementById("reapplyMonthlyCloseBtn").disabled = !stored;

  const warnings = {
    kpiNetWorthCard: Boolean(previous && netWorthDelta < 0),
    kpiSavingCard: snapshot.savingRate < 30,
    kpiBudgetCard: snapshot.budgetBurnRate >= 100,
    kpiInvestmentCard: snapshot.investmentReturnRate < 0
  };
  Object.entries(warnings).forEach(([id, warning]) => {
    document.getElementById(id)?.classList.toggle("kpi-warning", warning);
  });
}

function monthLabel(month) {
  const [year, monthNumber] = String(month || todayMonth()).split("-");
  return `${year}년 ${Number(monthNumber)}월`;
}

function renderLedgerMonthlyClose(month = selectedLedgerMonth || todayMonth()) {
  const stored = state.monthlyClosings[month];
  const snapshot = stored || buildMonthlyCloseSnapshot(month);
  const entries = state.ledgerEntries.filter((entry) => String(entry.date).startsWith(month));
  const status = document.getElementById("ledgerMonthlyCloseStatus");
  if (status) {
    status.textContent = stored ? "마감 완료" : "마감 전";
    status.classList.toggle("closed", Boolean(stored));
  }

  setText("ledgerMonthlyCloseMonth", monthLabel(month));
  setText(
    "ledgerMonthlyCloseCaption",
    stored
      ? `마감값 고정 · ${new Date(stored.updatedAt).toLocaleDateString("ko-KR")} 반영`
      : `${entries.length.toLocaleString("ko-KR")}건 기준 · 순자산 ${money(snapshot.netWorth)}`
  );

  const closeButton = document.getElementById("closeSelectedMonthBtn");
  const editButton = document.getElementById("editSelectedMonthlyCloseBtn");
  const reapplyButton = document.getElementById("reapplySelectedMonthlyCloseBtn");
  if (closeButton) closeButton.disabled = Boolean(stored);
  if (editButton) editButton.disabled = !stored;
  if (reapplyButton) reapplyButton.disabled = !stored;
}

function saveMonthlyClose(month, { reapply = false } = {}) {
  state.monthlyClosings[month] = buildMonthlyCloseSnapshot(month);
  saveState();
  renderHome();
  renderLedger();
  showToast(`${monthLabel(month)} ${reapply ? "마감값을 다시 반영했어요." : "마감을 완료했어요."}`);
}

function openMonthlyCloseEditor(month = selectedLedgerMonth || todayMonth()) {
  const closing = state.monthlyClosings[month];
  if (!closing) return;
  const form = document.getElementById("monthlyCloseForm");
  form.dataset.month = month;
  setText("monthlyCloseModalTitle", `${monthLabel(month)} 마감값 수정`);
  formatKrwInput(form.elements.netWorth, Math.round(closing.netWorth));
  form.elements.savingRate.value = closing.savingRate.toFixed(1);
  form.elements.budgetBurnRate.value = closing.budgetBurnRate.toFixed(1);
  formatKrwInput(form.elements.investmentPrincipalKrw, Math.round(closing.investmentPrincipalKrw));
  formatKrwInput(form.elements.investmentValueKrw, Math.round(closing.investmentValueKrw));
  openModal("monthlyCloseModal");
}

function getUiLabel(key) {
  return state.uiConfig.labels[key] || DEFAULT_UI_LABELS[key] || key;
}

function applyUiConfig() {
  document.querySelectorAll("[data-ui-label]").forEach((element) => {
    element.textContent = getUiLabel(element.dataset.uiLabel);
  });

  Object.entries(state.uiConfig.orders).forEach(([group, order]) => {
    order.forEach((id, index) => {
      const element = document.querySelector(`[data-layout-group="${group}"][data-layout-id="${id}"]`);
      if (element) element.style.order = String(index + 1);
    });
  });

  const unlocked = !state.uiConfig.layoutLocked;
  const toggle = document.getElementById("layoutEditToggle");
  if (!toggle) return;
  toggle.checked = unlocked;
  const panel = document.getElementById("layoutEditorPanel");
  if (panel) panel.hidden = !unlocked;
  setText("layoutEditLabel", unlocked ? "Layout Editable" : "Layout Lock");
  renderLayoutEditor();
}

function renderLayoutEditor() {
  const labelEditor = document.getElementById("layoutLabelEditor");
  if (!labelEditor) return;
  labelEditor.innerHTML = "";
  Object.keys(DEFAULT_UI_LABELS).forEach((key) => {
    const row = document.createElement("label");
    row.className = "layout-label-row";
    row.innerHTML = `
      <span>${UI_LABEL_NAMES[key]}</span>
      <input value="${escapeHtml(getUiLabel(key))}" data-layout-label-input="${key}" />
    `;
    labelEditor.appendChild(row);
  });

  const orderEditor = document.getElementById("layoutOrderEditor");
  if (!orderEditor) return;
  orderEditor.innerHTML = "";
  Object.entries(state.uiConfig.orders).forEach(([group, order]) => {
    const wrapper = document.createElement("div");
    wrapper.className = "layout-order-group";
    wrapper.innerHTML = `<strong>${LAYOUT_GROUP_NAMES[group]}</strong><div class="layout-order-items"></div>`;
    const items = wrapper.querySelector(".layout-order-items");
    order.forEach((id, index) => {
      const row = document.createElement("div");
      row.className = "layout-order-row";
      row.innerHTML = `
        <span>${escapeHtml(getUiLabel(LAYOUT_ITEM_LABEL_KEYS[id]))}</span>
        <button class="order-button" data-move-layout="${group}" data-layout-item="${id}" data-direction="-1" aria-label="위로 이동" ${index === 0 ? "disabled" : ""}>↑</button>
        <button class="order-button" data-move-layout="${group}" data-layout-item="${id}" data-direction="1" aria-label="아래로 이동" ${index === order.length - 1 ? "disabled" : ""}>↓</button>
      `;
      items.appendChild(row);
    });
    orderEditor.appendChild(wrapper);
  });
}

function setView(view) {
  const valid = ["home", "ledger", "stocks", "assets"];
  activeView = valid.includes(view) ? view : "home";
  const titles = {
    home: ["우리집 자산", getUiLabel("tabHome")],
    ledger: ["Household Ledger", getUiLabel("tabLedger")],
    stocks: ["Stock Portfolio", getUiLabel("tabStocks")],
    assets: ["Asset Position", getUiLabel("tabAssets")]
  };

  document.querySelectorAll("[data-view]").forEach((section) => {
    section.classList.toggle("active", section.dataset.view === activeView);
  });
  document.querySelectorAll("[data-view-target]").forEach((button) => {
    button.classList.toggle("active", button.dataset.viewTarget === activeView);
  });
  setText("pageEyebrow", titles[activeView][0]);
  setText("pageTitle", titles[activeView][1]);
  history.replaceState(null, "", `#${activeView}`);
  requestAnimationFrame(renderVisibleCharts);
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  document.getElementById("themeToggle").checked = state.theme === "dark";
  requestAnimationFrame(renderVisibleCharts);
}

function renderAll() {
  syncInputOptions();
  renderHome();
  applyUiConfig();
  renderLedger();
  renderStocks();
  renderAssets();
  setView(activeView);
}

function syncInputOptions() {
  const fillDatalist = (id, values) => {
    const list = document.getElementById(id);
    if (list) list.innerHTML = values.map((value) => `<option value="${escapeHtml(value)}"></option>`).join("");
  };
  fillDatalist("ledgerCategoryList", state.inputOptions.ledgerCategories);
  fillDatalist("ledgerPaymentList", state.inputOptions.ledgerPayments);
  const heldTickerList = document.getElementById("heldTickerList");
  if (heldTickerList) {
    const heldTickers = new Map();
    state.stockHoldings.forEach((item) => {
      const ticker = String(item.ticker || "").toUpperCase();
      const account = String(item.account || "").trim();
      if (!ticker || !account) return;
      const country = item.country === "KR" ? "KR" : "US";
      const key = `${ticker}::${country}::${account}`;
      const current = heldTickers.get(key) || { ticker, country, account, quantity: 0 };
      current.quantity += Number(item.quantity || 0);
      heldTickers.set(key, current);
    });
    heldTickerList.innerHTML = [...heldTickers.values()]
      .sort((a, b) => a.ticker.localeCompare(b.ticker) || a.account.localeCompare(b.account))
      .map((item) => {
        const value = `${item.ticker} · ${item.account}`;
        const label = `${item.country} · ${Number(item.quantity || 0).toLocaleString("ko-KR", { maximumFractionDigits: 4 })}주`;
        return `<option value="${escapeHtml(value)}" label="${escapeHtml(label)}"></option>`;
      })
      .join("");
  }
  document.querySelectorAll("[data-account-select]").forEach((select) => {
    const current = select.value;
    select.innerHTML = state.inputOptions.stockAccounts.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");
    if (state.inputOptions.stockAccounts.includes(current)) select.value = current;
  });
  document.querySelectorAll("[data-asset-category-select]").forEach((select) => {
    const current = select.value;
    select.innerHTML = state.inputOptions.assetCategories.map((item) => `<option value="${escapeHtml(item.label)}">${escapeHtml(item.label)}</option>`).join("");
    if (state.inputOptions.assetCategories.some((item) => item.label === current)) select.value = current;
  });
}

function applyHeldTickerToTradeForm() {
  const form = document.getElementById("tradeForm");
  if (!form) return;
  const parsed = parseHeldTickerSelection(form.elements.ticker.value);
  const ticker = parsed.ticker;
  if (!ticker) return;
  const currentAccount = String(form.elements.account.value || "");
  const holding = state.stockHoldings.find((item) =>
    String(item.ticker || "").toUpperCase() === ticker && parsed.account && item.account === parsed.account
  ) || state.stockHoldings.find((item) =>
    String(item.ticker || "").toUpperCase() === ticker && item.account === currentAccount
  ) || state.stockHoldings.find((item) => String(item.ticker || "").toUpperCase() === ticker);
  if (!holding) return;
  form.elements.ticker.value = ticker;
  form.elements.country.value = holding.country === "KR" ? "KR" : "US";
  if (state.inputOptions.stockAccounts.includes(holding.account)) {
    form.elements.account.value = holding.account;
  }
  syncLocalPriceInput(form);
}

function parseHeldTickerSelection(value) {
  const raw = String(value || "").trim();
  const [tickerPart, accountPart] = raw.split(" · ");
  return {
    ticker: String(tickerPart || "").trim().toUpperCase(),
    account: String(accountPart || "").trim()
  };
}

function openOptionManager(scope) {
  optionManagerScope = scope;
  const groups = scope === "ledger"
    ? [
        { key: "ledgerCategories", title: "분류" },
        { key: "ledgerPayments", title: "결제수단" }
      ]
    : scope === "assets"
      ? [{ key: "assetCategories", title: "자산 분류", typed: true }]
      : [{ key: "stockAccounts", title: "계좌" }];
  optionManagerDraft = groups.map((group) => ({
    ...group,
    items: (state.inputOptions[group.key] || []).map((item) => {
      const entry = typeof item === "string" ? { label: item } : { ...item };
      return { ...entry, originalLabel: entry.label };
    })
  }));
  renderOptionManager();
  openModal("optionManagerModal");
}

function renderOptionManager() {
  const container = document.getElementById("optionManagerGroups");
  container.innerHTML = optionManagerDraft.map((group, groupIndex) => `
    <section class="option-manager-group">
      <div class="option-manager-heading"><strong>${group.title}</strong><button type="button" class="inline-manage-button" data-add-option="${groupIndex}">+ 추가</button></div>
      <div class="option-manager-list">
        ${group.items.map((item, itemIndex) => `
          <div class="option-manager-row">
            <input value="${escapeHtml(item.label)}" data-option-label="${groupIndex}:${itemIndex}" aria-label="${group.title} 이름" />
            ${group.typed ? `<select data-option-type="${groupIndex}:${itemIndex}" aria-label="계산 기준">
              <option value="realEstate" ${item.type === "realEstate" ? "selected" : ""}>부동산</option>
              <option value="financial" ${item.type === "financial" ? "selected" : ""}>금융자산</option>
              <option value="vehicle" ${item.type === "vehicle" ? "selected" : ""}>차량</option>
              <option value="debt" ${item.type === "debt" ? "selected" : ""}>부채</option>
            </select>` : ""}
            <button type="button" class="row-remove" data-remove-option="${groupIndex}:${itemIndex}" aria-label="항목 삭제">×</button>
          </div>
        `).join("")}
      </div>
    </section>
  `).join("");
}

function saveOptionManager() {
  for (const group of optionManagerDraft) {
    const labels = group.items.map((item) => item.label.trim()).filter(Boolean);
    if (!labels.length || labels.length !== group.items.length || new Set(labels).size !== labels.length) {
      showToast("항목 이름은 비워두거나 중복해서 사용할 수 없어요.");
      return;
    }
  }
  optionManagerDraft.forEach((group) => {
    group.items.forEach((item) => {
      if (!item.originalLabel || item.originalLabel === item.label) return;
      if (group.key === "ledgerCategories") state.ledgerEntries.forEach((entry) => { if (entry.category === item.originalLabel) entry.category = item.label; });
      if (group.key === "ledgerPayments") state.ledgerEntries.forEach((entry) => { if (entry.payment === item.originalLabel) entry.payment = item.label; });
      if (group.key === "stockAccounts") {
        state.stockHoldings.forEach((entry) => { if (entry.account === item.originalLabel) entry.account = item.label; });
        state.stockTransactions.forEach((entry) => { if (entry.account === item.originalLabel) entry.account = item.label; });
        if (state.excludedStockAccount === item.originalLabel) state.excludedStockAccount = item.label;
      }
      if (group.key === "assetCategories") state.assetItems.forEach((entry) => { if (entry.category === item.originalLabel) entry.category = item.label; });
    });
    state.inputOptions[group.key] = group.key === "assetCategories"
      ? group.items.map(({ label, type }) => ({ label: label.trim(), type }))
      : group.items.map((item) => item.label.trim());
  });
  saveState();
  closeModal("optionManagerModal");
  renderAll();
  showToast("입력 항목을 저장했어요.");
}

function v2Won(value) {
  return window.OurCfoFinance?.won ? window.OurCfoFinance.won(value) : money(value);
}

function v2Pct(value, signed = false) {
  return window.OurCfoFinance?.pct ? window.OurCfoFinance.pct(value, signed) : percent(value, signed);
}

function v2SignedWon(value) {
  return window.OurCfoFinance?.signedWon ? window.OurCfoFinance.signedWon(value) : signedMoney(value);
}

if (!window.OurCfoFinance) {
  window.OurCfoFinance = {
    won: money,
    signedWon: signedMoney,
    pct: percent,
    buildHomeModel({ state, assets, period, entries, currentClose }) {
      const previousKey = Object.keys(state.monthlyClosings || {}).filter((month) => month < period).sort().at(-1);
      const previousClose = previousKey ? state.monthlyClosings[previousKey] : null;
      const ledger = ledgerSummary(entries);
      const fixed = sum(entries.filter((entry) => entry.type === FIXED_EXPENSE_TYPE), (entry) => entry.amount);
      const variable = sum(entries.filter((entry) => entry.type === VARIABLE_EXPENSE_TYPE), (entry) => entry.amount);
      const investment = sum(entries.filter((entry) => /투자|주식|isa|연금|메리츠|meritz/i.test([entry.type, entry.category, entry.payment, entry.memo].join(" "))), (entry) => entry.amount);
      const cashflow = {
        income: ledger.income,
        fixed,
        variable,
        saving: ledger.saving,
        investment,
        expense: fixed + variable,
        remainder: ledger.income - fixed - variable - ledger.saving,
        savingRate: ledger.savingRate,
        spendRate: ledger.income ? ((fixed + variable) / ledger.income) * 100 : 0
      };
      const holdings = assets.portfolio.holdings || [];
      const total = sum(holdings, (item) => item.valueKrw);
      const cost = sum(holdings, (item) => item.costKrw);
      const leveraged = sum(holdings.filter((item) => ["QLD", "TQQQ", "SOXL", "UPRO", "SSO", "TECL", "FNGU"].includes(String(item.ticker).toUpperCase())), (item) => item.valueKrw);
      const individual = sum(holdings.filter((item) => !["QQQ", "QQQM", "SPY", "SPYM", "VOO", "VTI", "SCHD", "DIA", "IWM", "QLD", "TQQQ", "SOXL"].includes(String(item.ticker).toUpperCase())), (item) => item.valueKrw);
      const us = sum(holdings.filter((item) => item.country !== "KR"), (item) => item.valueKrw);
      const kr = sum(holdings.filter((item) => item.country === "KR"), (item) => item.valueKrw);
      const health = {
        total,
        profit: total - cost,
        returnRate: cost ? ((total - cost) / cost) * 100 : 0,
        leverageRate: total ? (leveraged / total) * 100 : 0,
        leverageStatus: total && (leveraged / total) * 100 >= 60 ? "red" : total && (leveraged / total) * 100 >= 40 ? "yellow" : "green",
        individualRate: total ? (individual / total) * 100 : 0,
        cashRate: 0,
        usRate: total ? (us / total) * 100 : 0,
        krRate: total ? (kr / total) * 100 : 0
      };
      const budget = Number(state.variableBudgets?.[period]) || 0;
      const delta = previousClose ? Number(currentClose.netWorth || 0) - Number(previousClose.netWorth || 0) : null;
      const deltaRate = previousClose?.netWorth ? (delta / previousClose.netWorth) * 100 : null;
      const goals = normalizeV2Goals(state.uiConfig?.v2Goals || {});
      const meritzRate = Number(state.uiConfig?.meritzScenario) || 0.1;
      const meritz = buildFallbackMeritz(state, assets, entries, meritzRate);
      return {
        period,
        previousClose,
        delta,
        deltaRate,
        cashflow,
        budget,
        health,
        allocation: { items: [], total: 0, debt: assets.debt },
        alerts: buildFallbackAlerts({ assets, cashflow, budget, previousClose, currentClose, health }),
        goals: [
          fallbackGoal("Financial Assets", assets.financial, goals.financialAssets, cashflow.saving || cashflow.investment),
          fallbackGoal("Net Worth", assets.netWorth, goals.netWorth, cashflow.saving || cashflow.investment),
          fallbackGoal("Junwon Account", assets.portfolio.excludedValueKrw, goals.meritzW, meritz.monthly)
        ],
        meritz,
        report: fallbackReport(delta, cashflow, budget, health)
      };
    }
  };
}

function fallbackGoal(title, current, goal, monthlySaving) {
  const target = Number(goal.target) || 0;
  const progress = target ? Math.min((current / target) * 100, 999) : 0;
  const remaining = Math.max(target - current, 0);
  const months = monthlySaving > 0 && remaining > 0 ? Math.ceil(remaining / monthlySaving) : null;
  const date = months === null ? null : new Date(new Date().getFullYear(), new Date().getMonth() + months, 1);
  const formatMonth = (value) => (/^\d{4}-\d{2}$/.test(String(value)) ? String(value).replace("-", ".") : "Not set");
  return {
    title,
    current,
    target,
    progress,
    eta: months === null ? `Target date ${formatMonth(goal.endMonth)}` : `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`,
    dateRange: `${formatMonth(goal.startMonth)} - ${formatMonth(goal.endMonth)}`
  };
}

function buildFallbackAlerts({ assets, cashflow, budget, previousClose, currentClose, health }) {
  const alerts = [];
  if (health.leverageRate >= 60) alerts.push({ id: "leverage-red", tone: "red", title: "Leveraged ETF Risk", body: `Leveraged ETF exposure is ${percent(health.leverageRate)}. Review your rebalancing rule.` });
  else if (health.leverageRate >= 40) alerts.push({ id: "leverage-yellow", tone: "yellow", title: "Leverage Check", body: `Leveraged ETF exposure is ${percent(health.leverageRate)}. Prepare for volatility.` });
  if (cashflow.savingRate >= 40) alerts.push({ id: "saving-rate-strong", tone: "green", title: "Goal Beat", body: `This month's saving rate is ${percent(cashflow.savingRate)}. Cash discipline is strong.` });
  if (budget && cashflow.variable > budget) alerts.push({ id: "variable-budget-over", tone: "red", title: "Variable Spend Over Budget", body: `Variable spending used ${percent((cashflow.variable / budget) * 100)} of budget.` });
  if (previousClose && currentClose && Number(currentClose.netWorth || 0) >= Number(previousClose.netWorth || 0)) alerts.push({ id: "net-worth-up", tone: "green", title: "Net Worth Improved", body: `Net worth changed by ${signedMoney(Number(currentClose.netWorth || 0) - Number(previousClose.netWorth || 0))} vs last close.` });
  if (previousClose && currentClose && Number(currentClose.debt || 0) < Number(previousClose.debt || 0)) alerts.push({ id: "debt-down", tone: "green", title: "Debt Improved", body: "Debt is lower than the previous close. Keep the repayment rhythm." });
  if (!alerts.length && (assets.current || []).length) alerts.push({ id: "data-ready", tone: "green", title: "Data Ready", body: "Assets, cashflow, and investment data are being summarized." });
  return alerts;
}

function buildFallbackMeritz(state, assets, entries, annualRate) {
  const principal = assets.portfolio.excludedValueKrw;
  const account = String(state.excludedStockAccount || "Meritz W").toLowerCase();
  const monthly = sum(entries.filter((entry) => [entry.type, entry.category, entry.payment, entry.memo].join(" ").toLowerCase().includes(account)), (entry) => entry.amount);
  const annualExtra = sum((state.stockTransactions || []).filter((trade) => String(trade.account || "").toLowerCase().includes(account) && String(trade.date || "").startsWith(String(new Date().getFullYear()))), (trade) => trade.amountKrw);
  const futureValue = (years) => {
    const monthlyRate = annualRate / 12;
    let value = principal;
    for (let month = 1; month <= years * 12; month += 1) {
      value = value * (1 + monthlyRate) + monthly;
      if (month % 12 === 0) value += annualExtra;
    }
    return value;
  };
  return { principal, monthly, annualExtra, annualRate, scenarios: [10, 15, 20].map((years) => ({ years, value: futureValue(years) })) };
}

function fallbackReport(delta, cashflow, budget, health) {
  if (!cashflow.income && !health.total) return "Input this month's ledger and investment data to generate an automatic CFO report.";
  const deltaText = delta === null ? "Month-over-month comparison appears after a monthly close." : `Net worth changed by ${signedMoney(delta)} vs the previous close.`;
  const budgetText = budget ? `Variable spending used ${percent((cashflow.variable / budget) * 100)} of budget.` : "Variable spending budget is not set yet.";
  return `${deltaText} Saving rate is ${percent(cashflow.savingRate)}. ${budgetText} Investment return is ${percent(health.returnRate, true)}.`;
}

function homeMetricCard({ label, value, helper = "", tone = "neutral" }) {
  return `
    <article class="v2-metric-card ${tone}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <small>${escapeHtml(helper)}</small>
    </article>
  `;
}

function progressGoalCard(goal) {
  const width = Math.min(Math.max(goal.progress || 0, 0), 100);
  return `
    <article class="v2-progress-card">
      <div class="v2-progress-head">
        <div><span>${escapeHtml(goal.title)}</span><strong>${v2Pct(goal.progress || 0)}</strong></div>
        <small>${escapeHtml(goal.eta)}</small>
      </div>
      <div class="v2-progress-track"><div style="width:${width}%"></div></div>
      <p>${v2Won(goal.current)} / ${v2Won(goal.target)}</p>
      <small>Plan ${escapeHtml(goal.dateRange || "Not set")}</small>
    </article>
  `;
}

function richEmptyState(title, body, actionLabel, actionTarget) {
  return `
    <div class="empty-state rich-empty-state">
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(body)}</span>
      ${actionLabel ? `<button class="text-button primary" data-view-link="${actionTarget}">${escapeHtml(actionLabel)}</button>` : ""}
    </div>
  `;
}

function tableEmptyState(colspan, title, body, modalId) {
  return `
    <tr>
      <td colspan="${colspan}" class="empty-state">
        <div class="rich-empty-state compact">
          <strong>${escapeHtml(title)}</strong>
          <span>${escapeHtml(body)}</span>
          ${modalId ? `<button class="text-button primary" data-open-modal="${modalId}">바로 입력</button>` : ""}
        </div>
      </td>
    </tr>
  `;
}

function renderAllocationBars(model) {
  if (!model.allocation.items.length) {
    return richEmptyState("아직 입력된 데이터가 없어요", "자산현황을 추가하면 목표 달성률이 표시돼요.", "자산 입력하기", "assets");
  }
  return `
    <div class="v2-allocation-list">
      ${model.allocation.items.map((item) => `
        <div class="v2-allocation-row">
          <div><span>${escapeHtml(item.label)}</span><strong>${v2Won(item.value)}</strong></div>
          <div class="v2-allocation-bar"><i class="${item.tone}" style="width:${Math.max(item.rate, 2)}%"></i></div>
          <small>${v2Pct(item.rate)}</small>
        </div>
      `).join("")}
    </div>
  `;
}

function renderScenarioCells(model) {
  return model.meritz.scenarios.map((item) => `
    <div>
      <span>${item.years}Y Forecast</span>
      <strong>${v2Won(item.value)}</strong>
    </div>
  `).join("");
}
function renderHome() {
  const assets = assetSnapshot();
  const period = latestLedgerMonth();
  const monthEntries = state.ledgerEntries.filter((entry) => String(entry.date).startsWith(period));
  const ledger = ledgerSummary(monthEntries);
  const currentClose = buildMonthlyCloseSnapshot(period);
  const model = window.OurCfoFinance.buildHomeModel({ state, assets, period, entries: monthEntries, currentClose });
  const home = document.querySelector('[data-view="home"]');
  const deltaTone = model.delta === null ? "neutral" : model.delta >= 0 ? "positive" : "negative";
  const budgetRate = model.budget ? (model.cashflow.variable / model.budget) * 100 : 0;
  const selectedScenario = Number(state.uiConfig.meritzScenario || 0.1);
  const dismissedAlerts = new Set(state.uiConfig.dismissedAlerts || []);
  const visibleAlerts = model.alerts.filter((alert) => !dismissedAlerts.has(alert.id));

  home.innerHTML = `
    <section class="v2-hero-summary">
      <div class="v2-hero-copy">
        <span class="section-kicker">OurCFO v2.0</span>
        <h2>Family CFO Decision Dashboard</h2>
        <strong>${v2Won(assets.netWorth)}</strong>
        <p class="${deltaTone}">${model.delta === null ? "Month-over-month data needed" : `vs previous close ${v2SignedWon(model.delta)} (${v2Pct(model.deltaRate, true)})`}</p>
      </div>
      <div class="v2-hero-controls">
        <label class="theme-switch" title="Dark mode">
          <input type="checkbox" id="themeToggle" ${state.theme === "dark" ? "checked" : ""} />
          <span class="switch-track"><span class="switch-thumb"></span></span>
          <span>Dark Mode</span>
        </label>
        <label class="theme-switch" title="Edit screen labels and chart order">
          <input type="checkbox" id="layoutEditToggle" ${state.uiConfig.layoutLocked ? "" : "checked"} />
          <span class="switch-track"><span class="switch-thumb"></span></span>
          <span id="layoutEditLabel">Layout Lock</span>
        </label>
      </div>
      <div class="v2-hero-metrics">
        ${homeMetricCard({ label: "Family Net Worth", value: v2Won(assets.netWorth), helper: model.delta === null ? "After monthly close" : v2SignedWon(model.delta), tone: deltaTone })}
        ${homeMetricCard({ label: "MoM Growth Rate", value: model.deltaRate === null ? "Data needed" : v2Pct(model.deltaRate, true), helper: model.previousClose ? "Previous close basis" : "First close needed", tone: deltaTone })}
        ${homeMetricCard({ label: "Financial Assets", value: v2Won(assets.financial), helper: `Stocks ${v2Won(assets.stockFinancial)}`, tone: "positive" })}
        ${homeMetricCard({ label: "Debt", value: v2Won(assets.debt), helper: assets.debt ? "Repayment plan" : "No debt", tone: assets.debt ? "warning" : "positive" })}
        ${homeMetricCard({ label: "This Month Saving Rate", value: v2Pct(ledger.savingRate), helper: `${period.replace("-", ".")} basis`, tone: ledger.savingRate >= 40 ? "positive" : ledger.savingRate >= 25 ? "neutral" : "warning" })}
        ${homeMetricCard({ label: "Remaining Cash", value: v2Won(model.cashflow.remainder), helper: `Spend rate ${v2Pct(model.cashflow.spendRate)}`, tone: model.cashflow.remainder >= 0 ? "positive" : "negative" })}
      </div>
    </section>

    <section class="surface v2-report-surface">
      <div class="section-heading compact">
        <div><span class="section-kicker">Monthly Report</span><h2>Monthly CFO Report</h2></div>
        <span class="status-badge">${period.replace("-", ".")}</span>
      </div>
      <p>${escapeHtml(model.report)}</p>
    </section>

    <article class="surface layout-editor" id="layoutEditorPanel" hidden>
      <div class="section-heading compact">
        <div><span class="section-kicker">Layout Editor</span><h2>Screen Labels and Chart Order</h2></div>
        <span class="status-badge">Editable</span>
      </div>
      <div class="layout-editor-grid">
        <div><h3>Rename</h3><div class="layout-label-list" id="layoutLabelEditor"></div></div>
        <div><h3>Chart Order</h3><div class="layout-order-list" id="layoutOrderEditor"></div></div>
      </div>
    </article>

    <section class="v2-cfo-grid">
      <article class="surface v2-alert-surface">
        <div class="section-heading compact">
          <div><span class="section-kicker">CFO Alerts</span><h2>Today Check Signals</h2></div>
          <button class="text-button secondary" data-view-link="ledger" title="Open ledger">Ledger</button>
        </div>
        <div class="v2-alert-list">
          ${visibleAlerts.length ? visibleAlerts.map((alert) => `
            <div class="v2-alert ${alert.tone}">
              <i aria-hidden="true"></i>
              <div><strong>${escapeHtml(alert.title)}</strong><span>${escapeHtml(alert.body)}</span></div>
              <button class="v2-alert-dismiss" data-dismiss-alert="${escapeHtml(alert.id)}" aria-label="Dismiss alert">&times;</button>
            </div>
          `).join("") : richEmptyState("All clear", "Dismissed alerts are hidden for this browser.", "Open Ledger", "ledger")}
        </div>
      </article>

      <article class="surface v2-goal-surface">
        <div class="section-heading compact">
          <div><span class="section-kicker">Goal Progress</span><h2>Goal Progress</h2></div>
          <button class="text-button secondary" data-open-modal="goalModal">Edit Goals</button>
        </div>
        <div class="v2-progress-list">${model.goals.map(progressGoalCard).join("")}</div>
      </article>
    </section>

    <section class="v2-dashboard-grid">
      <article class="surface v2-cashflow-surface">
        <div class="section-heading compact">
          <div><span class="section-kicker">Cashflow Snapshot</span><h2>Cashflow Snapshot</h2></div>
          <span class="updated-label">${period.replace("-", ".")}</span>
        </div>
        ${model.cashflow.income ? `
          <div class="v2-waterfall">
            ${[
              ["Income", model.cashflow.income, "positive"],
              ["Fixed Spend", -model.cashflow.fixed, "negative"],
              ["Variable Spend", -model.cashflow.variable, budgetRate >= 100 ? "danger" : "warning"],
              ["Savings", -model.cashflow.saving, "positive"],
              ["Investment", -model.cashflow.investment, "neutral"],
              ["Remaining Cash", model.cashflow.remainder, model.cashflow.remainder >= 0 ? "positive" : "danger"]
            ].map(([label, value, tone]) => `
              <div class="${tone}"><span>${label}</span><strong>${v2SignedWon(value)}</strong></div>
            `).join("")}
          </div>
          <div class="v2-rate-row">
            <span>Saving Rate <strong>${v2Pct(model.cashflow.savingRate)}</strong></span>
            <span>Spend Rate <strong>${v2Pct(model.cashflow.spendRate)}</strong></span>
            <span>Variable Budget <strong>${model.budget ? v2Pct(budgetRate) : "Set budget"}</strong></span>
          </div>
        ` : richEmptyState("Ledger data needed", "Enter this month's income, expenses, savings, and investments to calculate cashflow.", "Add Ledger", "ledger")}
      </article>

      <article class="surface v2-investment-surface">
        <div class="section-heading compact">
          <div><span class="section-kicker">Investment Health</span><h2>Investment Health</h2></div>
          <button class="text-button secondary" data-view-link="stocks" title="Open stocks">Stocks</button>
        </div>
        <div class="v2-health-grid">
          ${homeMetricCard({ label: "Total Investment Value", value: v2Won(model.health.total), helper: `Profit ${v2SignedWon(model.health.profit)}`, tone: "positive" })}
          ${homeMetricCard({ label: "Total Return", value: v2Pct(model.health.returnRate, true), helper: "All holdings", tone: model.health.returnRate >= 0 ? "positive" : "negative" })}
          ${homeMetricCard({ label: "Leveraged ETF", value: v2Pct(model.health.leverageRate), helper: "40% yellow / 60% red", tone: model.health.leverageStatus === "red" ? "negative" : model.health.leverageStatus === "yellow" ? "warning" : "positive" })}
          ${homeMetricCard({ label: "Single Stock Mix", value: v2Pct(model.health.individualRate), helper: `US ${v2Pct(model.health.usRate)} / KR ${v2Pct(model.health.krRate)}`, tone: "neutral" })}
        </div>
      </article>

      <article class="surface v2-meritz-surface">
        <div class="section-heading compact">
          <div><span class="section-kicker">Junwon Account</span><h2>Junwon Account · Meritz W</h2></div>
          <div class="segmented-control compact-control" data-meritz-scenario>
            ${[0.05, 0.1, 0.15].map((rate) => `<button class="${selectedScenario === rate ? "active" : ""}" data-meritz-rate="${rate}">${Math.round(rate * 100)}%</button>`).join("")}
          </div>
        </div>
        <div class="v2-meritz-top">
          ${homeMetricCard({ label: "Current Value", value: v2Won(model.meritz.principal), helper: "Meritz W account", tone: "positive" })}
          ${homeMetricCard({ label: "Monthly Contribution", value: v2Won(model.meritz.monthly), helper: "This month basis", tone: model.meritz.monthly ? "positive" : "warning" })}
          ${homeMetricCard({ label: "Annual Extra Investment", value: v2Won(model.meritz.annualExtra), helper: "Current-year trades", tone: "neutral" })}
        </div>
        <div class="v2-scenario-grid">${renderScenarioCells(model)}</div>
      </article>
    </section>

    <section class="dashboard-section" data-layout-group="homeCharts" data-layout-id="markets">
      <div class="section-heading">
        <div><span class="section-kicker">Markets</span><h2 data-ui-label="homeMarketsTitle">Market Overview</h2></div>
        <span class="updated-label" id="marketUpdatedAt">-</span>
      </div>
      <div class="market-grid" id="marketGrid"></div>
    </section>

    <section class="dashboard-section" data-layout-group="homeCharts" data-layout-id="watch">
      <div class="section-heading">
        <div><span class="section-kicker">US ETFs</span><h2 data-ui-label="homeWatchTitle">Watchlist Prices</h2></div>
        <span class="updated-label">USD basis</span>
      </div>
      <div class="quote-grid" id="watchQuoteGrid"></div>
    </section>
  `;

  renderMarketCards();
  renderWatchQuotes();
}

function renderHomeLegacy() {
  const assets = assetSnapshot();
  const period = latestLedgerMonth();
  const monthEntries = state.ledgerEntries.filter((entry) => String(entry.date).startsWith(period));
  const ledger = ledgerSummary(monthEntries);
  const goalRate = state.financialGoal ? (assets.financial / state.financialGoal) * 100 : 0;
  const remaining = Math.max(state.financialGoal - assets.financial, 0);
  const startIndex = monthSerial(state.financialGoalStartMonth);
  const endIndex = monthSerial(state.financialGoalEndMonth);
  const currentIndex = monthSerial(todayMonth());
  const totalMonths = Math.max(endIndex - startIndex, 1);
  const elapsedMonths = Math.min(Math.max(currentIndex - startIndex, 0), totalMonths);
  const elapsedRate = (elapsedMonths / totalMonths) * 100;
  const remainingMonths = Math.max(endIndex - currentIndex, 0);
  const remainingPeriodRate = Math.max(100 - elapsedRate, 0);
  const paceGap = goalRate - elapsedRate;

  setText("homeNetWorth", money(assets.netWorth));
  setText("homeRealEstate", money(assets.realEstate));
  setText("homeFinancial", money(assets.financial));
  setText("homeDebt", money(assets.debt));
  setText("homeMeritzW", money(assets.portfolio.excludedValueKrw));
  setText("financialGoalProgress", percent(goalRate));
  setText("financialGoalAmount", `${money(assets.financial)} / ${money(state.financialGoal)}`);
  setText("financialGoalPeriod", `${remainingMonths}개월`);
  setText(
    "financialGoalRemaining",
    remainingMonths > 0 ? `${state.financialGoalEndMonth.replace("-", "년 ")}월까지` : "목표 기간이 끝났어요"
  );
  setText(
    "financialGoalPace",
    remaining > 0
      ? `목표까지 ${money(remaining)} · 기간 진도보다 ${Math.abs(paceGap).toFixed(1)}%p ${paceGap >= 0 ? "앞서 있어요" : "뒤에 있어요"}`
      : "금융자산 목표를 달성했어요"
  );
  document.getElementById("financialGoalBar").style.width = `${Math.min(goalRate, 100)}%`;
  document.getElementById("financialPeriodBar").style.width = `${Math.min(remainingPeriodRate, 100)}%`;
  setText("homeIncome", money(ledger.income));
  setText("homeExpense", money(ledger.expense));
  setText("homeBalance", money(ledger.balance));

  renderMonthlyManagement();
  renderMarketCards();
  renderWatchQuotes();
}

function monthSerial(value) {
  const [year, month] = String(value || todayMonth()).split("-").map(Number);
  return year * 12 + (month || 1) - 1;
}

function renderMarketCards() {
  const grid = document.getElementById("marketGrid");
  grid.innerHTML = "";

  MARKET_CONFIG.forEach((config, index) => {
    const quote = quoteFor(config.symbol);
    const card = document.createElement("article");
    card.className = "market-card";
    const value = formatMarketValue(config, quote?.price);
    card.innerHTML = `
      <div>
        <span>${config.label}</span>
        <strong>${value}</strong>
        <small class="${changeClass(quote?.changePct || 0)}">${quote ? percent(quote.changePct || 0, true) : "데이터 대기"}</small>
      </div>
      <canvas id="marketSpark-${index}" width="130" height="72" aria-label="${config.label} 추이"></canvas>
    `;
    grid.appendChild(card);
  });

  requestAnimationFrame(() => {
    MARKET_CONFIG.forEach((config, index) => {
      const quote = quoteFor(config.symbol);
      drawSparkline(document.getElementById(`marketSpark-${index}`), quote?.history?.map((point) => point.close) || []);
    });
  });
}

function formatMarketValue(config, value) {
  if (!Number.isFinite(Number(value))) return "-";
  const number = Number(value);
  if (config.kind === "krw") return `${number.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}원`;
  if (config.kind === "usd") return `$${number.toFixed(5)}`;
  if (config.kind === "jpy") return `${(number * 100).toLocaleString("ko-KR", { maximumFractionDigits: 2 })}원`;
  return number.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function renderWatchQuotes() {
  const grid = document.getElementById("watchQuoteGrid");
  grid.innerHTML = "";
  WATCH_SYMBOLS.forEach((symbol) => {
    const quote = quoteFor(symbol);
    const high = Number(quote?.allTimeHigh) || 0;
    const drawdown = quote?.price && high ? ((Number(quote.price) - high) / high) * 100 : 0;
    const isAlert = drawdown <= -15;
    const owned = state.stockHoldings.filter((item) => item.ticker === symbol);
    const ownedQuantity = sum(owned, (item) => item.quantity);
    const averagePrice = ownedQuantity
      ? sum(owned, (item) => item.quantity * item.purchasePrice) / ownedQuantity
      : 0;
    const card = document.createElement("article");
    card.className = `quote-card${isAlert ? " quote-alert" : ""}`;
    card.innerHTML = `
      <div class="quote-card-heading"><span>${symbol}</span>${ownedQuantity ? `<small class="owned-badge">보유 중</small>` : ""}</div>
      <strong>${quote ? usd(quote.price) : "-"}</strong>
      <small class="ath-change">전고점 대비 ${high ? percent(drawdown, true) : "확인 중"}</small>
      ${ownedQuantity ? `<small class="average-price">내 평단 ${usd(averagePrice)}</small>` : ""}
    `;
    grid.appendChild(card);
  });
}

function renderLedger() {
  const months = [
    ...new Set([
      ...state.ledgerEntries.map((entry) => String(entry.date || "").slice(0, 7)).filter(Boolean),
      ...Object.keys(state.monthlyClosings || {}),
      todayMonth()
    ])
  ].sort().reverse();
  if (!months.includes(selectedLedgerMonth)) selectedLedgerMonth = months[0] || todayMonth();
  const monthFilter = document.getElementById("ledgerMonthFilter");
  monthFilter.innerHTML = months.map((month) => `<option value="${month}">${month.replace("-", "년 ")}월</option>`).join("");
  monthFilter.value = selectedLedgerMonth;
  const period = selectedLedgerMonth;
  const periodEntries = state.ledgerEntries.filter((entry) => String(entry.date).startsWith(period));
  const summary = ledgerSummary(periodEntries);
  const visible =
    currentLedgerFilter === "all"
      ? periodEntries
      : periodEntries.filter((entry) => entry.type === currentLedgerFilter);
  const sortedVisible = [...visible].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const totalPages = Math.max(Math.ceil(sortedVisible.length / LEDGER_PAGE_SIZE), 1);
  ledgerPage = Math.min(Math.max(ledgerPage, 1), totalPages);
  const pageRows = sortedVisible.slice((ledgerPage - 1) * LEDGER_PAGE_SIZE, ledgerPage * LEDGER_PAGE_SIZE);

  setText("ledgerIncome", money(summary.income));
  setText("ledgerExpense", money(summary.expense));
  setText("ledgerSaving", money(summary.saving));
  setText("ledgerBalance", money(summary.balance));
  setText("ledgerSpendRate", percent(summary.spendRate));
  setText("ledgerIncomeCount", `${periodEntries.filter((entry) => entry.type === "수입").length}건 · ${period.replace("-", "년 ")}월`);
  setText("ledgerExpenseRate", `수입의 ${percent(summary.spendRate)}`);
  setText("ledgerSavingRate", `저축률 ${percent(summary.savingRate)}`);
  setText("ledgerCount", `${visible.length.toLocaleString("ko-KR")}건 · ${ledgerPage}/${totalPages}`);
  const ledgerUnlocked = !state.editorLocks.ledger;
  const lockButton = document.getElementById("ledgerEditToggle");
  lockButton.setAttribute("aria-pressed", String(ledgerUnlocked));
  lockButton.textContent = ledgerUnlocked ? "수정 가능" : "수정 잠금";
  document.getElementById("deleteSelectedLedgerBtn").disabled = selectedLedgerIds.size === 0;
  renderLedgerMonthlyClose(period);

  document.querySelectorAll("[data-ledger-filter]").forEach((button) => {
    button.classList.toggle("active", button.dataset.ledgerFilter === currentLedgerFilter);
  });

  const body = document.getElementById("ledgerTableBody");
  body.innerHTML = "";
  pageRows.forEach((entry) => {
      const index = state.ledgerEntries.indexOf(entry);
      const row = document.createElement("tr");
      row.classList.toggle("editable-row", ledgerUnlocked);
      row.innerHTML = `
        <td class="select-cell"><input type="checkbox" data-select-ledger="${entry.id}" aria-label="${escapeHtml(entry.category || "내역")} 선택" ${selectedLedgerIds.has(entry.id) ? "checked" : ""} /></td>
        <td>${ledgerUnlocked ? editableInput("ledger", index, "date", entry.date, "date") : String(entry.date || "").replaceAll("-", ".")}</td>
        <td>${ledgerUnlocked ? editableSelect("ledger", index, "type", entry.type, ["수입", "지출(고정)", "지출(변동)", "저축"]) : `<span class="entry-type ${ledgerTypeClass(entry.type)}">${entry.type || ""}</span>`}</td>
        <td>${ledgerUnlocked ? editableInput("ledger", index, "category", entry.category) : escapeHtml(entry.category || "")}</td>
        <td class="number-cell">${ledgerUnlocked ? editableInput("ledger", index, "amount", entry.amount, "krw") : fullMoney(entry.amount)}</td>
        <td>${ledgerUnlocked ? editableInput("ledger", index, "payment", entry.payment) : escapeHtml(entry.payment || "-")}</td>
        <td>${ledgerUnlocked ? editableInput("ledger", index, "memo", entry.memo) : escapeHtml(entry.memo || "")}</td>
        <td><button class="row-remove" data-remove-ledger="${index}" title="삭제" aria-label="삭제">×</button></td>
      `;
      body.appendChild(row);
    });

  if (!visible.length) {
    body.innerHTML = tableEmptyState(8, "아직 입력된 데이터가 없어요", "이번 달 가계부를 입력하면 자동 계산돼요.", "ledgerModal");
  }

  const visibleIds = pageRows.map((entry) => entry.id);
  const selectAll = document.getElementById("selectAllLedger");
  selectAll.checked = visibleIds.length > 0 && visibleIds.every((id) => selectedLedgerIds.has(id));
  selectAll.indeterminate = visibleIds.some((id) => selectedLedgerIds.has(id)) && !selectAll.checked;

  renderPagination("ledgerPagination", ledgerPage, totalPages, "ledger");
  renderVariableBudget(periodEntries, period);
  renderLedgerCharts();
}

function renderVariableBudget(entries, month) {
  const budget = Number(state.variableBudgets[month]) || 0;
  const spent = sum(entries.filter((entry) => entry.type === "지출(변동)"));
  const spendRate = budget ? (spent / budget) * 100 : 0;
  const now = new Date();
  const [year, monthNumber] = month.split("-").map(Number);
  const daysInMonth = new Date(year, monthNumber, 0).getDate();
  const monthIndex = monthSerial(month);
  const currentIndex = monthSerial(todayMonth());
  const elapsedDays = monthIndex < currentIndex ? daysInMonth : monthIndex > currentIndex ? 0 : Math.min(now.getDate(), daysInMonth);
  const elapsedRate = (elapsedDays / daysInMonth) * 100;
  const panel = document.getElementById("variableBudgetPanel");
  panel.classList.toggle("budget-warning", budget > 0 && spendRate >= 100);
  document.getElementById("variableBudgetInput").value = budget ? budget.toLocaleString("ko-KR") : "";
  setText(
    "variableBudgetStatus",
    !budget ? "예산을 설정해 주세요" : spendRate >= 100 ? `예산 소진 · 초과 ${percent(spendRate - 100)}` : `${percent(spendRate)} 사용`
  );
  setText("variableBudgetSpent", budget ? `${money(spent)} / ${money(budget)}` : `${money(spent)} 사용`);
  setText("variableBudgetPace", `기간 ${percent(elapsedRate)} · 소진 ${percent(spendRate)}`);
  const bar = document.getElementById("variableBudgetBar");
  bar.style.width = `${Math.min(spendRate, 100)}%`;
  bar.classList.toggle("over", budget > 0 && spendRate >= 100);
}

function copyFixedEntriesToNextMonth() {
  const sourceMonth = selectedLedgerMonth || latestLedgerMonth();
  const targetMonth = nextMonth(sourceMonth);
  const fixedEntries = state.ledgerEntries.filter((entry) => String(entry.date || "").startsWith(sourceMonth) && entry.type === FIXED_EXPENSE_TYPE);
  if (!fixedEntries.length) {
    showToast("복사할 고정지출 내역이 없어요.");
    return;
  }

  let added = 0;
  fixedEntries.forEach((entry) => {
    const copiedDate = moveDateToMonth(entry.date, targetMonth);
    const exists = state.ledgerEntries.some(
      (item) =>
        item.type === FIXED_EXPENSE_TYPE &&
        item.date === copiedDate &&
        item.category === entry.category &&
        item.payment === entry.payment &&
        Number(item.amount || 0) === Number(entry.amount || 0)
    );
    if (exists) return;
    state.ledgerEntries.push({
      ...entry,
      id: uid("ledger"),
      date: copiedDate,
      memo: entry.memo || ""
    });
    added += 1;
  });

  selectedLedgerMonth = targetMonth;
  ledgerPage = 1;
  selectedLedgerIds.clear();
  saveState();
  renderAll();
  showToast(added ? `${targetMonth.replace("-", "년 ")}월에 고정지출 ${added}건을 복사했어요.` : "이미 같은 고정지출이 입력돼 있어요.");
}

function renderPagination(containerId, page, totalPages, scope) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages].filter((value) => value >= 1 && value <= totalPages))];
  container.innerHTML = `
    <button data-page-scope="${scope}" data-page="${page - 1}" aria-label="이전 페이지" ${page === 1 ? "disabled" : ""}>‹</button>
    ${pages.map((value) => `<button data-page-scope="${scope}" data-page="${value}" class="${value === page ? "active" : ""}" aria-label="${value}페이지">${value}</button>`).join("")}
    <button data-page-scope="${scope}" data-page="${page + 1}" aria-label="다음 페이지" ${page === totalPages ? "disabled" : ""}>›</button>
  `;
}

function editableInput(scope, index, field, value, type = "text") {
  const isKrw = type === "krw";
  const displayValue = isKrw ? Number(value || 0).toLocaleString("ko-KR") : value ?? "";
  return `<input class="editable-control${isKrw ? " krw-input" : ""}" type="${isKrw ? "text" : type}" ${isKrw ? 'inputmode="numeric"' : ""} data-edit-scope="${scope}" data-edit-index="${index}" data-edit-field="${field}" value="${escapeHtml(displayValue)}" />`;
}

function editableSelect(scope, index, field, value, options) {
  const available = options.includes(value) ? options : [value, ...options];
  return `<select class="editable-control" data-edit-scope="${scope}" data-edit-index="${index}" data-edit-field="${field}">${available
    .map((option) => `<option value="${escapeHtml(option)}" ${option === value ? "selected" : ""}>${escapeHtml(option)}</option>`)
    .join("")}</select>`;
}

function ledgerTypeClass(type) {
  if (type === "수입") return "income-entry";
  if (type === "저축") return "saving-entry";
  if (type === "지출(고정)") return "fixed-entry";
  return "variable-entry";
}

function renderLedgerCharts() {
  const monthly = new Map();
  state.ledgerEntries.forEach((entry) => {
    const month = String(entry.date || "").slice(0, 7);
    if (!month) return;
    if (!monthly.has(month)) monthly.set(month, []);
    monthly.get(month).push(entry);
  });
  const latestMonth = selectedLedgerMonth || latestLedgerMonth();
  const latestSerial = monthSerial(latestMonth);
  const months = Array.from({ length: 6 }, (_, index) => monthFromSerial(latestSerial - 5 + index));
  const summaries = months.map((month) => ledgerSummary(monthly.get(month) || []));

  drawGroupedBars(
    document.getElementById("ledgerTrendChart"),
    months.map(formatMonthLabel),
    [
      { label: "수입", color: css("--chart-green"), values: summaries.map((item) => item.income) },
      { label: "지출", color: css("--chart-red"), values: summaries.map((item) => item.expense) },
      { label: "저축", color: css("--chart-blue"), values: summaries.map((item) => item.saving) }
    ]
  );

  const year = latestMonth.slice(0, 4);
  const latestMonthNumber = Number(latestMonth.slice(5, 7));
  const yearMonths = Array.from({ length: latestMonthNumber }, (_, index) => `${year}-${String(index + 1).padStart(2, "0")}`);
  let cumulativeIncome = 0;
  let cumulativeExpense = 0;
  let cumulativeSaving = 0;
  const cumulative = yearMonths.map((month) => {
    const summary = ledgerSummary(monthly.get(month) || []);
    cumulativeIncome += summary.income;
    cumulativeExpense += summary.expense;
    cumulativeSaving += summary.saving;
    return { income: cumulativeIncome, expense: cumulativeExpense, saving: cumulativeSaving };
  });
  drawLineChart(
    document.getElementById("ledgerYtdChart"),
    yearMonths.map(formatMonthLabel),
    [
      { label: "누적 수입", color: css("--chart-green"), values: cumulative.map((item) => item.income) },
      { label: "누적 지출", color: css("--chart-red"), values: cumulative.map((item) => item.expense) },
      { label: "누적 저축", color: css("--chart-blue"), values: cumulative.map((item) => item.saving) }
    ]
  );

  const latest = monthly.get(latestMonth) || [];
  const fixed = groupLedgerCategories(latest.filter((entry) => entry.type === FIXED_EXPENSE_TYPE));
  const variable = groupLedgerCategories(
    latest.filter((entry) => entry.type === VARIABLE_EXPENSE_TYPE && !VARIABLE_CHART_EXCLUDED_CATEGORIES.includes(entry.category))
  );
  const latestSummary = ledgerSummary(latest);
  drawDonut("fixedExpenseDonut", "fixedExpenseLegend", [...fixed.entries()], "고정지출");
  drawDonut("variableExpenseDonut", "variableExpenseLegend", [...variable.entries()], "변동지출");
  drawDonut(
    "savingsDonut",
    "savingsLegend",
    [
      ["저축·투자", latestSummary.saving],
      ["저축 외 수입", Math.max(latestSummary.income - latestSummary.saving, 0)]
    ],
    "저축률"
  );
}

function monthFromSerial(serial) {
  const year = Math.floor(serial / 12);
  const month = (serial % 12) + 1;
  return `${year}-${String(month).padStart(2, "0")}`;
}

function nextMonth(month) {
  return monthFromSerial(monthSerial(month) + 1);
}

function moveDateToMonth(date, month) {
  const day = Number(String(date || "").slice(8, 10)) || 1;
  const [year, monthNumber] = month.split("-").map(Number);
  const lastDay = new Date(year, monthNumber, 0).getDate();
  return `${month}-${String(Math.min(day, lastDay)).padStart(2, "0")}`;
}

function groupLedgerCategories(entries) {
  const categories = new Map();
  entries.forEach((entry) => {
    const key = entry.category || "미분류";
    categories.set(key, (categories.get(key) || 0) + Number(entry.amount || 0));
  });
  return categories;
}

function renderStocks() {
  const portfolio = portfolioSnapshot();
  recordStockValueSnapshot(portfolio);
  setText("stockTotalValue", money(portfolio.valueKrw));
  setText("stockTotalUsd", usd(portfolio.valueUsd));
  setText("stockTotalProfit", money(portfolio.profitKrw));
  setText("stockTotalReturn", `총 수익률 ${percent(portfolio.returnRate, true)}`);
  setText("stockAnnualDividend", money(portfolio.annualDividendKrw));
  setText("stockDividendYield", `현재가 기준 ${percent(portfolio.dividendYield)}`);
  setText("stockMeritzWValue", money(portfolio.excludedValueKrw));
  setText("stockCount", `${portfolio.included.length}종목`);
  setText("stockFxRate", `적용 환율 1 USD = ${usdKrwRate().toLocaleString("ko-KR", { maximumFractionDigits: 2 })}원`);
  renderStockCashBalances(portfolio);
  const stockUnlocked = !state.editorLocks.stocks;
  const stockLockButton = document.getElementById("stockEditToggle");
  stockLockButton.setAttribute("aria-pressed", String(stockUnlocked));
  stockLockButton.textContent = stockUnlocked ? "수정 가능" : "수정 잠금";
  document.getElementById("stockSort").value = stockSort;

  const sorted = [...portfolio.included].sort((a, b) => {
    if (stockSort === "added") return (a.createdAt || 0) - (b.createdAt || 0);
    if (stockSort === "return") return b.returnRate - a.returnRate;
    if (stockSort === "profit") return b.profitKrw - a.profitKrw;
    if (stockSort === "value") return b.valueKrw - a.valueKrw;
    return a.ticker.localeCompare(b.ticker);
  });
  const totalPages = Math.max(Math.ceil(sorted.length / STOCK_PAGE_SIZE), 1);
  stockPage = Math.min(Math.max(stockPage, 1), totalPages);
  const pageRows = sorted.slice((stockPage - 1) * STOCK_PAGE_SIZE, stockPage * STOCK_PAGE_SIZE);

  const body = document.getElementById("stockTableBody");
  body.innerHTML = "";
  pageRows.forEach((item) => {
    const originalIndex = state.stockHoldings.findIndex((holding) => holding.id === item.id);
    const row = document.createElement("tr");
    row.classList.toggle("editable-row", stockUnlocked);
    row.innerHTML = `
      <td class="ticker-cell">${stockUnlocked ? `<div class="ticker-edit-stack">${editableSelect("stocks", originalIndex, "country", item.country, ["US", "KR"])}${editableInput("stocks", originalIndex, "ticker", item.ticker)}</div>` : `<strong>${countryFlag(item.country)} ${escapeHtml(item.ticker)}</strong><span>${escapeHtml(item.shortName)}</span>`}</td>
      <td>${stockUnlocked ? editableSelect("stocks", originalIndex, "account", item.account, state.inputOptions.stockAccounts) : escapeHtml(item.account)}</td>
      <td class="number-cell">${stockUnlocked ? editableInput("stocks", originalIndex, "quantity", item.quantity, "number") : item.quantity.toLocaleString("ko-KR", { maximumFractionDigits: 4 })}</td>
        <td class="number-cell">${stockUnlocked ? editableInput("stocks", originalIndex, "purchasePrice", item.purchasePrice, item.country === "KR" ? "krw" : "number") : localPrice(item.purchasePrice, item.country)}</td>
      <td class="number-cell">${item.hasPrice ? localPrice(item.currentPrice, item.country) : "대기"}</td>
      <td class="number-cell"><span class="dual-currency"><strong>${usd(item.valueUsd)}</strong><small>(${fullMoney(item.valueKrw)})</small></span></td>
      <td class="number-cell ${changeClass(item.returnRate)}">${percent(item.returnRate, true)}</td>
      <td class="number-cell ${changeClass(item.profitKrw)}"><span class="dual-currency"><strong>${usd(item.profitUsd)}</strong><small>(${fullMoney(item.profitKrw)})</small></span></td>
      <td>${item.dividendMonths.length ? item.dividendMonths.map((month) => `${month}월`).join(" · ") : "-"}</td>
      <td class="number-cell">${percent(item.yieldOnCost)}</td>
      <td><button class="row-remove" data-remove-stock="${originalIndex}" title="삭제" aria-label="삭제">×</button></td>
    `;
    body.appendChild(row);
  });
  if (!sorted.length) body.innerHTML = tableEmptyState(11, "아직 입력된 주식이 없어요", "주식 보유 데이터를 입력하면 투자 건전성이 자동 계산돼요.", "stockModal");
  renderPagination("stockPagination", stockPage, totalPages, "stocks");

  renderStockTreemap(portfolio.holdings);
  renderPortfolioDonuts(portfolio.included);
  renderStockGrowthCharts();
  renderStockTransactions();
  renderMeritzW(portfolio.excluded);
}

function renderStockCashBalances(portfolio = portfolioSnapshot()) {
  const grid = document.getElementById("stockCashGrid");
  if (!grid) return;
  grid.innerHTML = "";
  portfolio.cashBalances.forEach((balance) => {
    const card = document.createElement("section");
    card.className = `stock-cash-card${balance.excluded ? " excluded" : ""}`;
    card.innerHTML = `
      <div>
        <span>${escapeHtml(balance.account)}</span>
        <small>${balance.currency === "USD" ? "Dollar Cash" : "KRW Cash"}${balance.excluded ? " · 합산 제외" : ""}</small>
      </div>
      <strong>${formatStockCashAmount(balance)}</strong>
      <small>${balance.currency === "USD" ? money(balance.valueKrw) : "원화 예수금"}${balance.updatedAt ? ` · ${new Date(balance.updatedAt).toLocaleDateString("ko-KR")}` : ""}</small>
    `;
    grid.appendChild(card);
  });
}

function fillStockCashForm() {
  const form = document.getElementById("stockCashForm");
  STOCK_CASH_CONFIG.forEach((config) => {
    const input = form.elements[config.account];
    const balance = state.stockCashBalances?.[config.account] || {};
    if (!input) return;
    input.value = config.currency === "KRW"
      ? (Number(balance.amount) ? Number(balance.amount).toLocaleString("ko-KR") : "")
      : (Number(balance.amount) ? String(Number(balance.amount)) : "");
  });
}

function recordStockValueSnapshot(portfolio) {
  const month = todayMonth();
  if (month < "2026-06") return;
  const snapshot = {
    included: Math.round(portfolio.valueKrw),
    excluded: Math.round(portfolio.excludedValueKrw)
  };
  let changed = false;
  if (!state.stockValueHistory["2026-06"]) {
    state.stockValueHistory["2026-06"] = snapshot;
    changed = true;
  }
  const previous = state.stockValueHistory[month];
  if (!previous || previous.included !== snapshot.included || previous.excluded !== snapshot.excluded) {
    state.stockValueHistory[month] = snapshot;
    changed = true;
  }
  if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function renderStockGrowthCharts() {
  const entries = Object.entries(state.stockValueHistory)
    .filter(([month]) => month >= "2026-06")
    .sort(([a], [b]) => a.localeCompare(b));
  const labels = entries.map(([month]) => formatMonthLabel(month));
  drawLineChart(document.getElementById("stockGrowthChart"), labels, [
    { label: "합산 자산", color: css("--chart-blue"), values: entries.map(([, value]) => value.included) }
  ]);
  drawLineChart(document.getElementById("meritzWGrowthChart"), labels, [
    { label: "평가액", color: css("--chart-cyan"), values: entries.map(([, value]) => value.excluded) },
    { label: "누적 투자원금", color: css("--chart-violet"), values: meritzWPrincipalByMonth(entries.map(([month]) => month)) }
  ]);
}

function meritzWPrincipalByMonth(months) {
  const transactions = state.stockTransactions.filter((item) => item.account === excludedStockAccount());
  const currentCost = sum(portfolioSnapshot().excluded, (item) => item.costKrw);
  const totalDelta = sum(transactions, (item) => item.type === "buy" ? item.costBasisKrw : -item.costBasisKrw);
  const openingCost = Math.max(currentCost - totalDelta, 0);
  return months.map((month) => {
    const change = sum(
      transactions.filter((item) => String(item.date).slice(0, 7) <= month),
      (item) => item.type === "buy" ? item.costBasisKrw : -item.costBasisKrw
    );
    return Math.max(openingCost + change, 0);
  });
}

function renderStockTransactions() {
  const body = document.getElementById("tradeTableBody");
  const transactions = [...state.stockTransactions].sort(
    (a, b) => String(b.date).localeCompare(String(a.date)) || b.createdAt - a.createdAt
  );
  setText("tradeCount", `${transactions.length}건`);
  body.innerHTML = transactions.map((item) => `
    <tr>
      <td>${String(item.date).replaceAll("-", ".")}</td>
      <td><span class="trade-badge ${item.type === "buy" ? "trade-buy" : "trade-sell"}">${item.type === "buy" ? "매수" : "매도"}</span></td>
      <td class="ticker-cell"><strong>${countryFlag(item.country)} ${escapeHtml(item.ticker)}</strong></td>
      <td>${escapeHtml(item.account)}</td>
      <td class="number-cell">${item.quantity.toLocaleString("ko-KR", { maximumFractionDigits: 4 })}</td>
      <td class="number-cell">${localPrice(item.price, item.country)}</td>
      <td class="number-cell">${fullMoney(item.amountKrw)}</td>
      <td class="number-cell ${changeClass(item.realizedProfitKrw)}">${item.type === "sell" ? fullMoney(item.realizedProfitKrw) : "-"}</td>
      <td>${escapeHtml(item.memo || "-")}</td>
    </tr>
  `).join("");
  if (!transactions.length) body.innerHTML = tableEmptyState(9, "매수·매도 기록이 아직 없어요", "거래를 기록하면 실현손익과 투자 흐름이 정리돼요.", "tradeModal");
}

function renderStockTreemap(holdings) {
  const container = document.getElementById("stockTreemap");
  const items = holdings
    .filter((item) => item.valueKrw > 0)
    .sort((a, b) => b.valueKrw - a.valueKrw);
  if (!items.length) {
    container.innerHTML = richEmptyState("아직 입력된 데이터가 없어요", "주식 보유 데이터를 입력하면 종목별 비중이 표시돼요.", "주식 입력하기", "stocks");
    return;
  }
  const rectangles = [];
  splitTreemap(items, 0, 0, 100, 100, rectangles);
  container.innerHTML = rectangles.map(({ item, x, y, width, height }) => {
    const move = Number(item.quote?.changePct) || 0;
    const intensity = Math.min(0.84, 0.34 + Math.abs(move) / 18);
    const color = move > 0 ? `rgba(239, 142, 153, ${intensity})` : move < 0 ? `rgba(116, 166, 231, ${intensity})` : "rgba(170, 184, 199, 0.65)";
    return `<div class="treemap-item" style="left:${x}%;top:${y}%;width:${width}%;height:${height}%;background:${color}" title="${escapeHtml(item.ticker)} ${percent(move, true)}">
      <strong>${escapeHtml(item.ticker)}</strong>
      <span>${percent(move, true)}</span>
      <small>${money(item.valueKrw)}</small>
    </div>`;
  }).join("");
}

function splitTreemap(items, x, y, width, height, output) {
  if (items.length === 1) {
    output.push({ item: items[0], x, y, width, height });
    return;
  }
  const total = sum(items, (item) => item.valueKrw);
  let running = 0;
  let splitIndex = 1;
  for (let index = 0; index < items.length - 1; index += 1) {
    running += items[index].valueKrw;
    splitIndex = index + 1;
    if (running >= total / 2) break;
  }
  const first = items.slice(0, splitIndex);
  const second = items.slice(splitIndex);
  const ratio = sum(first, (item) => item.valueKrw) / total;
  if (width >= height) {
    const firstWidth = width * ratio;
    splitTreemap(first, x, y, firstWidth, height, output);
    splitTreemap(second, x + firstWidth, y, width - firstWidth, height, output);
  } else {
    const firstHeight = height * ratio;
    splitTreemap(first, x, y, width, firstHeight, output);
    splitTreemap(second, x, y + firstHeight, width, height - firstHeight, output);
  }
}

function renderPortfolioDonuts(holdings) {
  const sectors = new Map();
  holdings.forEach((item) => {
    sectors.set(item.sector, (sectors.get(item.sector) || 0) + item.valueKrw);
  });
  drawDonut("sectorDonut", "sectorLegend", [...sectors.entries()].sort((a, b) => b[1] - a[1]), "섹터");
  renderAccountAllocations(holdings);
}

function renderAccountAllocations(holdings) {
  const grid = document.getElementById("accountAllocationGrid");
  grid.innerHTML = "";
  state.inputOptions.stockAccounts.filter((account) => account !== excludedStockAccount()).forEach((account) => {
    const accountItems = holdings.filter((item) => item.account === account);
    const accountCash = stockCashBalances().find((item) => item.account === account);
    const cashValue = accountCash?.valueKrw || 0;
    const total = sum(accountItems, (item) => item.valueKrw) + cashValue;
    const grouped = new Map();
    accountItems.forEach((item) => grouped.set(item.ticker, (grouped.get(item.ticker) || 0) + item.valueKrw));
    const card = document.createElement("section");
    card.className = "account-allocation-card";
    const chartId = `accountDonut-${account.replace(/[^a-zA-Z0-9가-힣]/g, "")}`;
    const legendId = `${chartId}-legend`;
    card.innerHTML = `
      <div class="account-card-heading"><strong>${account}</strong><span>${money(total)} · 예수금 ${accountCash ? formatStockCashAmount(accountCash) : "-"}</span></div>
      <div class="account-donut-layout">
        <canvas id="${chartId}" width="170" height="170" aria-label="${account} 계좌 내 종목 비중"></canvas>
        <div class="chart-legend compact-legend" id="${legendId}"></div>
      </div>
    `;
    grid.appendChild(card);
    requestAnimationFrame(() => drawDonut(chartId, legendId, [...grouped.entries()].sort((a, b) => b[1] - a[1]), account));
  });
}

function renderMeritzW(items) {
  const list = document.getElementById("meritzWList");
  const body = document.getElementById("meritzWTableBody");
  list.innerHTML = "";
  body.innerHTML = "";
  setText("meritzWCount", `${items.length}종목`);
  const stockUnlocked = !state.editorLocks.stocks;
  items.forEach((item) => {
    const originalIndex = state.stockHoldings.findIndex((holding) => holding.id === item.id);
    const card = document.createElement("div");
    card.className = "separate-item";
    const displayValue = item.country === "KR" ? fullMoney(item.valueKrw) : `${usd(item.valueUsd)} (${money(item.valueKrw)})`;
    const displayCost = item.country === "KR" ? fullMoney(item.costKrw) : `${usd(item.costUsd)} (${money(item.costKrw)})`;
    card.innerHTML = `
      <div><strong>${countryFlag(item.country)} ${escapeHtml(item.ticker)}</strong><span>${item.quantity.toLocaleString("ko-KR")}주</span></div>
      <div><span>자산가치</span><strong>${displayValue}</strong></div>
      <div><span>매입금액</span><strong>${displayCost}</strong></div>
      <div><span>수익률</span><strong class="${changeClass(item.returnRate)}">${percent(item.returnRate, true)}</strong></div>
    `;
    list.appendChild(card);

    const row = document.createElement("tr");
    row.classList.toggle("editable-row", stockUnlocked);
    row.innerHTML = `
      <td class="ticker-cell">${stockUnlocked ? `<div class="ticker-edit-stack">${editableSelect("stocks", originalIndex, "country", item.country, ["US", "KR"])}${editableInput("stocks", originalIndex, "ticker", item.ticker)}</div>` : `<strong>${countryFlag(item.country)} ${escapeHtml(item.ticker)}</strong><span>${escapeHtml(item.shortName)}</span>`}</td>
      <td>${stockUnlocked ? editableSelect("stocks", originalIndex, "account", item.account, state.inputOptions.stockAccounts) : escapeHtml(item.account)}</td>
      <td class="number-cell">${stockUnlocked ? editableInput("stocks", originalIndex, "quantity", item.quantity, "number") : item.quantity.toLocaleString("ko-KR", { maximumFractionDigits: 4 })}</td>
      <td class="number-cell">${stockUnlocked ? editableInput("stocks", originalIndex, "purchasePrice", item.purchasePrice, item.country === "KR" ? "krw" : "number") : localPrice(item.purchasePrice, item.country)}</td>
      <td class="number-cell">${item.hasPrice ? localPrice(item.currentPrice, item.country) : "대기"}</td>
      <td class="number-cell"><span class="dual-currency"><strong>${usd(item.valueUsd)}</strong><small>(${fullMoney(item.valueKrw)})</small></span></td>
      <td class="number-cell ${changeClass(item.returnRate)}">${percent(item.returnRate, true)}</td>
      <td class="number-cell ${changeClass(item.profitKrw)}"><span class="dual-currency"><strong>${usd(item.profitUsd)}</strong><small>(${fullMoney(item.profitKrw)})</small></span></td>
      <td>${item.dividendMonths.length ? item.dividendMonths.map((month) => `${month}월`).join(" · ") : "-"}</td>
      <td class="number-cell">${percent(item.yieldOnCost)}</td>
      <td><button class="row-remove" data-remove-stock="${originalIndex}" title="삭제" aria-label="삭제">×</button></td>
    `;
    body.appendChild(row);
  });
  if (!items.length) {
    list.innerHTML = richEmptyState("메리츠W 보유 종목이 없어요", "준원계좌 종목을 입력하면 장기 시나리오가 표시돼요.", "주식 입력하기", "stocks");
    body.innerHTML = tableEmptyState(11, "메리츠W 보유 종목이 없어요", "준원계좌 종목을 입력하면 장기 시나리오가 표시돼요.", "stockModal");
  }
}

function renderAssets() {
  const assets = assetSnapshot();
  const realRatio = assets.grossAssets ? (assets.realEstate / assets.grossAssets) * 100 : 0;
  const financialRatio = assets.grossAssets ? (assets.financial / assets.grossAssets) * 100 : 0;
  const vehicleRatio = assets.grossAssets ? (assets.vehicle / assets.grossAssets) * 100 : 0;
  const debtRatio = assets.grossAssets ? (assets.debt / assets.grossAssets) * 100 : 0;

  setText("assetNetWorth", money(assets.netWorth));
  setText("assetRealEstate", money(assets.realEstate));
  setText("assetFinancial", money(assets.financial));
  setText("assetVehicle", money(assets.vehicle));
  setText("assetDebt", money(assets.debt));
  setText("assetRealEstateRatio", `총자산의 ${percent(realRatio)}`);
  setText("assetFinancialRatio", `총자산의 ${percent(financialRatio)}`);
  setText("assetVehicleRatio", `총자산의 ${percent(vehicleRatio)}`);
  setText("assetDebtRatio", `자산 대비 ${percent(debtRatio)}`);
  const assetUnlocked = !state.editorLocks.assets;
  const assetLockButton = document.getElementById("assetEditToggle");
  assetLockButton.setAttribute("aria-pressed", String(assetUnlocked));
  assetLockButton.textContent = assetUnlocked ? "수정 가능" : "수정 잠금";

  drawDonut(
    "assetDonut",
    "assetLegend",
    [
      ["부동산", assets.realEstate],
      ["금융자산", assets.financial],
      ["차량", assets.vehicle],
      ["부채", assets.debt]
    ],
    "구성"
  );

  renderAssetTable(assets);
  renderAssetTrend(assets.portfolio.valueKrw);
}

function renderAssetTable(assets) {
  const assetUnlocked = !state.editorLocks.assets;
  const rows = [...state.assetItems].sort((a, b) => {
    const order = { realEstate: 0, financial: 1, vehicle: 2, debt: 3 };
    return b.month.localeCompare(a.month) || order[assetCategoryType(a.category)] - order[assetCategoryType(b.category)] || b.amount - a.amount;
  });
  const totalPages = Math.max(Math.ceil((rows.length + 1) / ASSET_PAGE_SIZE), 1);
  assetPage = Math.min(Math.max(assetPage, 1), totalPages);
  const pageStart = assetPage === 1 ? 0 : ASSET_PAGE_SIZE - 1 + (assetPage - 2) * ASSET_PAGE_SIZE;
  const pageSize = assetPage === 1 ? ASSET_PAGE_SIZE - 1 : ASSET_PAGE_SIZE;
  const pageRows = rows.slice(pageStart, pageStart + pageSize);
  const body = document.getElementById("assetTableBody");
  body.innerHTML = "";
  pageRows.forEach((item) => {
    const originalIndex = state.assetItems.findIndex((entry) => entry.id === item.id);
    const row = document.createElement("tr");
    row.classList.toggle("editable-row", assetUnlocked);
    row.innerHTML = `
      <td>${assetUnlocked ? editableInput("assets", originalIndex, "month", item.month, "month") : item.month.replace("-", ".")}</td>
      <td>${assetUnlocked ? editableSelect("assets", originalIndex, "category", item.category, state.inputOptions.assetCategories.map((entry) => entry.label)) : `<span class="category-badge ${assetCategoryClass(item.category)}">${item.category}</span>`}</td>
      <td>${assetUnlocked ? editableInput("assets", originalIndex, "name", item.name) : escapeHtml(item.name)}</td>
      <td class="number-cell">${assetUnlocked ? editableInput("assets", originalIndex, "amount", item.amount, "krw") : fullMoney(item.amount)}</td>
      <td><button class="row-remove" data-remove-asset="${originalIndex}" title="삭제" aria-label="삭제">×</button></td>
    `;
    body.appendChild(row);
  });

  if (assetPage === 1) {
    const stockRow = document.createElement("tr");
    stockRow.innerHTML = `
      <td>${(state.assetItems.map((item) => item.month).sort().at(-1) || todayMonth()).replace("-", ".")}</td>
      <td><span class="category-badge category-financial">금융자산</span></td>
      <td>주식 · 자동 반영</td>
      <td class="number-cell">${fullMoney(assets.stockFinancial)}</td>
      <td></td>
    `;
    body.appendChild(stockRow);
  }
  setText("assetItemCount", `${rows.length + 1}개 항목 · ${assetPage}/${totalPages}`);
  renderPagination("assetPagination", assetPage, totalPages, "assets");
}

function assetCategoryClass(category) {
  if (assetCategoryType(category) === "realEstate") return "category-realestate";
  if (assetCategoryType(category) === "vehicle") return "category-vehicle";
  if (assetCategoryType(category) === "debt") return "category-debt";
  return "category-financial";
}

function assetCategoryType(category) {
  return state.inputOptions.assetCategories.find((item) => item.label === category)?.type || "financial";
}

function buildAssetTimeline(stockValue) {
  const months = [...new Set(state.assetItems.map((item) => item.month).filter(Boolean))].sort();
  if (!months.length) months.push(todayMonth());
  const keys = [...new Set(state.assetItems.map((item) => `${item.category}::${item.name}`))];

  return months.map((month, monthIndex) => {
    const values = { month, realEstate: 0, financial: 0, vehicle: 0, debt: 0 };
    keys.forEach((key) => {
      const candidates = state.assetItems
        .filter((item) => `${item.category}::${item.name}` === key && item.month <= month)
        .sort((a, b) => a.month.localeCompare(b.month));
      const latest = candidates.at(-1);
      if (!latest) return;
      const type = assetCategoryType(latest.category);
      if (type === "realEstate") values.realEstate += latest.amount;
      if (type === "financial") values.financial += latest.amount;
      if (type === "vehicle") values.vehicle += latest.amount;
      if (type === "debt") values.debt += latest.amount;
    });
    if (monthIndex === months.length - 1) values.financial += stockValue;
    return values;
  });
}

function renderAssetTrend(stockValue) {
  let timeline = buildAssetTimeline(stockValue);
  if (historyMode === "yearly") {
    const yearly = new Map();
    timeline.forEach((item) => yearly.set(item.month.slice(0, 4), item));
    timeline = [...yearly.entries()].map(([year, item]) => ({ ...item, month: year }));
  }

  drawLineChart(
    document.getElementById("assetTrendChart"),
    timeline.map((item) => (historyMode === "yearly" ? `${item.month}년` : formatMonthLabel(item.month))),
    [
      { label: "부동산", color: css("--chart-blue"), values: timeline.map((item) => item.realEstate) },
      { label: "금융자산", color: css("--chart-green"), values: timeline.map((item) => item.financial) },
      { label: "차량", color: css("--chart-violet"), values: timeline.map((item) => item.vehicle) },
      { label: "부채", color: css("--chart-red"), values: timeline.map((item) => item.debt) }
    ]
  );
}

function formatMonthLabel(month) {
  const [, value] = String(month).split("-");
  return value ? `${Number(value)}월` : month;
}

function setupCanvas(canvas, height, minWidth = 220) {
  if (!canvas) return null;
  const width = Math.max(canvas.clientWidth || canvas.parentElement?.clientWidth || 320, minWidth);
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  return { ctx, width, height };
}

function setChartHoverData(canvas, hits) {
  if (!canvas) return;
  canvas._chartHits = hits;
  if (canvas._chartHoverReady) return;
  canvas._chartHoverReady = true;
  const tooltip = document.getElementById("chartTooltip") || Object.assign(document.body.appendChild(document.createElement("div")), {
    id: "chartTooltip",
    className: "chart-tooltip"
  });
  canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const hit = (canvas._chartHits || []).find((item) => {
      if (item.kind === "bar") return x >= item.x && x <= item.x + item.width && y >= item.y && y <= item.y + item.height;
      if (item.kind === "arc") {
        const distance = Math.hypot(x - item.centerX, y - item.centerY);
        let angle = Math.atan2(y - item.centerY, x - item.centerX);
        while (angle < item.start) angle += Math.PI * 2;
        return Math.abs(distance - item.radius) <= 18 && angle <= item.end;
      }
      return Math.hypot(x - item.x, y - item.y) <= 10;
    });
    if (!hit) {
      tooltip.classList.remove("show");
      canvas.style.cursor = "default";
      return;
    }
    tooltip.innerHTML = `<strong>${escapeHtml(hit.label)}</strong><span>${fullMoney(hit.value)}</span>`;
    tooltip.style.left = `${Math.min(event.clientX + 12, window.innerWidth - 160)}px`;
    tooltip.style.top = `${Math.min(event.clientY + 12, window.innerHeight - 72)}px`;
    tooltip.classList.add("show");
    canvas.style.cursor = "crosshair";
  });
  canvas.addEventListener("mouseleave", () => tooltip.classList.remove("show"));
}

function drawSparkline(canvas, values) {
  const setup = setupCanvas(canvas, 72, 80);
  if (!setup) return;
  const { ctx, width, height } = setup;
  const valid = values.filter(Number.isFinite);
  if (valid.length < 2) {
    ctx.strokeStyle = css("--line");
    ctx.beginPath();
    ctx.moveTo(5, height / 2);
    ctx.lineTo(width - 5, height / 2);
    ctx.stroke();
    return;
  }
  const sampled = downsample(valid, 32);
  const min = Math.min(...sampled);
  const max = Math.max(...sampled);
  const y = (value) => 7 + (height - 14) * (1 - (value - min) / Math.max(max - min, 1e-9));
  const x = (index) => 4 + ((width - 8) * index) / Math.max(sampled.length - 1, 1);
  const rising = sampled.at(-1) >= sampled[0];

  ctx.beginPath();
  sampled.forEach((value, index) => {
    if (index === 0) ctx.moveTo(x(index), y(value));
    else ctx.lineTo(x(index), y(value));
  });
  ctx.strokeStyle = rising ? css("--chart-red") : css("--chart-blue");
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
}

function drawDonut(canvasId, legendId, entries, centerLabel) {
  const canvas = document.getElementById(canvasId);
  const legend = document.getElementById(legendId);
  const positiveEntries = entries.filter(([, value]) => Number(value) > 0);
  const setup = setupCanvas(canvas, 220);
  if (!setup) return;
  const { ctx, width, height } = setup;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.43;
  const total = sum(positiveEntries, (entry) => entry[1]);
  let start = -Math.PI / 2;
  const hits = [];

  if (!total) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = css("--surface-strong");
    ctx.lineWidth = 28;
    ctx.stroke();
  } else {
    positiveEntries.forEach(([name, value], index) => {
      const angle = (value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, start, start + angle);
      ctx.strokeStyle = COLORS[index % COLORS.length];
      ctx.lineWidth = 28;
      ctx.lineCap = "butt";
      ctx.stroke();
      hits.push({ kind: "arc", centerX, centerY, radius, start, end: start + angle, label: name, value });
      start += angle;
    });
  }

  ctx.fillStyle = css("--text");
  ctx.textAlign = "center";
  ctx.font = "800 18px Segoe UI, sans-serif";
  ctx.fillText(total ? money(total) : "-", centerX, centerY - 2);
  ctx.fillStyle = css("--muted");
  ctx.font = "700 11px Segoe UI, sans-serif";
  ctx.fillText(centerLabel, centerX, centerY + 18);

  legend.innerHTML = "";
  positiveEntries.slice(0, 7).forEach(([name, value], index) => {
    const item = document.createElement("div");
    item.className = "legend-item";
    item.innerHTML = `
      <div class="legend-row">
        <span class="legend-name"><i class="swatch" style="background:${COLORS[index % COLORS.length]}"></i>${escapeHtml(name)}</span>
        <strong>${percent(total ? (value / total) * 100 : 0)}</strong>
      </div>
      <div class="progress-track"><div class="progress-bar" style="width:${total ? (value / total) * 100 : 0}%;background:${COLORS[index % COLORS.length]}"></div></div>
    `;
    legend.appendChild(item);
  });
  if (!positiveEntries.length) legend.innerHTML = richEmptyState("아직 입력된 데이터가 없어요", "자산현황을 추가하면 배분 차트가 표시돼요.", "자산 입력하기", "assets");
  setChartHoverData(canvas, hits);
}

function drawGroupedBars(canvas, labels, series) {
  const setup = setupCanvas(canvas, 260);
  if (!setup) return;
  const { ctx, width, height } = setup;
  const pad = { top: 28, right: 18, bottom: 36, left: 54 };
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;
  const max = Math.max(...series.flatMap((item) => item.values), 1);
  const groupWidth = plotWidth / Math.max(labels.length, 1);
  const barWidth = Math.min(18, (groupWidth * 0.72) / Math.max(series.length, 1));
  const hits = [];

  drawGrid(ctx, width, height, pad, max);
  labels.forEach((label, labelIndex) => {
    const groupStart = pad.left + groupWidth * labelIndex + groupWidth / 2 - (barWidth * series.length) / 2;
    series.forEach((item, seriesIndex) => {
      const value = item.values[labelIndex] || 0;
      const barHeight = (value / max) * plotHeight;
      const barX = groupStart + seriesIndex * barWidth;
      const barY = pad.top + plotHeight - barHeight;
      ctx.fillStyle = item.color;
      ctx.fillRect(barX, barY, Math.max(barWidth - 2, 2), barHeight);
      hits.push({ kind: "bar", x: barX, y: barY, width: Math.max(barWidth - 2, 2), height: Math.max(barHeight, 4), label: `${label} · ${item.label}`, value });
    });
    ctx.fillStyle = css("--muted");
    ctx.font = "700 11px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, pad.left + groupWidth * labelIndex + groupWidth / 2, height - 12);
  });
  drawChartLegend(ctx, series);
  setChartHoverData(canvas, hits);
}

function drawLineChart(canvas, labels, series) {
  const setup = setupCanvas(canvas, 270);
  if (!setup) return;
  const { ctx, width, height } = setup;
  const pad = { top: 32, right: 18, bottom: 38, left: 54 };
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;
  const values = series.flatMap((item) => item.values);
  const max = Math.max(...values, 1);
  const min = 0;
  const x = (index) => pad.left + (plotWidth * index) / Math.max(labels.length - 1, 1);
  const y = (value) => pad.top + plotHeight - ((value - min) / Math.max(max - min, 1)) * plotHeight;
  const hits = [];

  drawGrid(ctx, width, height, pad, max);
  series.forEach((item) => {
    ctx.beginPath();
    item.values.forEach((value, index) => {
      if (index === 0) ctx.moveTo(x(index), y(value));
      else ctx.lineTo(x(index), y(value));
    });
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 2.6;
    ctx.lineJoin = "round";
    ctx.stroke();
    item.values.forEach((value, index) => {
      ctx.beginPath();
      ctx.arc(x(index), y(value), 3.2, 0, Math.PI * 2);
      ctx.fillStyle = css("--surface");
      ctx.fill();
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      hits.push({ kind: "point", x: x(index), y: y(value), label: `${labels[index]} · ${item.label}`, value });
    });
  });

  labels.forEach((label, index) => {
    ctx.fillStyle = css("--muted");
    ctx.font = "700 11px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, x(index), height - 12);
  });
  drawChartLegend(ctx, series);
  setChartHoverData(canvas, hits);
}

function drawGrid(ctx, width, height, pad, max) {
  const plotHeight = height - pad.top - pad.bottom;
  ctx.strokeStyle = css("--chart-grid");
  ctx.lineWidth = 1;
  for (let index = 0; index < 4; index += 1) {
    const y = pad.top + (plotHeight / 3) * index;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
    const value = max - (max / 3) * index;
    ctx.fillStyle = css("--muted");
    ctx.font = "700 10px Segoe UI, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(shortNumber(value), pad.left - 7, y + 4);
  }
}

function drawChartLegend(ctx, series) {
  let x = 58;
  series.forEach((item) => {
    ctx.fillStyle = item.color;
    ctx.fillRect(x, 8, 9, 9);
    ctx.fillStyle = css("--muted");
    ctx.font = "700 10px Segoe UI, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(item.label, x + 14, 17);
    x += ctx.measureText(item.label).width + 42;
  });
}

function shortNumber(value) {
  const number = Number(value) || 0;
  if (Math.abs(number) >= 100000000) return `${(number / 100000000).toFixed(1)}억`;
  if (Math.abs(number) >= 10000) return `${Math.round(number / 10000)}만`;
  return Math.round(number).toLocaleString("ko-KR");
}

function downsample(values, count) {
  if (values.length <= count) return values;
  const result = [];
  for (let index = 0; index < count; index += 1) {
    result.push(values[Math.round((index * (values.length - 1)) / (count - 1))]);
  }
  return result;
}

function renderVisibleCharts() {
  if (activeView === "home") {
    renderMarketCards();
    renderWatchQuotes();
  }
  if (activeView === "ledger") renderLedgerCharts();
  if (activeView === "stocks") {
    const portfolio = portfolioSnapshot();
    renderStockTreemap(portfolio.holdings);
    renderPortfolioDonuts(portfolio.included);
    renderStockGrowthCharts();
  }
  if (activeView === "assets") {
    const assets = assetSnapshot();
    drawDonut("assetDonut", "assetLegend", [["부동산", assets.realEstate], ["금융자산", assets.financial], ["차량", assets.vehicle], ["부채", assets.debt]], "구성");
    renderAssetTrend(assets.portfolio.valueKrw);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function openModal(id) {
  const modal = document.getElementById(id);
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  const first = modal.querySelector("input, select");
  first?.focus();
}

function closeModal(id) {
  const modal = document.getElementById(id);
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

function enhanceInputUx() {
  document.querySelectorAll(".form-grid label").forEach((label) => {
    const control = label.querySelector("input, select");
    const textNode = label.querySelector("span");
    if (!control || !textNode || textNode.dataset.enhanced === "true") return;
    textNode.dataset.enhanced = "true";
    const badge = document.createElement("em");
    badge.className = control.required ? "field-required" : "field-optional";
    badge.textContent = control.required ? "Required" : "Optional";
    textNode.appendChild(badge);
  });
}

function fillGoalForm() {
  const form = document.getElementById("goalForm");
  if (!form) return;
  const goals = normalizeV2Goals(state.uiConfig?.v2Goals || {});
  const fields = [
    ["financialAssets", "financialAssets"],
    ["netWorth", "netWorth"],
    ["meritzW", "meritzW"]
  ];
  fields.forEach(([key, prefix]) => {
    const goal = goals[key];
    formatKrwInput(form.elements[`${prefix}Target`], goal.target);
    form.elements[`${prefix}StartMonth`].value = goal.startMonth;
    form.elements[`${prefix}EndMonth`].value = goal.endMonth;
  });
}

function readGoalForm(data, key, prefix) {
  return {
    ...(state.uiConfig.v2Goals?.[key] || DEFAULT_V2_GOALS[key]),
    target: inputNumber(data.get(`${prefix}Target`)),
    startMonth: String(data.get(`${prefix}StartMonth`) || todayMonth()),
    endMonth: String(data.get(`${prefix}EndMonth`) || todayMonth())
  };
}

function chunkItems(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function fetchYahooQuotes(symbols, range = "1y", interval = "1d") {
  const chunks = chunkItems(symbols, 20);
  const payloads = await Promise.all(chunks.map(async (chunk) => {
    const response = await fetch(
      `/api/yahoo?symbols=${encodeURIComponent(chunk.join(","))}&range=${range}&interval=${interval}`,
      { cache: "no-store" }
    );
    if (!response.ok) throw new Error(`Yahoo API ${response.status}`);
    return response.json();
  }));

  return {
    asOf: payloads.find((payload) => payload.asOf)?.asOf || new Date().toISOString(),
    results: payloads.flatMap((payload) => payload.results || [])
  };
}

async function loadMarketData() {
  const symbols = [
    ...MARKET_CONFIG.map((item) => item.symbol),
    ...WATCH_SYMBOLS,
    ...state.stockHoldings.map((item) => item.ticker)
  ];
  const unique = [...new Set(symbols.filter(Boolean))];
  setMarketStatus("시장 데이터 불러오는 중", "");

  try {
    const payload = await fetchYahooQuotes(unique, "1y", "1d");
    (payload.results || []).forEach((quote) => {
      if (!quote.error) marketQuotes[quote.symbol] = quote;
    });
    const highPayload = await fetchYahooQuotes(WATCH_SYMBOLS, "max", "1wk");
    (highPayload.results || []).forEach((quote) => {
      if (!quote.error && marketQuotes[quote.symbol]) marketQuotes[quote.symbol].allTimeHigh = quote.allTimeHigh;
    });
    saveMarketCache();
    setMarketStatus("Yahoo Finance 연결됨", "ready");
    const updated = new Date(payload.asOf || Date.now());
    setText("marketUpdatedAt", `${updated.toLocaleDateString("ko-KR")} ${updated.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}`);
    renderAll();
  } catch (error) {
    console.error(error);
    setMarketStatus(Object.keys(marketQuotes).length ? "저장된 시장 데이터 사용 중" : "시장 데이터 연결 지연", "error");
    setText("marketUpdatedAt", Object.keys(marketQuotes).length ? "최근 저장 데이터" : "연결 확인 필요");
    renderAll();
  }
}

function setMarketStatus(message, mode) {
  const wrapper = document.querySelector(".topbar-status");
  wrapper.classList.remove("ready", "error");
  if (mode) wrapper.classList.add(mode);
  setText("marketStatus", message);
}

document.querySelectorAll("[data-view-target]").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.viewTarget));
});

document.querySelectorAll("[data-view-link]").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.viewLink));
});

document.getElementById("themeToggle").addEventListener("change", (event) => {
  state.theme = event.target.checked ? "dark" : "light";
  saveState();
  applyTheme();
});

document.getElementById("layoutEditToggle").addEventListener("change", (event) => {
  state.uiConfig.layoutLocked = !event.target.checked;
  saveState();
  applyUiConfig();
});

document.getElementById("layoutLabelEditor").addEventListener("change", (event) => {
  const input = event.target.closest("[data-layout-label-input]");
  if (!input) return;
  const key = input.dataset.layoutLabelInput;
  const value = input.value.trim();
  if (value) state.uiConfig.labels[key] = value;
  else delete state.uiConfig.labels[key];
  saveState();
  renderAll();
});

document.getElementById("ledgerEditToggle").addEventListener("click", () => {
  state.editorLocks.ledger = !state.editorLocks.ledger;
  saveState();
  renderLedger();
});

document.getElementById("stockEditToggle").addEventListener("click", () => {
  state.editorLocks.stocks = !state.editorLocks.stocks;
  saveState();
  renderStocks();
});

document.getElementById("assetEditToggle").addEventListener("click", () => {
  state.editorLocks.assets = !state.editorLocks.assets;
  saveState();
  renderAssets();
});

document.getElementById("selectAllLedger").addEventListener("change", (event) => {
  const monthEntries = state.ledgerEntries.filter((entry) => String(entry.date).startsWith(selectedLedgerMonth));
  const visible =
    currentLedgerFilter === "all"
      ? monthEntries
      : monthEntries.filter((entry) => entry.type === currentLedgerFilter);
  [...visible]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice((ledgerPage - 1) * LEDGER_PAGE_SIZE, ledgerPage * LEDGER_PAGE_SIZE)
    .forEach((entry) => {
    if (event.target.checked) selectedLedgerIds.add(entry.id);
    else selectedLedgerIds.delete(entry.id);
    });
  renderLedger();
});

document.getElementById("deleteSelectedLedgerBtn").addEventListener("click", () => {
  if (!selectedLedgerIds.size) return;
  state.ledgerEntries = state.ledgerEntries.filter((entry) => !selectedLedgerIds.has(entry.id));
  const count = selectedLedgerIds.size;
  selectedLedgerIds.clear();
  saveState();
  renderAll();
  showToast(`${count}개 내역을 삭제했어요.`);
});

document.getElementById("copyFixedToNextMonthBtn").addEventListener("click", copyFixedEntriesToNextMonth);

document.getElementById("openLedgerModalBtn").addEventListener("click", () => {
  const form = document.getElementById("ledgerForm");
  form.reset();
  form.elements.date.value = todayDate();
  form.elements.payment.value = "";
  openModal("ledgerModal");
});

document.getElementById("openStockModalBtn").addEventListener("click", () => {
  document.getElementById("stockForm").reset();
  syncLocalPriceInput(document.getElementById("stockForm"));
  openModal("stockModal");
});

document.getElementById("openStockCashModalBtn").addEventListener("click", () => {
  fillStockCashForm();
  openModal("stockCashModal");
});

document.getElementById("openTradeModalBtn").addEventListener("click", () => {
  const form = document.getElementById("tradeForm");
  syncInputOptions();
  form.reset();
  form.elements.date.value = todayDate();
  syncLocalPriceInput(form);
  openModal("tradeModal");
});

document.getElementById("openAssetModalBtn").addEventListener("click", () => {
  const form = document.getElementById("assetForm");
  form.reset();
  form.elements.month.value = todayMonth();
  openModal("assetModal");
});

document.getElementById("openGoalModalBtn").addEventListener("click", () => {
  fillGoalForm();
  openModal("goalModal");
});

document.getElementById("closeCurrentMonthBtn").addEventListener("click", () => {
  saveMonthlyClose(todayMonth());
});

document.getElementById("editMonthlyCloseBtn").addEventListener("click", () => {
  openMonthlyCloseEditor(todayMonth());
});

document.getElementById("reapplyMonthlyCloseBtn").addEventListener("click", () => {
  const month = todayMonth();
  if (!state.monthlyClosings[month]) return;
  saveMonthlyClose(month, { reapply: true });
});

document.getElementById("closeSelectedMonthBtn").addEventListener("click", () => {
  saveMonthlyClose(selectedLedgerMonth || todayMonth());
});

document.getElementById("editSelectedMonthlyCloseBtn").addEventListener("click", () => {
  openMonthlyCloseEditor(selectedLedgerMonth || todayMonth());
});

document.getElementById("reapplySelectedMonthlyCloseBtn").addEventListener("click", () => {
  const month = selectedLedgerMonth || todayMonth();
  if (!state.monthlyClosings[month]) return;
  saveMonthlyClose(month, { reapply: true });
});

document.querySelectorAll("[data-open-option-manager]").forEach((button) => {
  button.addEventListener("click", () => openOptionManager(button.dataset.openOptionManager));
});

document.getElementById("saveOptionManagerBtn").addEventListener("click", saveOptionManager);

document.getElementById("optionManagerGroups").addEventListener("input", (event) => {
  const [groupIndex, itemIndex] = String(event.target.dataset.optionLabel || event.target.dataset.optionType || "").split(":").map(Number);
  const item = optionManagerDraft[groupIndex]?.items[itemIndex];
  if (!item) return;
  if (event.target.dataset.optionLabel) item.label = event.target.value;
  if (event.target.dataset.optionType) item.type = event.target.value;
});

document.getElementById("optionManagerGroups").addEventListener("click", (event) => {
  const add = event.target.closest("[data-add-option]");
  if (add) {
    const group = optionManagerDraft[Number(add.dataset.addOption)];
    group.items.push({ label: "", type: group.typed ? "financial" : undefined, originalLabel: "" });
    renderOptionManager();
    return;
  }
  const remove = event.target.closest("[data-remove-option]");
  if (remove) {
    const [groupIndex, itemIndex] = remove.dataset.removeOption.split(":").map(Number);
    optionManagerDraft[groupIndex].items.splice(itemIndex, 1);
    renderOptionManager();
  }
});

document.addEventListener("input", (event) => {
  if (event.target.matches(".krw-input")) formatKrwInput(event.target);
});

document.querySelectorAll("#stockForm [name='country'], #tradeForm [name='country']").forEach((select) => {
  select.addEventListener("change", () => syncLocalPriceInput(select.form));
});

document.querySelector("#tradeForm [name='ticker']").addEventListener("input", applyHeldTickerToTradeForm);
document.querySelector("#tradeForm [name='ticker']").addEventListener("change", applyHeldTickerToTradeForm);

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", () => closeModal(button.dataset.closeModal));
});

document.querySelectorAll(".modal-backdrop").forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal(modal.id);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document.querySelectorAll(".modal-backdrop.open").forEach((modal) => closeModal(modal.id));
  }
});

document.querySelectorAll("[data-ledger-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    currentLedgerFilter = button.dataset.ledgerFilter;
    ledgerPage = 1;
    renderLedger();
  });
});

document.getElementById("ledgerMonthFilter").addEventListener("change", (event) => {
  selectedLedgerMonth = event.target.value;
  ledgerPage = 1;
  selectedLedgerIds.clear();
  renderLedger();
});

document.getElementById("saveVariableBudgetBtn").addEventListener("click", () => {
  state.variableBudgets[selectedLedgerMonth] = Number(document.getElementById("variableBudgetInput").value.replaceAll(",", "")) || 0;
  saveState();
  renderLedger();
  showToast(`${selectedLedgerMonth.replace("-", "년 ")}월 변동지출 예산을 저장했어요.`);
});

document.getElementById("variableBudgetInput").addEventListener("input", (event) => {
  const digits = event.target.value.replace(/[^0-9]/g, "");
  event.target.value = digits ? Number(digits).toLocaleString("ko-KR") : "";
});

document.getElementById("stockSort").addEventListener("change", (event) => {
  stockSort = event.target.value;
  stockPage = 1;
  renderStocks();
});

document.querySelectorAll("[data-history-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    historyMode = button.dataset.historyMode;
    document.querySelectorAll("[data-history-mode]").forEach((item) => item.classList.toggle("active", item === button));
    renderAssets();
  });
});

document.getElementById("ledgerForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  state.ledgerEntries.push({
    id: uid("ledger"),
    date: data.get("date"),
    type: data.get("type"),
    category: String(data.get("category") || "").trim(),
    amount: inputNumber(data.get("amount")),
    payment: String(data.get("payment") || "-").trim(),
    memo: String(data.get("memo") || "").trim()
  });
  saveState();
  closeModal("ledgerModal");
  renderAll();
  showToast("가계부 내역을 저장했어요.");
});

document.getElementById("stockForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const ticker = String(data.get("ticker") || "").trim().toUpperCase();
  state.stockHoldings.push({
    id: uid("stock"),
    ticker,
    country: data.get("country") === "KR" ? "KR" : "US",
    quantity: Number(data.get("quantity")) || 0,
    purchasePrice: inputNumber(data.get("purchasePrice")),
    account: data.get("account"),
    createdAt: Date.now()
  });
  saveState();
  closeModal("stockModal");
  renderAll();
  showToast(`${ticker} 종목을 추가했어요. 시세를 확인합니다.`);
  await loadMarketData();
});

document.getElementById("stockCashForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  state.stockCashBalances = normalizeStockCashBalances(
    Object.fromEntries(
      STOCK_CASH_CONFIG.map((config) => [
        config.account,
        {
          amount: inputNumber(data.get(config.account)),
          currency: config.currency,
          updatedAt: new Date().toISOString()
        }
      ])
    )
  );
  saveState();
  closeModal("stockCashModal");
  renderAll();
  showToast("계좌 예수금을 저장했어요.");
});

document.getElementById("tradeForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const ticker = String(data.get("ticker") || "").trim().toUpperCase();
  const country = data.get("country") === "KR" ? "KR" : "US";
  const account = String(data.get("account"));
  const type = data.get("type") === "sell" ? "sell" : "buy";
  const quantity = Number(data.get("quantity")) || 0;
  const price = inputNumber(data.get("price"));
  const fxRate = country === "KR" ? 1 : usdKrwRate();
  const holdingIndex = state.stockHoldings.findIndex(
    (item) => item.ticker === ticker && item.country === country && item.account === account
  );
  const holding = state.stockHoldings[holdingIndex];

  if (type === "sell" && (!holding || holding.quantity < quantity)) {
    showToast(`매도 가능 수량은 ${holding?.quantity?.toLocaleString("ko-KR") || 0}주예요.`);
    return;
  }

  const costBasisLocal = type === "sell" ? holding.purchasePrice * quantity : price * quantity;
  const realizedProfitLocal = type === "sell" ? (price - holding.purchasePrice) * quantity : 0;

  if (type === "buy") {
    if (holding) {
      const nextQuantity = holding.quantity + quantity;
      holding.purchasePrice = nextQuantity
        ? (holding.quantity * holding.purchasePrice + quantity * price) / nextQuantity
        : price;
      holding.quantity = nextQuantity;
    } else {
      state.stockHoldings.push({
        id: uid("stock"), ticker, country, account, quantity, purchasePrice: price, createdAt: Date.now()
      });
    }
  } else {
    holding.quantity -= quantity;
    if (holding.quantity <= 0.0000001) state.stockHoldings.splice(holdingIndex, 1);
  }

  state.stockTransactions.push({
    id: uid("trade"),
    date: String(data.get("date")),
    type,
    ticker,
    country,
    account,
    quantity,
    price,
    fxRate,
    amountKrw: quantity * price * fxRate,
    costBasisKrw: costBasisLocal * fxRate,
    realizedProfitKrw: realizedProfitLocal * fxRate,
    memo: String(data.get("memo") || "").trim(),
    createdAt: Date.now()
  });

  saveState();
  closeModal("tradeModal");
  renderAll();
  showToast(`${ticker} ${type === "buy" ? "매수" : "매도"} 기록을 저장했어요.`);
  await loadMarketData();
});

document.getElementById("assetForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const item = {
    id: uid("asset"),
    month: data.get("month"),
    category: data.get("category"),
    name: String(data.get("name") || "").trim(),
    amount: inputNumber(data.get("amount"))
  };
  const existing = state.assetItems.find(
    (entry) => entry.month === item.month && entry.category === item.category && entry.name === item.name
  );
  if (existing) existing.amount = item.amount;
  else state.assetItems.push(item);
  saveState();
  closeModal("assetModal");
  renderAll();
  showToast("자산현황을 반영했어요.");
});

document.getElementById("goalForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const goals = {
    financialAssets: readGoalForm(data, "financialAssets", "financialAssets"),
    netWorth: readGoalForm(data, "netWorth", "netWorth"),
    meritzW: readGoalForm(data, "meritzW", "meritzW")
  };
  const invalid = Object.values(goals).some((goal) => goal.startMonth > goal.endMonth);
  if (invalid) {
    showToast("Target month must be after start month.");
    return;
  }
  state.uiConfig.v2Goals = normalizeV2Goals(goals);
  state.financialGoal = state.uiConfig.v2Goals.financialAssets.target;
  state.financialGoalStartMonth = state.uiConfig.v2Goals.financialAssets.startMonth;
  state.financialGoalEndMonth = state.uiConfig.v2Goals.financialAssets.endMonth;
  saveState();
  closeModal("goalModal");
  renderAll();
  showToast("Goal settings saved.");
});

document.getElementById("monthlyCloseForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const month = event.currentTarget.dataset.month || selectedLedgerMonth || todayMonth();
  const current = state.monthlyClosings[month];
  if (!current) return;
  const data = new FormData(event.currentTarget);
  const investmentPrincipalKrw = inputNumber(data.get("investmentPrincipalKrw"));
  const investmentValueKrw = inputNumber(data.get("investmentValueKrw"));
  const investmentProfitKrw = investmentValueKrw - investmentPrincipalKrw;
  state.monthlyClosings[month] = {
    ...current,
    netWorth: inputNumber(data.get("netWorth")),
    savingRate: Number(data.get("savingRate")) || 0,
    budgetBurnRate: Number(data.get("budgetBurnRate")) || 0,
    investmentPrincipalKrw,
    investmentValueKrw,
    investmentProfitKrw,
    investmentReturnRate: investmentPrincipalKrw ? (investmentProfitKrw / investmentPrincipalKrw) * 100 : 0,
    updatedAt: new Date().toISOString()
  };
  saveState();
  closeModal("monthlyCloseModal");
  renderHome();
  renderLedger();
  showToast(`${monthLabel(month)} 수정 마감값을 저장했어요.`);
});

document.addEventListener("change", (event) => {
  const dynamicThemeToggle = event.target.closest("#themeToggle");
  if (dynamicThemeToggle) {
    state.theme = dynamicThemeToggle.checked ? "dark" : "light";
    saveState();
    applyTheme();
    return;
  }

  const dynamicLayoutToggle = event.target.closest("#layoutEditToggle");
  if (dynamicLayoutToggle) {
    state.uiConfig.layoutLocked = !dynamicLayoutToggle.checked;
    saveState();
    applyUiConfig();
    return;
  }

  const dynamicLayoutLabel = event.target.closest("[data-layout-label-input]");
  if (dynamicLayoutLabel) {
    const key = dynamicLayoutLabel.dataset.layoutLabelInput;
    const value = dynamicLayoutLabel.value.trim();
    if (value) state.uiConfig.labels[key] = value;
    else delete state.uiConfig.labels[key];
    saveState();
    renderAll();
    return;
  }

  const selection = event.target.closest("[data-select-ledger]");
  if (selection) {
    if (selection.checked) selectedLedgerIds.add(selection.dataset.selectLedger);
    else selectedLedgerIds.delete(selection.dataset.selectLedger);
    renderLedger();
    return;
  }

  const control = event.target.closest("[data-edit-scope]");
  if (!control) return;
  const collections = {
    ledger: state.ledgerEntries,
    stocks: state.stockHoldings,
    assets: state.assetItems
  };
  const item = collections[control.dataset.editScope]?.[Number(control.dataset.editIndex)];
  if (!item) return;
  const field = control.dataset.editField;
  const numericFields = new Set(["amount", "quantity", "purchasePrice"]);
  item[field] = numericFields.has(field) ? inputNumber(control.value) : control.value;
  if (field === "ticker") item.ticker = String(item.ticker).trim().toUpperCase();
  saveState();
  renderAll();
  if (control.dataset.editScope === "stocks" && field === "ticker") loadMarketData();
});

document.addEventListener("click", (event) => {
  const dismissAlertButton = event.target.closest("[data-dismiss-alert]");
  if (dismissAlertButton) {
    const alertId = dismissAlertButton.dataset.dismissAlert;
    const dismissed = new Set(state.uiConfig.dismissedAlerts || []);
    dismissed.add(alertId);
    state.uiConfig.dismissedAlerts = [...dismissed];
    saveState();
    renderHome();
    return;
  }

  const viewLink = event.target.closest("[data-view-link]");
  if (viewLink) {
    setView(viewLink.dataset.viewLink);
    return;
  }

  const modalButton = event.target.closest("[data-open-modal]");
  if (modalButton) {
    const modalId = modalButton.dataset.openModal;
    if (modalId === "goalModal") {
      fillGoalForm();
    }
    if (modalId === "stockCashModal") {
      fillStockCashForm();
    }
    openModal(modalId);
    return;
  }

  const meritzButton = event.target.closest("[data-meritz-rate]");
  if (meritzButton) {
    state.uiConfig.meritzScenario = Number(meritzButton.dataset.meritzRate) || 0.1;
    saveState();
    renderHome();
    return;
  }

  const pageButton = event.target.closest("[data-page-scope]");
  if (pageButton && !pageButton.disabled) {
    const nextPage = Number(pageButton.dataset.page);
    if (pageButton.dataset.pageScope === "ledger") {
      ledgerPage = nextPage;
      renderLedger();
    }
    if (pageButton.dataset.pageScope === "stocks") {
      stockPage = nextPage;
      renderStocks();
    }
    if (pageButton.dataset.pageScope === "assets") {
      assetPage = nextPage;
      renderAssets();
    }
    document.querySelector(`[data-view="${activeView}"] .table-surface`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const moveButton = event.target.closest("[data-move-layout]");
  if (moveButton) {
    const group = moveButton.dataset.moveLayout;
    const id = moveButton.dataset.layoutItem;
    const direction = Number(moveButton.dataset.direction);
    const order = state.uiConfig.orders[group];
    const index = order.indexOf(id);
    const nextIndex = index + direction;
    if (index >= 0 && nextIndex >= 0 && nextIndex < order.length) {
      [order[index], order[nextIndex]] = [order[nextIndex], order[index]];
      saveState();
      renderAll();
    }
    return;
  }

  const ledgerButton = event.target.closest("[data-remove-ledger]");
  if (ledgerButton) {
    const removed = state.ledgerEntries.splice(Number(ledgerButton.dataset.removeLedger), 1)[0];
    if (removed) selectedLedgerIds.delete(removed.id);
    saveState();
    renderAll();
    return;
  }

  const stockButton = event.target.closest("[data-remove-stock]");
  if (stockButton) {
    state.stockHoldings.splice(Number(stockButton.dataset.removeStock), 1);
    saveState();
    renderAll();
    showToast("보유 종목을 삭제했어요.");
    return;
  }

  const assetButton = event.target.closest("[data-remove-asset]");
  if (assetButton) {
    state.assetItems.splice(Number(assetButton.dataset.removeAsset), 1);
    saveState();
    renderAll();
    showToast("자산 항목을 삭제했어요.");
  }
});

document.getElementById("downloadBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "우리집-자산-데이터.json";
  anchor.click();
  URL.revokeObjectURL(url);
});

document.getElementById("uploadInput").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    state = normalizeState(JSON.parse(await file.text()));
    saveState();
    applyTheme();
    renderAll();
    await loadMarketData();
    showToast("데이터를 가져왔어요.");
  } catch {
    showToast("JSON 파일을 확인해 주세요.");
  } finally {
    event.target.value = "";
  }
});

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(renderVisibleCharts, 120);
});

window.addEventListener("hashchange", () => setView(location.hash.replace("#", "")));

function unlockDashboard() {
  sessionStorage.setItem("home-wealth-access", "granted");
  document.body.classList.remove("access-locked");
  document.getElementById("accessError").textContent = "";
  requestAnimationFrame(renderAll);
}

if (sessionStorage.getItem("home-wealth-access") === "granted") {
  document.body.classList.remove("access-locked");
}

document.getElementById("accessPin").addEventListener("input", (event) => {
  event.target.value = event.target.value.replace(/[^0-9]/g, "");
});

document.getElementById("accessForm").addEventListener("submit", (event) => {
  event.preventDefault();
  if (document.getElementById("accessPin").value === ACCESS_PIN) {
    unlockDashboard();
    return;
  }
  document.getElementById("accessError").textContent = "암호가 맞지 않아요.";
  document.getElementById("accessPin").value = "";
  document.getElementById("accessPin").focus();
});

enhanceInputUx();
applyTheme();
renderAll();
hydrateRemoteState();
loadMarketData();

