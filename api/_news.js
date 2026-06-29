const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36";

const NEWS_QUERY =
  '(Fed OR "interest rate" OR CPI OR inflation OR Nasdaq OR "AI stocks" OR Nvidia OR Apple OR Tesla OR Palantir OR semiconductor) when:2d';

async function collectNewsData() {
  try {
    const url = new URL("https://news.google.com/rss/search");
    url.searchParams.set("q", NEWS_QUERY);
    url.searchParams.set("hl", "en-US");
    url.searchParams.set("gl", "US");
    url.searchParams.set("ceid", "US:en");

    const response = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "application/rss+xml" } });
    if (!response.ok) throw new Error(`Google News RSS failed: ${response.status}`);

    const xml = await response.text();
    const items = parseRssItems(xml)
      .filter((item) => item.title)
      .filter(uniqueByTitle())
      .slice(0, 5)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
        koreanSummary: summarizeInKorean(item.title, item.source)
      }));

    return {
      asOf: new Date().toISOString(),
      source: "Google News RSS",
      items
    };
  } catch (error) {
    return {
      asOf: new Date().toISOString(),
      source: "Google News RSS",
      error: error instanceof Error ? error.message : "unknown news error",
      items: []
    };
  }
}

function parseRssItems(xml) {
  const matches = [...String(xml || "").matchAll(/<item>([\s\S]*?)<\/item>/gi)];
  return matches.map((match) => {
    const block = match[1];
    const title = cleanXml(pick(block, "title"));
    const link = cleanXml(pick(block, "link"));
    const pubDate = cleanXml(pick(block, "pubDate"));
    const source = cleanXml(pick(block, "source"));
    return { title: stripPublisher(title), originalTitle: title, link, pubDate, source };
  });
}

function pick(block, tag) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match?.[1] || "";
}

function cleanXml(value) {
  return String(value || "")
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function stripPublisher(title) {
  return String(title || "").replace(/\s+-\s+[^-]+$/, "").trim();
}

function uniqueByTitle() {
  const seen = new Set();
  return (item) => {
    const key = item.title.toLowerCase().replace(/[^a-z0-9가-힣]/g, "").slice(0, 90);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  };
}

function summarizeInKorean(title, source) {
  const lower = String(title || "").toLowerCase();
  const topic = [];
  if (lower.includes("fed") || lower.includes("rate")) topic.push("연준/금리");
  if (lower.includes("cpi") || lower.includes("inflation")) topic.push("물가");
  if (lower.includes("nasdaq") || lower.includes("ai") || lower.includes("nvidia")) topic.push("나스닥·AI");
  if (lower.includes("apple") || lower.includes("tesla") || lower.includes("palantir")) topic.push("대형 성장주");
  if (lower.includes("semiconductor") || lower.includes("chip")) topic.push("반도체");

  const label = topic.length ? topic.join(", ") : "시장";
  return `${label} 관련 이슈입니다. 원문 제목: ${title}${source ? ` (${source})` : ""}. 장기 원칙 관점에서 포트폴리오 비중과 현금 여력을 점검하세요.`;
}

module.exports = { collectNewsData };
