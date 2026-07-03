const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36";

const MARKET_SYMBOLS = [
  { key: "QQQ", symbol: "QQQ", label: "QQQ" },
  { key: "QQQM", symbol: "QQQM", label: "QQQM" },
  { key: "SPY", symbol: "SPY", label: "SPY" },
  { key: "SPYM", symbol: "SPYM", label: "SPYM" },
  { key: "QLD", symbol: "QLD", label: "QLD" },
  { key: "TQQQ", symbol: "TQQQ", label: "TQQQ" },
  { key: "SOXL", symbol: "SOXL", label: "SOXL" },
  { key: "VIX", symbol: "^VIX", label: "VIX" },
  { key: "DXY", symbol: "DX-Y.NYB", label: "DXY" },
  { key: "USDKRW", symbol: "KRW=X", label: "USD/KRW" },
  { key: "GOLD", symbol: "GC=F", label: "Gold" },
  { key: "WTI", symbol: "CL=F", label: "WTI" },
  { key: "BTC", symbol: "BTC-USD", label: "Bitcoin" }
];

async function collectMarketData(extraSymbols = []) {
  const extras = extraSymbols
    .map((symbol) => String(symbol || "").trim().toUpperCase())
    .filter(Boolean)
    .filter((symbol) => !MARKET_SYMBOLS.some((item) => item.symbol === symbol || item.key === symbol))
    .map((symbol) => ({ key: symbol, symbol, label: symbol }));

  const [marketResults, tenYear, twoYear] = await Promise.all([
    Promise.all([...MARKET_SYMBOLS, ...extras].map(fetchYahooItem)),
    fetchFredRate("DGS10", "US10Y", "미국 10년물"),
    fetchFredRate("DGS2", "US2Y", "미국 2년물")
  ]);

  const byKey = {};
  for (const item of marketResults) byKey[item.key] = item;
  byKey.US10Y = tenYear;
  byKey.US2Y = twoYear;

  return {
    asOf: new Date().toISOString(),
    source: "Yahoo Finance, FRED",
    items: Object.values(byKey),
    byKey
  };
}

async function fetchYahooItem(item) {
  try {
    const url = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(item.symbol)}`);
    url.searchParams.set("range", "1y");
    url.searchParams.set("interval", "1d");
    url.searchParams.set("events", "div,splits");
    url.searchParams.set("includePrePost", "false");

    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: timeoutSignal(8000)
    });
    if (!response.ok) throw new Error(`Yahoo chart failed: ${response.status}`);

    const payload = await response.json();
    const chart = payload.chart?.result?.[0];
    if (!chart) throw new Error(payload.chart?.error?.description || "chart data unavailable");

    const closes = chart.indicators?.quote?.[0]?.close || [];
    const timestamps = chart.timestamp || [];
    const history = timestamps
      .map((timestamp, index) => ({ timestamp, close: numberOrNull(closes[index]) }))
      .filter((point) => Number.isFinite(point.close));

    const price = numberOrNull(history.at(-1)?.close ?? chart.meta?.regularMarketPrice);
    const previousClose = numberOrNull(history.at(-2)?.close ?? chart.meta?.previousClose ?? chart.meta?.chartPreviousClose);
    const yearHigh = history.length ? Math.max(...history.map((point) => point.close)) : price;
    const yearLow = history.length ? Math.min(...history.map((point) => point.close)) : price;
    const changePct = previousClose ? ((price - previousClose) / previousClose) * 100 : null;
    const drawdownPct = yearHigh ? ((price - yearHigh) / yearHigh) * 100 : null;

    return {
      key: item.key,
      symbol: item.symbol,
      label: item.label,
      price,
      previousClose,
      changePct,
      yearHigh,
      yearLow,
      drawdownPct,
      currency: chart.meta?.currency || "",
      asOf: new Date((timestamps.at(-1) || Date.now() / 1000) * 1000).toISOString(),
      source: "Yahoo Finance"
    };
  } catch (error) {
    return {
      key: item.key,
      symbol: item.symbol,
      label: item.label,
      error: error instanceof Error ? error.message : "unknown market error"
    };
  }
}

async function fetchFredRate(seriesId, key, label) {
  try {
    const url = new URL("https://fred.stlouisfed.org/graph/fredgraph.csv");
    url.searchParams.set("id", seriesId);
    const response = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "text/csv" }, signal: timeoutSignal(8000) });
    if (!response.ok) throw new Error(`FRED ${seriesId} failed: ${response.status}`);
    const text = await response.text();
    const rows = text
      .trim()
      .split(/\r?\n/)
      .slice(1)
      .map((line) => {
        const [date, value] = line.split(",");
        return { date, value: Number(value) };
      })
      .filter((row) => row.date && Number.isFinite(row.value));
    const latest = rows.at(-1);
    const previous = rows.at(-2);
    const values = rows.slice(-260).map((row) => row.value);

    return {
      key,
      symbol: seriesId,
      label,
      price: latest?.value ?? null,
      previousClose: previous?.value ?? null,
      changePct: previous?.value ? ((latest.value - previous.value) / previous.value) * 100 : null,
      yearHigh: values.length ? Math.max(...values) : null,
      yearLow: values.length ? Math.min(...values) : null,
      drawdownPct: values.length ? latest.value - Math.max(...values) : null,
      currency: "%",
      asOf: latest?.date || new Date().toISOString(),
      source: "FRED"
    };
  } catch (error) {
    return { key, symbol: seriesId, label, error: error instanceof Error ? error.message : "unknown FRED error" };
  }
}

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function timeoutSignal(ms) {
  return typeof AbortSignal !== "undefined" && AbortSignal.timeout ? AbortSignal.timeout(ms) : undefined;
}

module.exports = { MARKET_SYMBOLS, collectMarketData, fetchYahooItem };
