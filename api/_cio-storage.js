const fs = require("node:fs/promises");
const path = require("node:path");

require("./_env.js").loadLocalEnv();

function hasSupabase() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function saveCioRun(report) {
  await Promise.allSettled([saveToSupabase(report), appendCsvBackup(report)]);
}

async function saveAlert(alert) {
  if (!hasSupabase()) return false;
  await supabaseUpsert("alerts", [alert], "alert_key");
  return true;
}

async function alertExists(alertKey) {
  if (!hasSupabase()) return false;
  const url = new URL(`${supabaseBaseUrl()}/rest/v1/alerts`);
  url.searchParams.set("select", "alert_key");
  url.searchParams.set("alert_key", `eq.${alertKey}`);
  url.searchParams.set("limit", "1");
  const response = await fetch(url, { headers: supabaseHeaders() });
  if (!response.ok) return false;
  const rows = await response.json().catch(() => []);
  return Array.isArray(rows) && rows.length > 0;
}

async function saveErrorLog(scope, error) {
  const message = error instanceof Error ? error.message : String(error || "unknown error");
  const row = {
    alert_key: `error:${scope}:${new Date().toISOString()}`,
    report_date: kstDate(),
    type: "error",
    severity: "error",
    title: `OurCFO ${scope} 실패`,
    message,
    payload: { scope, message },
    triggered_at: new Date().toISOString(),
    sent_at: null
  };

  try {
    await saveAlert(row);
  } catch {
    // Console logs remain available in Vercel if DB logging fails.
  }
}

async function saveToSupabase(report) {
  if (!hasSupabase()) return;

  const reportDate = report.reportDate;
  const marketRows = report.market.items.map((item) => ({
    report_date: reportDate,
    symbol: item.key,
    source_symbol: item.symbol,
    label: item.label,
    price: numberOrNull(item.price),
    previous_close: numberOrNull(item.previousClose),
    change_pct: numberOrNull(item.changePct),
    year_high: numberOrNull(item.yearHigh),
    year_low: numberOrNull(item.yearLow),
    drawdown_pct: numberOrNull(item.drawdownPct),
    currency: item.currency || "",
    source: item.source || report.market.source,
    as_of: normalizeDate(item.asOf || report.market.asOf),
    payload: item
  }));

  const macroRows = report.macro.items.map((item) => ({
    report_date: reportDate,
    indicator_key: item.key,
    series_id: item.seriesId,
    label: item.label,
    value: numberOrNull(item.value),
    previous_value: numberOrNull(item.previousValue),
    change: numberOrNull(item.change),
    yoy_pct: numberOrNull(item.yoyPct),
    unit: item.unit || "",
    indicator_date: item.date || null,
    source: item.source || report.macro.source,
    payload: item
  }));

  const newsRows = report.news.items.map((item) => ({
    report_date: reportDate,
    rank: item.rank,
    title: item.title,
    source: item.source || "",
    url: item.link || "",
    published_at: normalizeDate(item.pubDate),
    summary_ko: item.koreanSummary,
    payload: item
  }));

  await Promise.all([
    supabaseUpsert("market_daily", marketRows, "report_date,symbol"),
    supabaseUpsert("macro_daily", macroRows, "report_date,indicator_key"),
    supabaseUpsert("news_daily", newsRows, "report_date,rank"),
    supabaseUpsert(
      "cio_reports",
      [
        {
          report_date: reportDate,
          title: "OurCFO CIO Report",
          message: report.message,
          qqq_drawdown_pct: numberOrNull(report.qqq.drawdownPct),
          qqq_zone: report.qqq.zone,
          action_card: report.actionCard,
          asset_snapshot: report.assets,
          market_snapshot: report.market.byKey,
          macro_snapshot: report.macro,
          news_snapshot: report.news.items,
          cio_opinion: report.cioOpinion,
          created_at: new Date().toISOString()
        }
      ],
      "report_date"
    )
  ]);
}

async function supabaseUpsert(table, rows, onConflict) {
  if (!rows.length) return;
  const url = new URL(`${supabaseBaseUrl()}/rest/v1/${table}`);
  if (onConflict) url.searchParams.set("on_conflict", onConflict);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      ...supabaseHeaders(),
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal"
    },
    body: JSON.stringify(rows)
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Supabase ${table} upsert failed: ${response.status} ${text}`.trim());
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

async function appendCsvBackup(report) {
  if (process.env.VERCEL) return;

  const backupDir = process.env.OURCFO_CSV_BACKUP_DIR || path.join(__dirname, "..", "backups");
  await fs.mkdir(backupDir, { recursive: true });

  const filePath = path.join(backupDir, "cio-reports.csv");
  const exists = await fs
    .access(filePath)
    .then(() => true)
    .catch(() => false);
  const header = "report_date,total_assets,qqq_drawdown_pct,qqq_zone,action_card\n";
  const row = [
    report.reportDate,
    report.assets.totalAssets,
    numberOrNull(report.qqq.drawdownPct),
    csvEscape(report.qqq.zone),
    csvEscape(report.actionCard)
  ].join(",");
  await fs.appendFile(filePath, `${exists ? "" : header}${row}\n`, "utf8");
}

function normalizeDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function kstDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  return `${parts.find((part) => part.type === "year").value}-${parts.find((part) => part.type === "month").value}-${parts.find((part) => part.type === "day").value}`;
}

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

module.exports = { alertExists, hasSupabase, saveAlert, saveCioRun, saveErrorLog };
