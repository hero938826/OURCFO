const { budgetSummary, loadState, snapshots } = require("./_data.js");
const { collectMarketData } = require("./_market.js");
const { collectMacroData } = require("./_macro.js");
const { collectNewsData } = require("./_news.js");
const { alertExists, getPreviousCioReport, saveAlert, saveCioRun } = require("./_cio-storage.js");
const { sendTelegramMessage } = require("./_telegram.js");

require("./_env.js").loadLocalEnv();

const LEVERAGED_TICKERS = new Set(["QLD", "TQQQ", "SOXL", "UPRO", "SSO", "TECL", "FNGU"]);
const SP500_TICKERS = new Set(["SPY", "SPYM", "VOO", "IVV"]);
const MERITZ_W_ACCOUNT_KEYWORDS = ["메리츠W", "메리츠 W", "meritzw", "meritz"];
const FUTURE_ASSET_ISA_KEYWORDS = ["미래에셋ISA", "미래에셋 ISA", "미래에셋_ISA", "miraeisa"];
const KYUNGJU_KAKAO_PENSION_ASSET_KEYWORDS = ["경주_카카오연금", "경주 카카오연금"];
const KYUNGJU_KAKAO_PENSION_ACCOUNT_KEYWORDS = ["경주_카카오연금", "경주 카카오연금", "카카오연금"];
const HERO_KAKAO_PENSION_KEYWORDS = ["영웅_영웅 카카오 연금계좌", "영웅 카카오 연금계좌"];
const GROWTH_TICKERS = new Set([
  "QQQ",
  "QQQM",
  "QLD",
  "TQQQ",
  "SOXL",
  "NVDA",
  "AAPL",
  "MSFT",
  "TSLA",
  "PLTR",
  "GOOGL",
  "META",
  "AMD",
  "AVGO"
]);

async function buildCioReport() {
  const state = await loadState();
  const extraSymbols = state.stockHoldings.map((item) => item.ticker);
  const reportDate = kstDate();
  const [market, macro, news, previousReport] = await Promise.all([
    collectMarketData(extraSymbols),
    collectMacroData(),
    collectNewsData(),
    getPreviousCioReport(reportDate)
  ]);

  const fxRate = market.byKey.USDKRW?.price || 1380;
  const snapshot = snapshots(state, { fxRate });
  const budget = budgetSummary(state);
  const assets = analyzeAssets(state, snapshot, budget, market, previousReport);
  const qqq = analyzeQqq(market.byKey.QQQ);
  const cioOpinion = buildCioOpinion({ qqq, assets, market, macro });
  const actionCard = buildActionCard({ qqq, assets, market });
  const message = formatTelegramMessage({ assets, market, macro, news, qqq, cioOpinion, actionCard });

  return {
    reportDate,
    generatedAt: new Date().toISOString(),
    assets,
    market,
    macro,
    news,
    qqq,
    cioOpinion,
    actionCard,
    message
  };
}

async function runDailyBriefing({ send = true, save = true } = {}) {
  const report = await buildCioReport();
  if (save) await saveCioRun(report);
  if (send) await sendTelegramMessage(report.message);
  return report;
}

async function runConditionAlerts({ send = true, save = true } = {}) {
  const report = await buildCioReport();
  const alerts = buildConditionAlerts(report);
  const sent = [];

  for (const alert of alerts) {
    const exists = await alertExists(alert.alert_key);
    if (exists) continue;

    if (save) await saveAlert(alert);
    if (send) {
      await sendTelegramMessage(formatAlertMessage(alert));
      sent.push(alert);
      if (save) await saveAlert({ ...alert, sent_at: new Date().toISOString() });
    }
  }

  return { reportDate: report.reportDate, checked: alerts.length, sent };
}

function analyzeAssets(state, snapshot, budget, market, previousReport = null) {
  const holdings = state.stockHoldings || [];
  const fxRate = market.byKey.USDKRW?.price || 1380;
  const marketValueByTicker = {};
  let allStockValue = 0;
  let stockValue = 0;

  for (const holding of holdings) {
    const ticker = String(holding.ticker || "").toUpperCase();
    const valueKrw = holdingMarketValue(holding, market, fxRate);
    allStockValue += valueKrw;
    if (isMeritzWAccount(state, holding)) continue;
    stockValue += valueKrw;
    marketValueByTicker[ticker] = (marketValueByTicker[ticker] || 0) + valueKrw;
  }

  const manualFinancial = snapshot.assets.manualFinancial;
  const financialAssets = manualFinancial + allStockValue;
  const grossAssets = snapshot.assets.realEstate + financialAssets + snapshot.assets.vehicle;
  const totalAssets = grossAssets - snapshot.assets.debt;
  const netWorth = totalAssets;
  const cash = sumMatchingAssets(snapshot.assets.items, ["현금", "예금", "적금", "CMA", "cash"]);
  const isa =
    sumMatchingAssets(snapshot.assets.items, FUTURE_ASSET_ISA_KEYWORDS) +
    sumHoldingValuesByAccount(holdings, FUTURE_ASSET_ISA_KEYWORDS, market, fxRate);
  const kyungjuKakaoPension =
    sumMatchingAssets(snapshot.assets.items, KYUNGJU_KAKAO_PENSION_ASSET_KEYWORDS) +
    sumHoldingValuesByAccount(holdings, KYUNGJU_KAKAO_PENSION_ACCOUNT_KEYWORDS, market, fxRate);
  const heroKakaoPension =
    sumMatchingAssets(snapshot.assets.items, HERO_KAKAO_PENSION_KEYWORDS) +
    sumHoldingValuesByAccount(holdings, HERO_KAKAO_PENSION_KEYWORDS, market, fxRate);
  const pension = kyungjuKakaoPension + heroKakaoPension;
  const growthStock = sumTickers(marketValueByTicker, GROWTH_TICKERS);
  const sp500 = sumTickers(marketValueByTicker, SP500_TICKERS);
  const leveraged = sumTickers(marketValueByTicker, LEVERAGED_TICKERS);

  const previousReportAssets = previousReport?.asset_snapshot || previousReport?.assetSnapshot || null;
  const previousTotalAssets = Number(previousReportAssets?.totalAssets ?? previousReportAssets?.netWorth);
  const previousClose = latestPreviousClose(state.monthlyClosings, budget.month);
  const previousNetWorth = Number.isFinite(previousTotalAssets) && previousTotalAssets > 0 ? previousTotalAssets : Number(previousClose?.netWorth);
  const dailyChange = Number.isFinite(previousNetWorth) && previousNetWorth > 0 ? netWorth - previousNetWorth : null;
  const dailyChangeBasis =
    Number.isFinite(previousTotalAssets) && previousTotalAssets > 0
      ? `previous_report:${previousReport.report_date}`
      : previousClose
        ? "monthly_close"
        : "none";

  return {
    totalAssets,
    netWorth,
    stockAccountValue: stockValue,
    allStockAccountValue: allStockValue,
    financialAssets,
    grossAssets,
    cash,
    isa,
    pension,
    kyungjuKakaoPension,
    heroKakaoPension,
    monthlyExpense: budget.totals.expense,
    variableExpense: budget.totals.variableExpense,
    dailyChange,
    dailyChangeBasis,
    growthStockWeight: stockValue ? (growthStock / stockValue) * 100 : 0,
    sp500Weight: stockValue ? (sp500 / stockValue) * 100 : 0,
    leverageWeight: stockValue ? (leveraged / stockValue) * 100 : 0,
    cashWeight: totalAssets ? (cash / totalAssets) * 100 : 0,
    stockWeight: totalAssets ? (stockValue / totalAssets) * 100 : 0,
    debt: snapshot.assets.debt,
    fxRate
  };
}

function analyzeQqq(qqq) {
  const drawdownPct = Number(qqq?.drawdownPct);
  let zone = "데이터 확인 필요";

  if (Number.isFinite(drawdownPct)) {
    if (drawdownPct <= -30) zone = "공격적 매수 구간";
    else if (drawdownPct <= -20) zone = "적극 매수 검토 구간";
    else if (drawdownPct <= -15) zone = "1차 관심 구간";
    else if (drawdownPct <= -10) zone = "평소 적립 구간 하단";
    else zone = "평소 적립 구간";
  }

  return { drawdownPct, zone };
}

function buildCioOpinion({ qqq, assets, market, macro }) {
  const lines = [];
  lines.push(`QQQ는 현재 "${qqq.zone}"입니다. 단기 예측보다 2036년 목표 달성률과 현금 여력을 우선합니다.`);
  lines.push(`현금비중은 ${fmtPct(assets.cashWeight)}로, 급락 구간 대응력을 함께 점검하세요.`);
  lines.push(`레버리지 비중은 ${fmtPct(assets.leverageWeight)}입니다. TQQQ/QLD/SOXL은 정해둔 구간에서만 증액하는 원칙이 좋습니다.`);
  if (market.byKey.USDKRW?.price >= 1450) lines.push("원달러 환율이 높은 편이라 신규 환전은 분할 접근이 유리합니다.");
  if (macro.byKey.fedFunds?.value) lines.push(`미국 기준금리는 약 ${fmtFedFunds(macro.byKey.fedFunds)} 수준입니다. 금리 방향보다 적립 리듬 유지가 중요합니다.`);
  return lines.slice(0, 5);
}

function buildActionCard({ qqq, assets, market }) {
  const drawdown = qqq.drawdownPct;
  if (Number.isFinite(drawdown) && drawdown <= -30) return "🚨 QQQ -30% 구간 진입. 공격적 매수 원칙과 현금 한도를 함께 확인하세요.";
  if (Number.isFinite(drawdown) && drawdown <= -20) return "🚨 QQQ -20% 구간 진입. 달러 현금 일부 투입을 검토하세요.";
  if (Number.isFinite(drawdown) && drawdown <= -15) return "🚨 QQQ -15% 구간 진입. 1차 매수 검토하세요.";
  if (market.byKey.USDKRW?.price >= 1500) return "✅ 환율이 높으므로 신규 달러 환전은 보류하세요.";
  if (assets.leverageWeight >= 35) return "✅ 레버리지 비중이 높으므로 오늘은 ISA 적립만 유지하세요.";
  return "✅ QQQ는 아직 -15% 미만이므로 TQQQ 추가매수는 대기하세요.";
}

function buildConditionAlerts(report) {
  const today = report.reportDate;
  const alerts = [];

  const vix = report.market.byKey.VIX?.price;
  if (vix >= 30) alerts.push(conditionAlert(today, "vix:30", "danger", "VIX 30 이상", `현재 VIX는 ${fmtNumber(vix)}입니다.`));

  const usdkrw = report.market.byKey.USDKRW?.price;
  if (usdkrw >= 1500) alerts.push(conditionAlert(today, "usdkrw:1500", "warning", "USD/KRW 1500원 이상", `현재 USD/KRW는 ${fmtNumber(usdkrw)}원입니다.`));

  const nextFomc = report.macro.fomc?.nextMeeting?.date;
  if (isTomorrowKst(nextFomc)) alerts.push(conditionAlert(today, "fomc:tomorrow", "info", "FOMC 하루 전", `다음 FOMC 일정은 ${nextFomc}입니다.`));

  return alerts;
}

function conditionAlert(reportDate, key, severity, title, message) {
  return {
    alert_key: `${key}:${reportDate}`,
    report_date: reportDate,
    type: "condition",
    severity,
    title,
    message,
    payload: { key, title, message },
    triggered_at: new Date().toISOString(),
    sent_at: null
  };
}

function formatTelegramMessage({ assets, market, macro, news, qqq, cioOpinion, actionCard }) {
  const line = [];
  line.push("📈 OurCFO CIO Report");
  line.push(`${kstDate()} 오전 8시`);
  line.push("");
  line.push("💰 우리집 자산");
  line.push(`총자산: ${fmtKrw(assets.totalAssets)}`);
  line.push(`전일대비: ${Number.isFinite(Number(assets.dailyChange)) ? fmtSignedKrw(assets.dailyChange) : "전일 리포트 없음"}`);
  line.push(`주식비중: ${fmtPct(assets.stockWeight)}`);
  line.push(`ISA: ${fmtKrw(assets.isa)}`);
  line.push(`연금저축: ${fmtKrw(assets.pension)}`);
  line.push(`- 경주_카카오연금: ${fmtKrw(assets.kyungjuKakaoPension)}`);
  line.push(`- 영웅_영웅 카카오 연금계좌: ${fmtKrw(assets.heroKakaoPension)}`);
  line.push("");
  line.push("🇺🇸 미국시장");
  for (const key of ["QQQ", "QQQM", "SPY", "SPYM", "QLD", "TQQQ"]) {
    const item = market.byKey[key] || {};
    line.push(key);
    line.push(`현재가: ${fmtMarket(item)}`);
    line.push(`전일대비: ${fmtPct(item.changePct, true)}`);
    if (key === "QQQ") {
      line.push(`전고점 대비: ${fmtPct(qqq.drawdownPct)}`);
      line.push(`현재 구간: ${qqq.zone}`);
    }
  }
  line.push("");
  line.push("💵 환율");
  line.push(`USD/KRW: ${fmtNumber(market.byKey.USDKRW?.price)}원 (${fmtPct(market.byKey.USDKRW?.changePct, true)})`);
  line.push("");
  line.push("🏦 금리");
  line.push(`미국 기준금리: ${fmtFedFunds(macro.byKey.fedFunds)}`);
  line.push(`10년물: ${fmtNumber(market.byKey.US10Y?.price)}%`);
  line.push(`2년물: ${fmtNumber(market.byKey.US2Y?.price)}%`);
  line.push(`최근 FOMC: ${macro.fomc?.recentResult || "확인 필요"}`);
  line.push(`다음 FOMC: ${macro.fomc?.nextMeeting?.label || "확인 필요"}`);
  line.push("");
  line.push("📰 주요 경제 이슈");
  if (news.items.length) {
    news.items.slice(0, 5).forEach((item, index) => line.push(`${index + 1}. ${item.koreanSummary}`));
  } else {
    line.push("1. 뉴스 수집 실패 또는 주요 뉴스 없음. 장중 수동 확인 권장.");
  }
  line.push("");
  line.push("🤖 CIO 의견");
  cioOpinion.forEach((item) => line.push(item));
  line.push("");
  line.push("🎯 Action Card");
  line.push(actionCard);

  return line.join("\n");
}

function formatAlertMessage(alert) {
  return [`🚨 OurCFO 조건 알림`, alert.title, alert.message, "", "원칙: 단기매매보다 2036년 목표와 현금관리 기준으로 판단하세요."].join("\n");
}

function requireCronAuth(req, res) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.authorization || "";
  if (!secret && process.env.VERCEL_ENV !== "production") return true;
  if (secret && auth === `Bearer ${secret}`) return true;

  res.statusCode = secret ? 401 : 500;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ error: secret ? "Unauthorized" : "CRON_SECRET is required in production" }));
  return false;
}

function sumMatchingAssets(items, keywords) {
  return (items || [])
    .filter((item) => includesAny(`${item.category} ${item.name}`, keywords))
    .reduce((total, item) => total + (Number(item.amount) || 0), 0);
}

function sumMatchingAll(assetItems, holdings, keywords) {
  const manual = sumMatchingAssets(assetItems, keywords);
  const stocks = (holdings || [])
    .filter((item) => includesAny(`${item.account} ${item.ticker}`, keywords))
    .reduce((total, item) => total + (Number(item.quantity) || 0) * (Number(item.purchasePrice) || 0), 0);
  return manual + stocks;
}

function holdingMarketValue(holding, market, fxRate) {
  const ticker = String(holding.ticker || "").toUpperCase();
  const quote = market.byKey[ticker];
  const localPrice = quote?.price || holding.purchasePrice || 0;
  return (Number(holding.quantity) || 0) * localPrice * (holding.country === "KR" ? 1 : fxRate);
}

function sumHoldingValuesByAccount(holdings, keywords, market, fxRate) {
  return (holdings || [])
    .filter((item) => includesAnyNormalized(item.account, keywords))
    .reduce((total, item) => total + holdingMarketValue(item, market, fxRate), 0);
}

function isMeritzWAccount(state, holding) {
  const account = String(holding.account || "");
  const excluded = String(state.excludedStockAccount || "");
  return (excluded && normalizeText(account).includes(normalizeText(excluded))) || includesAnyNormalized(account, MERITZ_W_ACCOUNT_KEYWORDS);
}

function sumTickers(values, tickers) {
  return Object.entries(values).reduce((total, [ticker, value]) => total + (tickers.has(ticker) ? value : 0), 0);
}

function includesAny(value, keywords) {
  const haystack = String(value || "").toLowerCase();
  return keywords.some((keyword) => haystack.includes(String(keyword).toLowerCase()));
}

function includesAnyNormalized(value, keywords) {
  const haystack = normalizeText(value);
  return keywords.some((keyword) => haystack.includes(normalizeText(keyword)));
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function latestPreviousClose(closings, month) {
  const key = Object.keys(closings || {})
    .filter((item) => item < month)
    .sort()
    .at(-1);
  return key ? closings[key] : null;
}

function fmtMarket(item) {
  if (!Number.isFinite(Number(item?.price))) return "확인 필요";
  const unit = item.currency === "KRW" ? "원" : item.currency === "%" ? "%" : "";
  return `${fmtNumber(item.price)}${unit}`;
}

function fmtKrw(value) {
  const number = Number(value) || 0;
  const abs = Math.abs(number);
  const sign = number < 0 ? "-" : "";
  if (abs >= 100000000) return `${sign}${(abs / 100000000).toFixed(1).replace(".0", "")}억원`;
  if (abs >= 10000) return `${sign}${Math.round(abs / 10000).toLocaleString("ko-KR")}만원`;
  return `${sign}${Math.round(abs).toLocaleString("ko-KR")}원`;
}

function fmtSignedKrw(value) {
  return `${Number(value) > 0 ? "+" : ""}${fmtKrw(value)}`;
}

function fmtPct(value, signed = false) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "확인 필요";
  return `${signed && number > 0 ? "+" : ""}${number.toFixed(1)}%`;
}

function fmtNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "확인 필요";
  return number >= 1000 ? Math.round(number).toLocaleString("ko-KR") : number.toFixed(2).replace(/\.00$/, "");
}

function fmtFedFunds(item) {
  if (!item) return "확인 필요";
  if (item.displayValue) return item.displayValue;
  if (!Number.isFinite(Number(item.value))) return "확인 필요";
  return `${fmtNumber(item.value)}%`;
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

function isTomorrowKst(dateText) {
  if (!dateText) return false;
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(tomorrow);
  const value = `${parts.find((part) => part.type === "year").value}-${parts.find((part) => part.type === "month").value}-${parts.find((part) => part.type === "day").value}`;
  return dateText === value;
}

module.exports = {
  buildCioReport,
  formatAlertMessage,
  requireCronAuth,
  runConditionAlerts,
  runDailyBriefing
};
