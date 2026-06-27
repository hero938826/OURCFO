const DEFAULT_STATE = {
  ledgerEntries: [],
  stockHoldings: [],
  assetItems: [],
  variableBudgets: {},
  stockTransactions: [],
  stockValueHistory: {},
  monthlyClosings: {},
  inputOptions: { assetCategories: [] },
  excludedStockAccount: ""
};

const TABLES = {
  assets: "ourcfo_assets",
  stocks: "ourcfo_stock_holdings",
  ledger: "ourcfo_ledger_entries",
  budgets: "ourcfo_variable_budgets",
  trades: "ourcfo_stock_transactions",
  closings: "ourcfo_monthly_closings"
};

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function requireReadAuth(req, res) {
  const token = process.env.OURCFO_API_READ_TOKEN;
  if (!token) return true;

  const auth = req.headers.authorization || "";
  const apiKey = req.headers["x-ourcfo-api-key"];
  const provided = auth.startsWith("Bearer ") ? auth.slice(7) : apiKey;
  if (provided === token) return true;

  json(res, 401, { error: "Unauthorized" });
  return false;
}

async function apiHandler(req, res, buildPayload) {
  if (!requireReadAuth(req, res)) return;

  try {
    const state = await loadState();
    const payload = await buildPayload(state, req);
    json(res, 200, {
      project: "OurCFO",
      asOf: new Date().toISOString(),
      source: currentSource(),
      ...payload
    });
  } catch (error) {
    json(res, 500, {
      error: "OurCFO API error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

async function loadState() {
  if (usesSupabase()) return normalizeState(await loadSupabaseState());
  return normalizeState(loadSeedState());
}

function currentSource() {
  if (usesSupabase()) return "supabase";
  if (process.env.OURCFO_INITIAL_DATA || process.env.OURCFO_INITIAL_DATA_BASE64) return "seed";
  return "empty";
}

function usesSupabase() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function loadSeedState() {
  const base64 = process.env.OURCFO_INITIAL_DATA_BASE64;
  const raw = base64 ? Buffer.from(base64, "base64").toString("utf8") : process.env.OURCFO_INITIAL_DATA;
  if (!raw) return DEFAULT_STATE;

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error("OURCFO_INITIAL_DATA is not valid JSON");
  }
}

async function loadSupabaseState() {
  const [assetItems, stockHoldings, ledgerEntries, budgetRows, stockTransactions, closingRows] = await Promise.all([
    supabaseSelect(TABLES.assets, "month.asc,category.asc,name.asc"),
    supabaseSelect(TABLES.stocks, "created_at.asc"),
    supabaseSelect(TABLES.ledger, "date.desc"),
    supabaseSelect(TABLES.budgets, "month.asc"),
    supabaseSelect(TABLES.trades, "date.desc,created_at.desc"),
    supabaseSelect(TABLES.closings, "month.asc")
  ]);

  return {
    assetItems,
    stockHoldings: stockHoldings.map(fromStockRow),
    ledgerEntries,
    variableBudgets: Object.fromEntries(budgetRows.map((row) => [row.month, Number(row.amount) || 0])),
    stockTransactions: stockTransactions.map(fromTradeRow),
    monthlyClosings: Object.fromEntries(closingRows.map((row) => [row.month, fromClosingRow(row)]))
  };
}

async function supabaseSelect(table, order) {
  const url = new URL(`${process.env.SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${table}`);
  url.searchParams.set("select", "*");
  if (order) url.searchParams.set("order", order);

  const response = await fetch(url, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    }
  });

  if (!response.ok) {
    throw new Error(`Supabase ${table} read failed: ${response.status}`);
  }

  return response.json();
}

function normalizeState(input) {
  const data = input || DEFAULT_STATE;
  return {
    ...DEFAULT_STATE,
    ...data,
    ledgerEntries: array(data.ledgerEntries || data.ledger).map((item) => ({
      id: string(item.id),
      date: string(item.date),
      type: string(item.type),
      category: string(item.category),
      amount: number(item.amount),
      payment: string(item.payment || "-"),
      memo: string(item.memo)
    })),
    stockHoldings: array(data.stockHoldings || data.stocks).map((item) => ({
      id: string(item.id),
      ticker: string(item.ticker).toUpperCase(),
      country: item.country === "KR" ? "KR" : "US",
      quantity: number(item.quantity),
      purchasePrice: number(item.purchasePrice ?? item.purchase_price),
      account: string(item.account),
      createdAt: number(item.createdAt ?? item.created_at ?? Date.now())
    })),
    assetItems: array(data.assetItems || data.assets).map((item) => ({
      id: string(item.id),
      month: string(item.month),
      category: string(item.category),
      name: string(item.name),
      amount: number(item.amount)
    })),
    variableBudgets: object(data.variableBudgets),
    stockTransactions: array(data.stockTransactions).map((item) => ({
      ...item,
      quantity: number(item.quantity),
      price: number(item.price),
      amountKrw: number(item.amountKrw ?? item.amount_krw),
      costBasisKrw: number(item.costBasisKrw ?? item.cost_basis_krw),
      realizedProfitKrw: number(item.realizedProfitKrw ?? item.realized_profit_krw)
    })),
    monthlyClosings: object(data.monthlyClosings)
  };
}

function fromStockRow(row) {
  return {
    id: row.id,
    ticker: row.ticker,
    country: row.country,
    quantity: row.quantity,
    purchasePrice: row.purchase_price,
    account: row.account,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now()
  };
}

function fromTradeRow(row) {
  return {
    id: row.id,
    date: row.date,
    type: row.type,
    ticker: row.ticker,
    country: row.country,
    account: row.account,
    quantity: row.quantity,
    price: row.price,
    fxRate: row.fx_rate,
    amountKrw: row.amount_krw,
    costBasisKrw: row.cost_basis_krw,
    realizedProfitKrw: row.realized_profit_krw,
    memo: row.memo,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now()
  };
}

function fromClosingRow(row) {
  return {
    month: row.month,
    netWorth: number(row.net_worth),
    savingRate: number(row.saving_rate),
    budgetBurnRate: number(row.budget_burn_rate),
    investmentPrincipalKrw: number(row.investment_principal_krw),
    investmentValueKrw: number(row.investment_value_krw),
    investmentProfitKrw: number(row.investment_profit_krw),
    investmentReturnRate: number(row.investment_return_rate),
    closedAt: row.closed_at,
    updatedAt: row.updated_at
  };
}

function snapshots(state, options = {}) {
  const fxRate = number(options.fxRate) || 1380;
  const holdings = state.stockHoldings.map((item) => {
    const costLocal = item.quantity * item.purchasePrice;
    const valueLocal = costLocal;
    const valueKrw = item.country === "KR" ? valueLocal : valueLocal * fxRate;
    const costKrw = item.country === "KR" ? costLocal : costLocal * fxRate;
    return { ...item, costKrw, valueKrw, profitKrw: valueKrw - costKrw, returnRate: 0 };
  });

  const excluded = state.excludedStockAccount;
  const included = excluded ? holdings.filter((item) => item.account !== excluded) : holdings;
  const latestAssets = latestAssetItems(state.assetItems);
  const realEstate = sum(latestAssets.filter((item) => assetType(state, item.category) === "realEstate"));
  const manualFinancial = sum(latestAssets.filter((item) => assetType(state, item.category) === "financial"));
  const vehicle = sum(latestAssets.filter((item) => assetType(state, item.category) === "vehicle"));
  const debt = sum(latestAssets.filter((item) => assetType(state, item.category) === "debt"));
  const stockFinancial = sum(included, (item) => item.valueKrw);
  const financial = manualFinancial + stockFinancial;
  const grossAssets = realEstate + financial + vehicle;

  return {
    holdings,
    portfolio: {
      holdings,
      included,
      valueKrw: stockFinancial,
      costKrw: sum(included, (item) => item.costKrw),
      profitKrw: sum(included, (item) => item.profitKrw),
      accounts: groupSum(included, "account", "valueKrw"),
      tickers: groupSum(included, "ticker", "valueKrw")
    },
    assets: {
      items: latestAssets,
      realEstate,
      manualFinancial,
      stockFinancial,
      financial,
      vehicle,
      debt,
      grossAssets,
      netWorth: grossAssets - debt
    }
  };
}

function budgetSummary(state, month = latestMonth(state.ledgerEntries)) {
  const entries = state.ledgerEntries.filter((entry) => string(entry.date).startsWith(month));
  const income = sum(entries.filter((entry) => entry.type.includes("수입") || entry.type.toLowerCase() === "income"));
  const saving = sum(entries.filter((entry) => entry.type.includes("저축") || entry.type.toLowerCase() === "saving"));
  const expense = sum(entries.filter((entry) => entry.type.includes("지출") || entry.type.toLowerCase() === "expense"));
  const variableExpense = sum(entries.filter((entry) => entry.type.includes("변동") || entry.type.toLowerCase() === "variable_expense"));
  const variableBudget = number(state.variableBudgets[month]);

  return {
    month,
    entries,
    totals: {
      income,
      expense,
      saving,
      balance: income - expense - saving,
      savingRate: income ? (saving / income) * 100 : 0,
      variableExpense,
      variableBudget,
      budgetBurnRate: variableBudget ? (variableExpense / variableBudget) * 100 : 0
    }
  };
}

function latestAssetItems(items) {
  const latest = new Map();
  array(items)
    .filter((item) => item.month)
    .sort((a, b) => a.month.localeCompare(b.month))
    .forEach((item) => latest.set(`${item.category}::${item.name}`, item));
  return [...latest.values()];
}

function assetType(state, category) {
  const match = array(state.inputOptions?.assetCategories).find((item) => item?.label === category);
  if (match?.type) return match.type;
  if (/debt|부채|대출/i.test(category)) return "debt";
  if (/real|estate|부동산|아파트|주택/i.test(category)) return "realEstate";
  if (/vehicle|car|차량|자동차/i.test(category)) return "vehicle";
  return "financial";
}

function latestMonth(entries) {
  return array(entries).map((entry) => string(entry.date).slice(0, 7)).filter(Boolean).sort().at(-1) || new Date().toISOString().slice(0, 7);
}

function groupSum(items, key, valueKey) {
  return Object.fromEntries(
    Object.entries(
      array(items).reduce((acc, item) => {
        const group = string(item[key] || "unknown");
        acc[group] = (acc[group] || 0) + number(item[valueKey]);
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1])
  );
}

function sum(items, selector = (item) => item.amount) {
  return array(items).reduce((total, item) => total + number(selector(item)), 0);
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function object(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function string(value) {
  return String(value ?? "").trim();
}

function number(value) {
  return Number(value) || 0;
}

module.exports = {
  apiHandler,
  budgetSummary,
  snapshots
};
