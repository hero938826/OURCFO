const { requireCronAuth } = require("./_cio.js");
const { sendTelegramMessage } = require("./_telegram.js");

require("./_env.js").loadLocalEnv();

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36";

const SECTOR_KO = {
  "Basic Materials": "소재",
  "Consumer Discretionary": "경기소비재",
  "Consumer Staples": "필수소비재",
  Energy: "에너지",
  Financials: "금융",
  "Health Care": "헬스케어",
  Industrials: "산업재",
  "Real Estate": "부동산",
  Technology: "기술",
  Telecommunications: "통신",
  Utilities: "유틸리티"
};

async function runNasdaqDrawdownScan({ send = true } = {}) {
  const report = await buildNasdaqDrawdownReport();
  if (send) await sendTelegramMessage(report.message);
  return report;
}

async function buildNasdaqDrawdownReport() {
  const constituents = await fetchNasdaq100Constituents();
  const quotes = await fetchYahooQuotes(constituents.map((item) => item.symbol));
  const candidates = constituents
    .map((item) => {
      const quote = quotes.get(item.symbol);
      const price = numberOrNull(quote?.regularMarketPrice);
      const yearHigh = numberOrNull(quote?.fiftyTwoWeekHigh);
      const changePct = numberOrNull(quote?.regularMarketChangePercent);
      const threeMonthChangePct = numberOrNull(quote?.threeMonthChangePercent);
      const drawdownPct = price && yearHigh ? ((price - yearHigh) / yearHigh) * 100 : null;
      return {
        ...item,
        price,
        yearHigh,
        changePct,
        threeMonthChangePct,
        drawdownPct,
        marketCap: numberOrNull(quote?.marketCap),
        quoteType: quote?.quoteType || ""
      };
    })
    .filter((item) => Number.isFinite(item.drawdownPct))
    .filter((item) => Number.isFinite(item.threeMonthChangePct));
  const rows = rankByCompositeDecline(candidates).slice(0, 10);

  const rowsWithIssues = await Promise.all(rows.map(addRecentIssue));
  const message = formatDrawdownMessage(rowsWithIssues);

  return {
    reportDate: kstDate(),
    source: "Wikipedia Nasdaq-100 constituents, Yahoo Finance quote, Google News RSS",
    totalScanned: constituents.length,
    rows: rowsWithIssues,
    message
  };
}

async function fetchNasdaq100Constituents() {
  const response = await fetch("https://en.wikipedia.org/wiki/Nasdaq-100", {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html" }
  });
  if (!response.ok) throw new Error(`Nasdaq-100 constituents fetch failed: ${response.status}`);

  const html = await response.text();
  const tableMatch =
    html.match(/<table[^>]+id="constituents"[\s\S]*?<\/table>/i) ||
    html.match(/<caption>\s*Nasdaq-100 component stocks[\s\S]*?<\/table>/i);
  if (!tableMatch) throw new Error("Nasdaq-100 constituents table not found");

  const rows = [...tableMatch[0].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)]
    .map((match) => parseConstituentRow(match[1]))
    .filter(Boolean);

  if (rows.length < 90) throw new Error(`Nasdaq-100 constituents parse returned only ${rows.length} rows`);
  return rows;
}

function parseConstituentRow(rowHtml) {
  const cells = [...rowHtml.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((match) => cleanHtml(match[1]));
  if (cells.length < 3 || /^company$/i.test(cells[0])) return null;

  const symbol = yahooSymbol(cells[0]);
  const company = cells[1];
  const sector = translateSector(cells[2] || "Unknown");
  if (!symbol || symbol === "TICKER") return null;
  return { symbol, company, sector };
}

async function fetchYahooQuotes(symbols) {
  return fetchYahooChartQuotes(symbols);
}

function rankByCompositeDecline(rows) {
  const drawdownRanks = rankMap(rows, "drawdownPct");
  const threeMonthRanks = rankMap(rows, "threeMonthChangePct");
  return rows
    .map((row) => ({
      ...row,
      drawdownRank: drawdownRanks.get(row.symbol),
      threeMonthRank: threeMonthRanks.get(row.symbol),
      compositeRank: drawdownRanks.get(row.symbol) + threeMonthRanks.get(row.symbol)
    }))
    .sort((a, b) => a.compositeRank - b.compositeRank || a.drawdownPct - b.drawdownPct || a.threeMonthChangePct - b.threeMonthChangePct);
}

function rankMap(rows, key) {
  const sorted = [...rows].sort((a, b) => a[key] - b[key]);
  return new Map(sorted.map((row, index) => [row.symbol, index + 1]));
}

async function fetchYahooChartQuotes(symbols) {
  const quoteMap = new Map();
  const uniqueSymbols = [...new Set(symbols)].filter(Boolean);
  let index = 0;

  async function worker() {
    while (index < uniqueSymbols.length) {
      const symbol = uniqueSymbols[index];
      index += 1;
      const quote = await fetchYahooChartQuote(symbol).catch(() => null);
      if (quote) quoteMap.set(symbol, quote);
    }
  }

  await Promise.all(Array.from({ length: 16 }, worker));
  return quoteMap;
}

async function fetchYahooChartQuote(symbol) {
  const url = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`);
  url.searchParams.set("range", "1y");
  url.searchParams.set("interval", "1d");
  url.searchParams.set("events", "div,splits");
  url.searchParams.set("includePrePost", "false");

  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } });
  if (!response.ok) throw new Error(`Yahoo chart failed: ${response.status}`);
  const payload = await response.json();
  const chart = payload.chart?.result?.[0];
  if (!chart) return null;

  const closes = chart.indicators?.quote?.[0]?.close || [];
  const history = closes.map(numberOrNull).filter((value) => Number.isFinite(value));
  const price = numberOrNull(history.at(-1) ?? chart.meta?.regularMarketPrice);
  const previousClose = numberOrNull(history.at(-2) ?? chart.meta?.previousClose ?? chart.meta?.chartPreviousClose);
  const threeMonthAgo = numberOrNull(history.at(-64) ?? history[0]);
  const yearHigh = history.length ? Math.max(...history) : numberOrNull(chart.meta?.fiftyTwoWeekHigh);
  const changePct = previousClose ? ((price - previousClose) / previousClose) * 100 : null;
  const threeMonthChangePct = threeMonthAgo ? ((price - threeMonthAgo) / threeMonthAgo) * 100 : null;

  return {
    symbol,
    regularMarketPrice: price,
    regularMarketChangePercent: changePct,
    threeMonthChangePercent: threeMonthChangePct,
    fiftyTwoWeekHigh: yearHigh,
    quoteType: chart.meta?.instrumentType || ""
  };
}

async function addRecentIssue(row) {
  const query = `${row.symbol} ${row.company} stock when:7d`;
  try {
    const url = new URL("https://news.google.com/rss/search");
    url.searchParams.set("q", query);
    url.searchParams.set("hl", "en-US");
    url.searchParams.set("gl", "US");
    url.searchParams.set("ceid", "US:en");

    const response = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "application/rss+xml" } });
    if (!response.ok) throw new Error(`Google News failed: ${response.status}`);
    const xml = await response.text();
    const title = cleanHtml(xml.match(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>/i)?.[1] || "");
    return { ...row, issue: summarizeIssue(title, row) };
  } catch {
    return { ...row, issue: "최근 뉴스 확인 필요" };
  }
}

function summarizeIssue(title, row) {
  if (!title) return "최근 뉴스 확인 필요";
  const stripped = title.replace(/\s+-\s+[^-]+$/, "").trim();
  const lower = stripped.toLowerCase();
  if (lower.includes("earnings") || lower.includes("revenue") || lower.includes("profit")) {
    return `${row.company} 실적과 매출 전망이 주가 변동의 핵심 이슈로 거론되고 있어요.`;
  }
  if (lower.includes("guidance") || lower.includes("forecast") || lower.includes("outlook")) {
    return `${row.company}의 향후 실적 가이던스와 성장 전망을 시장이 다시 평가하고 있어요.`;
  }
  if (lower.includes("ai") || lower.includes("chip") || lower.includes("semiconductor")) {
    return `${row.company}는 AI/반도체 투자 기대와 수요 둔화 우려가 함께 반영되고 있어요.`;
  }
  if (lower.includes("downgrade") || lower.includes("rating") || lower.includes("target") || lower.includes("analyst")) {
    return `${row.company}에 대한 증권가 투자의견이나 목표주가 조정이 최근 이슈예요.`;
  }
  if (lower.includes("antitrust") || lower.includes("probe") || lower.includes("lawsuit") || lower.includes("regulator")) {
    return `${row.company}는 규제, 조사, 소송 관련 불확실성이 투자심리에 영향을 주고 있어요.`;
  }
  if (lower.includes("drops") || lower.includes("falls") || lower.includes("slumps") || lower.includes("down")) {
    return `${row.company} 주가 하락이 최근 시장에서 주목받고 있어요.`;
  }
  if (lower.includes("buy") || lower.includes("best") || lower.includes("opportunity")) {
    return `${row.company}의 밸류에이션과 저가매수 가능성을 두고 의견이 엇갈리고 있어요.`;
  }
  if (lower.includes("competition") || lower.includes("pricing")) {
    return `${row.company}는 경쟁 심화와 가격 정책이 주요 변수로 언급되고 있어요.`;
  }
  return `${row.company} 관련 최근 뉴스가 있어요. 핵심은 실적, 성장성, 밸류에이션을 함께 확인하는 거예요.`;
}

function translateSector(sector) {
  return SECTOR_KO[sector] || sector;
}

function formatDrawdownMessage(rows) {
  const lines = [];
  lines.push(`📆${kstDate()}`);
  lines.push("");
  lines.push("🚩하락 종목(52주 전고점 + 최근 3개월 하락률 반영)");
  lines.push("");

  rows.forEach((row, index) => {
    lines.push(
      `${index + 1}. ${row.symbol}_${row.sector}_✔️52주 전고점 대비 ${fmtPct(row.drawdownPct)}_📉3개월 ${fmtPct(row.threeMonthChangePct)}_🧮전일 대비 ${fmtPct(row.changePct, true)}_${row.issue}`
    );
    lines.push("");
  });

  if (!rows.length) lines.push("데이터를 확인하지 못했습니다.");
  return lines.join("\n").trim();
}

async function handler(req, res) {
  if (!requireCronAuth(req, res)) return;

  const dryRun = req.query?.dryRun === "1" || req.query?.dryRun === "true";
  const shouldSend = req.query?.send === "0" || req.query?.send === "false" ? false : !dryRun;

  try {
    const report = await runNasdaqDrawdownScan({ send: shouldSend });
    res.status(200).json({
      ok: true,
      sent: shouldSend,
      reportDate: report.reportDate,
      totalScanned: report.totalScanned,
      rows: report.rows,
      message: dryRun ? report.message : undefined
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      await sendTelegramMessage(`🚨 OurCFO 나스닥100 하락률 스캔 실패\n${message}`).catch(() => {});
    }
    res.status(500).json({ ok: false, error: message });
  }
}

function cleanHtml(value) {
  return String(value || "")
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#160;|&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function yahooSymbol(symbol) {
  return cleanHtml(symbol).toUpperCase().replace(".", "-");
}

function chunk(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) chunks.push(items.slice(index, index + size));
  return chunks;
}

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function fmtPct(value, signed = false) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "확인 필요";
  return `${signed && number > 0 ? "+" : ""}${number.toFixed(1)}%`;
}

function kstDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  return `${parts.find((part) => part.type === "year").value}-${parts.find((part) => part.type === "month").value}-${parts.find((part) => part.type === "day").value}`;
}

module.exports = { buildNasdaqDrawdownReport, handler, runNasdaqDrawdownScan };
