const { hasSupabase, supabaseBaseUrl, supabaseHeaders } = require("./_supabase.js");

const TABLES = {
  assets: "ourcfo_assets",
  stocks: "ourcfo_stock_holdings",
  ledger: "ourcfo_ledger_entries",
  budgets: "ourcfo_variable_budgets",
  trades: "ourcfo_stock_transactions",
  closings: "ourcfo_monthly_closings",
  reports: "ourcfo_reports",
  meta: "ourcfo_state_meta"
};

function hasSupabaseWrite() {
  return hasSupabase();
}

async function replaceSupabaseState(state) {
  if (!hasSupabaseWrite()) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  }

  const normalized = state || {};
  await deleteExistingState();

  await upsert(TABLES.assets, (normalized.assetItems || []).map((item) => ({
    id: item.id,
    month: item.month,
    category: item.category,
    name: item.name,
    amount: Number(item.amount) || 0
  })));

  await upsert(TABLES.stocks, (normalized.stockHoldings || []).map((item) => ({
    id: item.id,
    ticker: item.ticker,
    country: item.country || "US",
    quantity: Number(item.quantity) || 0,
    purchase_price: Number(item.purchasePrice) || 0,
    account: item.account || "",
    created_at: toIso(item.createdAt)
  })));

  await upsert(TABLES.ledger, (normalized.ledgerEntries || []).map((item) => ({
    id: item.id,
    date: item.date,
    type: item.type,
    category: item.category || "",
    amount: Number(item.amount) || 0,
    payment: item.payment || "-",
    memo: item.memo || ""
  })));

  await upsert(TABLES.budgets, Object.entries(normalized.variableBudgets || {}).map(([month, amount]) => ({
    month,
    amount: Number(amount) || 0,
    updated_at: new Date().toISOString()
  })));

  await upsert(TABLES.trades, (normalized.stockTransactions || []).map((item) => ({
    id: item.id,
    date: item.date,
    type: item.type,
    ticker: item.ticker,
    country: item.country || "US",
    account: item.account || "",
    quantity: Number(item.quantity) || 0,
    price: Number(item.price) || 0,
    fx_rate: Number(item.fxRate) || 1,
    amount_krw: Number(item.amountKrw) || 0,
    cost_basis_krw: Number(item.costBasisKrw) || 0,
    realized_profit_krw: Number(item.realizedProfitKrw) || 0,
    memo: item.memo || "",
    created_at: toIso(item.createdAt)
  })));

  await upsert(TABLES.closings, Object.values(normalized.monthlyClosings || {}).map((item) => ({
    month: item.month,
    net_worth: Number(item.netWorth) || 0,
    saving_rate: Number(item.savingRate) || 0,
    budget_burn_rate: Number(item.budgetBurnRate) || 0,
    investment_principal_krw: Number(item.investmentPrincipalKrw) || 0,
    investment_value_krw: Number(item.investmentValueKrw) || 0,
    investment_profit_krw: Number(item.investmentProfitKrw) || 0,
    investment_return_rate: Number(item.investmentReturnRate) || 0,
    closed_at: item.closedAt || null,
    updated_at: item.updatedAt || new Date().toISOString()
  })));

  const reportRows = (normalized.reports || []).map((item) => ({
    id: item.id,
    year: Number(item.year) || 0,
    month: Number(item.month) || 0,
    title: item.title || "",
    summary: item.summary || "",
    total_assets: Number(item.totalAssets) || 0,
    net_worth: Number(item.netWorth) || 0,
    stock_value: Number(item.stockValue) || 0,
    isa_value: Number(item.isaValue) || 0,
    pension_value: Number(item.pensionValue) || 0,
    cash_value: Number(item.cashValue) || 0,
    debt_value: Number(item.debtValue) || 0,
    monthly_change: Number(item.monthlyChange) || 0,
    goal_progress_rate: Number(item.goalProgressRate) || 0,
    cfo_score: Number(item.cfoScore) || 0,
    portfolio_snapshot_json: item.portfolioSnapshot || {},
    events_json: {
      ...(item.events || {}),
      highlights: item.highlights || [],
      improvements: item.improvements || [],
      aiCioComment: item.aiCioComment || "",
      stockMonthlyChange: Number(item.stockMonthlyChange) || 0,
      cashMonthlyChange: Number(item.cashMonthlyChange) || 0,
      debtMonthlyChange: Number(item.debtMonthlyChange) || 0,
      pdfFileName: item.pdfFileName || ""
    },
    action_plan_json: item.actionPlan || [],
    ceo_letter: item.ceoLetter || "",
    pdf_url: item.pdfUrl || "",
    created_at: item.createdAt || new Date().toISOString(),
    updated_at: item.updatedAt || new Date().toISOString()
  }));

  const reportsTableAvailable = await tryUpsert(TABLES.reports, reportRows);

  await upsert(TABLES.meta, [{
    state_key: "default",
    payload: {
      financialGoal: normalized.financialGoal,
      financialGoalStartMonth: normalized.financialGoalStartMonth,
      financialGoalEndMonth: normalized.financialGoalEndMonth,
      stockCashBalances: normalized.stockCashBalances || {},
      stockValueHistory: normalized.stockValueHistory || {},
      inputOptions: normalized.inputOptions || {},
      excludedStockAccount: normalized.excludedStockAccount || "",
      editorLocks: normalized.editorLocks || {},
      uiConfig: normalized.uiConfig || {},
      reports: reportsTableAvailable ? [] : (normalized.reports || []),
      theme: normalized.theme || "light"
    },
    updated_at: new Date().toISOString()
  }]);

  return {
    assets: (normalized.assetItems || []).length,
    stockHoldings: (normalized.stockHoldings || []).length,
    ledgerEntries: (normalized.ledgerEntries || []).length,
    stockTransactions: (normalized.stockTransactions || []).length,
    reports: (normalized.reports || []).length,
    stockCashBalances: Object.values(normalized.stockCashBalances || {}).filter((item) => Number(item?.amount) > 0).length
  };
}

async function deleteExistingState() {
  for (const [table, column] of [
    [TABLES.assets, "id"],
    [TABLES.stocks, "id"],
    [TABLES.ledger, "id"],
    [TABLES.budgets, "month"],
    [TABLES.trades, "id"],
    [TABLES.closings, "month"],
    [TABLES.meta, "state_key"]
  ]) {
    await supabaseDeleteAll(table, column);
  }
  await tryDeleteAll(TABLES.reports, "id");
}

async function supabaseDeleteAll(table, column) {
  const url = new URL(`${supabaseBaseUrl()}/rest/v1/${table}`);
  url.searchParams.set(column, "not.is.null");
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      ...supabaseHeaders(),
      prefer: "return=minimal"
    }
  });

  if (!response.ok) {
    throw new Error(`Supabase ${table} delete failed: ${response.status} ${await response.text()}`.trim());
  }
}

async function upsert(table, rows) {
  if (!rows.length) return;

  for (const chunk of chunks(rows, 500)) {
    const response = await fetch(`${supabaseBaseUrl()}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        ...supabaseHeaders(),
        "content-type": "application/json",
        prefer: "resolution=merge-duplicates,return=minimal"
      },
      body: JSON.stringify(chunk)
    });

    if (!response.ok) {
      throw new Error(`Supabase ${table} upsert failed: ${response.status} ${await response.text()}`.trim());
    }
  }
}

async function tryUpsert(table, rows) {
  try {
    await upsert(table, rows);
    return true;
  } catch (error) {
    if (isMissingTableError(error)) return false;
    throw error;
  }
}

async function tryDeleteAll(table, column) {
  try {
    await supabaseDeleteAll(table, column);
    return true;
  } catch (error) {
    if (isMissingTableError(error)) return false;
    throw error;
  }
}

function isMissingTableError(error) {
  const message = error instanceof Error ? error.message : String(error);
  return /404|PGRST205|does not exist|not found|schema cache/i.test(message);
}

function toIso(value) {
  const numeric = Number(value);
  if (numeric) return new Date(numeric).toISOString();
  if (value) return new Date(value).toISOString();
  return new Date().toISOString();
}

function chunks(items, size) {
  const result = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
}

module.exports = {
  TABLES,
  hasSupabaseWrite,
  replaceSupabaseState
};
