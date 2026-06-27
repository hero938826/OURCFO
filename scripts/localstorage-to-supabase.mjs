import { readFile } from "node:fs/promises";

const [filePath] = process.argv.slice(2);
if (!filePath) {
  console.error("Usage: node scripts/localstorage-to-supabase.mjs <ourcfo-export.json>");
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  process.exit(1);
}

const state = JSON.parse(await readFile(filePath, "utf8"));

await upsert("ourcfo_assets", (state.assetItems || []).map((item) => ({
  id: item.id,
  month: item.month,
  category: item.category,
  name: item.name,
  amount: Number(item.amount) || 0
})));

await upsert("ourcfo_stock_holdings", (state.stockHoldings || []).map((item) => ({
  id: item.id,
  ticker: item.ticker,
  country: item.country,
  quantity: Number(item.quantity) || 0,
  purchase_price: Number(item.purchasePrice) || 0,
  account: item.account,
  created_at: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString()
})));

await upsert("ourcfo_ledger_entries", (state.ledgerEntries || []).map((item) => ({
  id: item.id,
  date: item.date,
  type: item.type,
  category: item.category,
  amount: Number(item.amount) || 0,
  payment: item.payment || "-",
  memo: item.memo || ""
})));

await upsert("ourcfo_variable_budgets", Object.entries(state.variableBudgets || {}).map(([month, amount]) => ({
  month,
  amount: Number(amount) || 0,
  updated_at: new Date().toISOString()
})));

await upsert("ourcfo_stock_transactions", (state.stockTransactions || []).map((item) => ({
  id: item.id,
  date: item.date,
  type: item.type,
  ticker: item.ticker,
  country: item.country,
  account: item.account,
  quantity: Number(item.quantity) || 0,
  price: Number(item.price) || 0,
  fx_rate: Number(item.fxRate) || 1,
  amount_krw: Number(item.amountKrw) || 0,
  cost_basis_krw: Number(item.costBasisKrw) || 0,
  realized_profit_krw: Number(item.realizedProfitKrw) || 0,
  memo: item.memo || "",
  created_at: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString()
})));

await upsert("ourcfo_monthly_closings", Object.values(state.monthlyClosings || {}).map((item) => ({
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

console.log("OurCFO migration complete.");

async function upsert(table, rows) {
  if (!rows.length) return;

  const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      "content-type": "application/json",
      prefer: "resolution=merge-duplicates"
    },
    body: JSON.stringify(rows)
  });

  if (!response.ok) {
    throw new Error(`${table} migration failed: ${response.status} ${await response.text()}`);
  }

  console.log(`${table}: ${rows.length} rows`);
}
