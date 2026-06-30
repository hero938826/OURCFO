const TABLES = {
  assets: "ourcfo_assets",
  stocks: "ourcfo_stock_holdings",
  ledger: "ourcfo_ledger_entries",
  budgets: "ourcfo_variable_budgets",
  trades: "ourcfo_stock_transactions",
  closings: "ourcfo_monthly_closings",
  meta: "ourcfo_state_meta"
};

function hasSupabaseWrite() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
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

  await upsert(TABLES.meta, [{
    state_key: "default",
    payload: {
      financialGoal: normalized.financialGoal,
      financialGoalStartMonth: normalized.financialGoalStartMonth,
      financialGoalEndMonth: normalized.financialGoalEndMonth,
      stockValueHistory: normalized.stockValueHistory || {},
      inputOptions: normalized.inputOptions || {},
      excludedStockAccount: normalized.excludedStockAccount || "",
      editorLocks: normalized.editorLocks || {},
      uiConfig: normalized.uiConfig || {},
      theme: normalized.theme || "light"
    },
    updated_at: new Date().toISOString()
  }]);

  return {
    assets: (normalized.assetItems || []).length,
    stockHoldings: (normalized.stockHoldings || []).length,
    ledgerEntries: (normalized.ledgerEntries || []).length,
    stockTransactions: (normalized.stockTransactions || []).length
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

function supabaseBaseUrl() {
  return process.env.SUPABASE_URL.replace(/\/$/, "");
}

function supabaseHeaders() {
  return {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
  };
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
