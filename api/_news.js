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
  const company = detectCompany(lower);
  const prefix = source ? `${source}: ` : "";

  if (lower.includes("fed") || lower.includes("federal reserve") || lower.includes("interest rate") || lower.includes("rate cut")) {
    return `${prefix}연준의 금리 결정과 인하 시점에 대한 시장 기대가 다시 주목받고 있어요. 성장주와 환율 변동성을 함께 봐야 합니다.`;
  }
  if (lower.includes("cpi") || lower.includes("inflation") || lower.includes("prices")) {
    return `${prefix}물가 지표가 금리 전망의 핵심 변수로 떠올랐어요. CPI가 높으면 금리 인하 기대가 약해질 수 있습니다.`;
  }
  if (lower.includes("pce")) {
    return `${prefix}연준이 선호하는 PCE 물가지표가 시장의 금리 전망을 흔들 수 있어요.`;
  }
  if (lower.includes("jobs") || lower.includes("payroll") || lower.includes("unemployment")) {
    return `${prefix}고용지표가 미국 경제 체력과 금리 방향을 판단하는 핵심 신호로 언급되고 있어요.`;
  }
  if (lower.includes("nasdaq") || lower.includes("tech stocks")) {
    return `${prefix}나스닥과 기술주 흐름이 시장 심리를 이끌고 있어요. QQQ 비중과 레버리지 노출을 함께 점검할 때입니다.`;
  }
  if (lower.includes("ai") || lower.includes("nvidia") || lower.includes("semiconductor") || lower.includes("chip")) {
    return `${prefix}${company || "AI·반도체"} 관련 기대와 밸류에이션 부담이 동시에 거론되고 있어요. SOXL·TQQQ는 변동성 관리가 중요합니다.`;
  }
  if (lower.includes("apple") || lower.includes("tesla") || lower.includes("palantir")) {
    return `${prefix}${company || "대형 성장주"} 관련 뉴스가 나왔어요. 개별 종목 뉴스보다 QQQ 전체 흐름과 장기 원칙을 우선해서 보면 좋습니다.`;
  }
  if (lower.includes("earnings") || lower.includes("revenue") || lower.includes("profit") || lower.includes("guidance")) {
    return `${prefix}기업 실적과 가이던스가 주가 변동의 주요 원인으로 언급되고 있어요. 성장성뿐 아니라 기대치가 높았는지도 같이 봐야 합니다.`;
  }
  if (lower.includes("dollar") || lower.includes("currency") || lower.includes("won")) {
    return `${prefix}달러와 환율 흐름이 해외투자 체감 가격에 영향을 주고 있어요. 신규 환전은 분할 접근이 유리합니다.`;
  }

  return `${prefix}미국 시장 관련 주요 뉴스가 나왔어요. 단기 반응보다 금리, 환율, QQQ 하락 구간, 현금관리 원칙과 연결해서 확인하세요.`;
}

function detectCompany(lower) {
  if (lower.includes("nvidia")) return "엔비디아";
  if (lower.includes("apple")) return "애플";
  if (lower.includes("tesla")) return "테슬라";
  if (lower.includes("palantir")) return "팔란티어";
  if (lower.includes("microsoft")) return "마이크로소프트";
  if (lower.includes("amazon")) return "아마존";
  if (lower.includes("meta")) return "메타";
  if (lower.includes("alphabet") || lower.includes("google")) return "알파벳";
  return "";
}

module.exports = { collectNewsData };
