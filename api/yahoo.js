const ALLOWED_RANGES = new Set(["1mo", "3mo", "6mo", "1y", "2y", "5y", "max"]);
const ALLOWED_INTERVALS = new Set(["1d", "1wk"]);
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36";

module.exports = async function handler(req, res) {
  const symbols = String(req.query?.symbols || "")
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 24);
  const range = ALLOWED_RANGES.has(req.query?.range) ? req.query.range : "1y";
  const interval = ALLOWED_INTERVALS.has(req.query?.interval) ? req.query.interval : "1d";

  if (!symbols.length) {
    return res.status(400).json({ error: "symbols query is required" });
  }

  const results = await Promise.all(symbols.map((symbol) => fetchSymbol(symbol, range, interval)));

  res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=3600");
  return res.status(200).json({
    source: "Yahoo Finance",
    asOf: new Date().toISOString(),
    results
  });
};

async function fetchSymbol(symbol, range, interval) {
  try {
    const chartUrl = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`);
    chartUrl.searchParams.set("range", range);
    chartUrl.searchParams.set("interval", interval);
    chartUrl.searchParams.set("events", "div,splits");
    chartUrl.searchParams.set("includePrePost", "false");

    const chartResponse = await fetch(chartUrl, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" }
    });

    if (!chartResponse.ok) {
      throw new Error(`chart request failed: ${chartResponse.status}`);
    }

    const chartPayload = await chartResponse.json();
    const chart = chartPayload.chart?.result?.[0];
    if (!chart) throw new Error(chartPayload.chart?.error?.description || "chart data unavailable");

    const timestamps = chart.timestamp || [];
    const closes = chart.indicators?.quote?.[0]?.close || [];
    const history = timestamps
      .map((timestamp, index) => ({ timestamp, close: closes[index] }))
      .filter((point) => Number.isFinite(point.close));
    const latest = history.at(-1)?.close ?? chart.meta?.regularMarketPrice ?? null;
    const previous =
      history.length > 1
        ? history.at(-2).close
        : chart.meta?.previousClose ?? chart.meta?.chartPreviousClose ?? latest;
    const changePct = previous ? ((latest - previous) / previous) * 100 : 0;
    const allTimeHigh = history.length ? Math.max(...history.map((point) => point.close)) : latest;

    const dividends = Object.values(chart.events?.dividends || {})
      .map((event) => ({ date: Number(event.date), amount: Number(event.amount) || 0 }))
      .filter((event) => event.date && event.amount >= 0)
      .sort((a, b) => a.date - b.date);
    const oneYearAgo = Date.now() / 1000 - 370 * 24 * 60 * 60;
    const annualDividend = dividends
      .filter((event) => event.date >= oneYearAgo)
      .reduce((total, event) => total + event.amount, 0);
    const dividendMonths = [
      ...new Set(
        dividends
          .slice(-12)
          .map((event) => new Date(event.date * 1000).getUTCMonth() + 1)
          .sort((a, b) => a - b)
      )
    ];

    const profile = await fetchProfile(symbol);

    return {
      symbol,
      shortName: profile.shortName || chart.meta?.shortName || symbol,
      sector: profile.sector || inferSector(symbol),
      industry: profile.industry || "",
      currency: chart.meta?.currency || "",
      exchangeName: chart.meta?.exchangeName || "",
      price: latest,
      previousClose: previous,
      changePct,
      allTimeHigh,
      annualDividend,
      dividendMonths,
      history
    };
  } catch (error) {
    return { symbol, error: error instanceof Error ? error.message : "unknown error" };
  }
}

async function fetchProfile(symbol) {
  if (symbol.startsWith("^") || symbol.includes("=")) return {};

  try {
    const url = new URL("https://query2.finance.yahoo.com/v1/finance/search");
    url.searchParams.set("q", symbol);
    url.searchParams.set("quotesCount", "6");
    url.searchParams.set("newsCount", "0");
    url.searchParams.set("enableFuzzyQuery", "false");

    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" }
    });
    if (!response.ok) return {};

    const payload = await response.json();
    const match =
      payload.quotes?.find((quote) => String(quote.symbol).toUpperCase() === symbol) || payload.quotes?.[0] || {};

    return {
      shortName: match.shortname || match.longname || "",
      sector: match.sectorDisp || match.sector || "",
      industry: match.industryDisp || match.industry || ""
    };
  } catch {
    return {};
  }
}

function inferSector(symbol) {
  const broadMarket = new Set(["QQQ", "QQQM", "QLD", "TQQQ", "SPY", "SPYM"]);
  return broadMarket.has(symbol) ? "Broad Market ETF" : "미분류";
}
