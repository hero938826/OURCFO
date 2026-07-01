const fs = require("node:fs/promises");
const path = require("node:path");

const { requireCronAuth } = require("./_cio.js");
const { collectNewsData } = require("./_news.js");
const { sendTelegramMessage } = require("./_telegram.js");
const { hasSupabase, supabaseBaseUrl, supabaseHeaders } = require("./_supabase.js");

require("./_env.js").loadLocalEnv();

const DUPLICATE_WINDOW_DAYS = 45;

const LESSON_TERMS = [
  {
    term: "기준금리",
    category: "금리",
    difficulty: "초급",
    keywords: ["fed", "rate", "interest"],
    simple:
      "기준금리는 중앙은행이 정하는 돈의 기준 가격이에요. 금리가 높으면 돈을 빌리는 부담이 커지고, 소비와 투자가 천천히 식을 수 있어요.",
    home:
      "금리 인하 기대가 커지면 QQQ 같은 성장주에는 우호적일 수 있지만, TQQQ는 정해둔 하락 구간과 현금 원칙 안에서만 보는 게 좋아요.",
    takeaway: "기준금리는 경제 전체에 영향을 주는 돈의 기준 가격이다."
  },
  {
    term: "장기채 금리",
    category: "채권",
    difficulty: "중급",
    keywords: ["yield", "treasury", "bond"],
    simple:
      "장기채 금리는 긴 기간 돈을 빌릴 때 적용되는 시장 금리예요. 투자자들이 미래 물가나 성장률을 어떻게 보는지 담겨 있어요.",
    home:
      "장기채 금리가 내려가면 성장주의 미래 이익 가치가 더 좋게 평가될 수 있어요. 다만 연금저축과 ISA는 분산 적립 리듬이 더 중요해요.",
    takeaway: "장기채 금리는 시장이 보는 미래 경제의 온도계에 가깝다."
  },
  {
    term: "환율",
    category: "환율",
    difficulty: "초급",
    keywords: ["dollar", "currency", "won", "fx"],
    simple:
      "환율은 원화와 달러를 바꾸는 가격이에요. 원달러 환율이 높다는 건 같은 달러를 사는 데 원화가 더 많이 필요하다는 뜻이에요.",
    home:
      "환율이 높을 때는 미국 ETF를 무리해서 한 번에 사기보다, 현금흐름과 분할 환전을 같이 보는 편이 안정적이에요.",
    takeaway: "환율은 해외투자 수익률과 매수 타이밍의 체감 가격을 바꾼다."
  },
  {
    term: "CPI",
    category: "물가",
    difficulty: "초급",
    keywords: ["cpi", "inflation"],
    simple:
      "CPI는 사람들이 자주 사는 물건과 서비스 가격이 얼마나 올랐는지 보는 지표예요. 쉽게 말해 생활물가 성적표예요.",
    home:
      "CPI가 높게 나오면 금리 인하 기대가 약해질 수 있어요. QQQ와 TQQQ는 이런 날 변동성이 커질 수 있으니 원칙을 먼저 봐야 해요.",
    takeaway: "CPI는 금리와 주식시장 분위기를 흔드는 대표 물가지표다."
  },
  {
    term: "PCE",
    category: "물가",
    difficulty: "중급",
    keywords: ["pce", "inflation", "fed"],
    simple:
      "PCE는 미국 사람들이 실제로 돈을 어디에 쓰는지 반영한 물가지표예요. 연준이 물가 흐름을 볼 때 중요하게 참고해요.",
    home:
      "PCE 둔화는 성장주에 편안한 환경을 만들 수 있지만, 우리집 전략은 뉴스 한 번보다 2036년까지의 적립과 리밸런싱 원칙이 중심이에요.",
    takeaway: "PCE는 연준이 선호하는 물가 체온계다."
  },
  {
    term: "나스닥",
    category: "주식",
    difficulty: "초급",
    keywords: ["nasdaq", "tech", "ai"],
    simple:
      "나스닥은 기술주와 성장주가 많이 모여 있는 시장이에요. AI, 반도체, 소프트웨어 기업들의 흐름이 크게 반영돼요.",
    home:
      "QQQ는 나스닥100을 따라가기 때문에 우리집 성장주 비중을 볼 때 핵심 지표예요. 다만 레버리지 ETF는 낙폭 기준을 지키는 게 중요해요.",
    takeaway: "나스닥은 성장주 투자 분위기를 보여주는 대표 시장이다."
  },
  {
    term: "ETF",
    category: "ETF",
    difficulty: "초급",
    keywords: ["etf", "spy", "qqq"],
    simple:
      "ETF는 여러 자산을 한 바구니에 담아 주식처럼 사고파는 상품이에요. 한 종목보다 분산이 쉽다는 장점이 있어요.",
    home:
      "QQQ, SPY, QQQM, SPYM은 우리집 장기투자 바구니를 만드는 도구예요. ISA와 연금저축에서는 세제 혜택과 장기 복리가 함께 중요해요.",
    takeaway: "ETF는 분산투자를 쉽게 만들어주는 바구니 상품이다."
  },
  {
    term: "레버리지 ETF",
    category: "레버리지 ETF",
    difficulty: "실전투자",
    keywords: ["tqqq", "leveraged", "volatility"],
    simple:
      "레버리지 ETF는 지수 움직임을 몇 배로 따라가도록 만든 상품이에요. 오를 때는 강하지만, 하락과 횡보가 길면 손실도 크게 누적될 수 있어요.",
    home:
      "TQQQ는 QQQ 전고점 대비 -15%, -20%, -30% 같은 사전 기준을 두고 봐야 해요. 감정 매수보다 현금 한도와 원칙이 먼저예요.",
    takeaway: "레버리지 ETF는 기회보다 관리 규칙이 더 중요한 도구다."
  },
  {
    term: "ISA",
    category: "ISA",
    difficulty: "초급",
    keywords: ["tax", "saving", "isa"],
    simple:
      "ISA는 여러 금융상품을 담으면서 세금 혜택을 받을 수 있는 계좌예요. 단기 수익보다 꾸준히 채워가는 습관이 힘을 발휘해요.",
    home:
      "시장이 애매한 날에도 ISA 적립을 유지하면 우리집 장기 복리 엔진이 멈추지 않아요. 공격적 매수는 별도 기준에 맡기면 돼요.",
    takeaway: "ISA는 장기투자 습관과 세제 혜택을 연결하는 계좌다."
  },
  {
    term: "연금저축",
    category: "연금저축",
    difficulty: "초급",
    keywords: ["retirement", "pension", "tax"],
    simple:
      "연금저축은 노후 자금을 만들면서 세액공제 혜택을 받을 수 있는 계좌예요. 긴 시간과 복리를 내 편으로 만드는 구조예요.",
    home:
      "연금저축은 2036년 이후의 안정성을 키우는 장치예요. QQQ 같은 성장자산도 좋지만, 계좌별 목적을 나눠두면 흔들림이 줄어요.",
    takeaway: "연금저축은 미래 현금흐름을 만드는 장기 계좌다."
  },
  {
    term: "경기침체",
    category: "경기침체",
    difficulty: "중급",
    keywords: ["recession", "unemployment", "gdp"],
    simple:
      "경기침체는 경제 활동이 전반적으로 위축되는 시기예요. 기업 실적, 고용, 소비가 같이 약해질 수 있어요.",
    home:
      "침체 우려가 커질수록 현금비중과 가계부 방어력이 중요해져요. 좋은 자산을 오래 들고 가려면 버틸 체력이 필요해요.",
    takeaway: "경기침체 국면에서는 수익률보다 생존력과 현금흐름이 먼저다."
  },
  {
    term: "실업률",
    category: "고용지표",
    difficulty: "초급",
    keywords: ["jobs", "unemployment", "payrolls"],
    simple:
      "실업률은 일하고 싶은 사람 중 일자리를 못 찾은 비율이에요. 고용이 강하면 소비도 버티고, 금리 판단에도 영향을 줘요.",
    home:
      "고용이 너무 강하면 금리 인하가 늦어질 수 있어요. 그래서 성장주가 흔들려도 우리집은 매수 구간과 적립 원칙을 분리해서 보면 좋아요.",
    takeaway: "고용지표는 경제 체력과 금리 방향을 함께 보여준다."
  },
  {
    term: "기업실적",
    category: "기업실적",
    difficulty: "중급",
    keywords: ["earnings", "guidance", "revenue"],
    simple:
      "기업실적은 회사가 실제로 얼마나 벌고 성장했는지 보여주는 성적표예요. 주가는 결국 기대와 실적의 차이에 크게 반응해요.",
    home:
      "AI와 반도체 기업 실적은 QQQ 흐름에 큰 영향을 줄 수 있어요. 하지만 우리집은 개별 뉴스보다 ETF 중심 분산과 장기 목표를 우선해요.",
    takeaway: "기업실적은 주가 기대가 현실과 만나는 순간이다."
  },
  {
    term: "AI 반도체 사이클",
    category: "AI/반도체",
    difficulty: "실전투자",
    keywords: ["ai", "nvidia", "semiconductor", "chip"],
    simple:
      "AI 반도체 사이클은 데이터센터 투자와 칩 수요가 늘고 줄어드는 흐름이에요. 기대가 큰 만큼 실적 확인도 중요해요.",
    home:
      "SOXL이나 TQQQ처럼 변동성이 큰 상품은 AI 기대감만 보고 늘리기보다, QQQ 낙폭과 현금비중 기준을 함께 봐야 해요.",
    takeaway: "AI 반도체 투자는 성장성만큼 변동성 관리가 중요하다."
  },
  {
    term: "현금흐름",
    category: "가계부/현금흐름",
    difficulty: "초급",
    keywords: ["cash flow", "spending", "saving"],
    simple:
      "현금흐름은 들어오는 돈과 나가는 돈의 흐름이에요. 투자 실력은 수익률뿐 아니라 꾸준히 투자할 수 있는 생활 구조에서 나와요.",
    home:
      "가계부 지출을 줄이면 하락장에서도 ISA와 연금저축 적립을 이어갈 수 있어요. 2036년 목표에는 이 꾸준함이 아주 큰 힘이에요.",
    takeaway: "좋은 투자는 좋은 현금흐름 위에서 오래 지속된다."
  },
  {
    term: "방산주",
    category: "우주/방산",
    difficulty: "중급",
    keywords: ["defense", "space", "aerospace"],
    simple:
      "방산주는 국방, 항공, 우주 관련 사업을 하는 기업들의 주식이에요. 정부 예산과 지정학 이슈의 영향을 많이 받아요.",
    home:
      "새로운 테마가 좋아 보여도 우리집 핵심은 QQQ, S&P500, ISA, 연금저축의 장기 구조예요. 테마 투자는 전체 비중 안에서만 작게 보는 게 좋아요.",
    takeaway: "테마 투자는 핵심 자산을 보완하는 작은 위성 역할이 적절하다."
  }
];

async function runEconomyLesson({ send = true, save = true } = {}) {
  const lesson = await buildEconomyLesson();
  if (save) await saveEconomyLesson(lesson);
  if (send) await sendTelegramMessage(lesson.message);
  return lesson;
}

async function buildEconomyLesson() {
  const [news, recentlySentTerms] = await Promise.all([collectNewsData(), fetchRecentlySentTerms(DUPLICATE_WINDOW_DAYS)]);
  const difficulty = difficultyForDate(new Date());
  const selectedTerms = selectTerms({ news, recentlySentTerms, difficulty });
  const issue = pickIssue(news, selectedTerms);
  const review = await maybeBuildReview();
  const summary = buildSummary(selectedTerms, issue, review);
  const quiz = buildQuiz(selectedTerms[0]);
  const message = formatLessonMessage({ selectedTerms, issue, summary, quiz, review });

  return {
    lessonDate: kstDate(),
    terms: selectedTerms.map(({ term, category }) => ({ term, category })),
    difficulty,
    summary,
    quiz,
    issue,
    review,
    message,
    newsSnapshot: news.items || [],
    sentAt: new Date().toISOString()
  };
}

function selectTerms({ news, recentlySentTerms, difficulty }) {
  const lowerNews = (news.items || []).map((item) => item.title).join(" ").toLowerCase();
  const avoid = new Set(recentlySentTerms.map((term) => term.toLowerCase()));
  const score = (item) => {
    const keywordScore = item.keywords.filter((keyword) => lowerNews.includes(keyword)).length * 8;
    const difficultyScore = item.difficulty === difficulty ? 3 : 0;
    const freshnessPenalty = avoid.has(item.term.toLowerCase()) ? -100 : 0;
    const dateSalt = hash(`${kstDate()}:${item.term}`) % 7;
    return keywordScore + difficultyScore + dateSalt + freshnessPenalty;
  };

  const ranked = [...LESSON_TERMS].sort((a, b) => score(b) - score(a));
  const first = ranked[0] || LESSON_TERMS[0];
  const second =
    ranked.find((item) => item.term !== first.term && item.category !== first.category && !avoid.has(item.term.toLowerCase())) ||
    ranked.find((item) => item.term !== first.term);
  return [first, second].filter(Boolean).slice(0, 2);
}

function pickIssue(news, terms) {
  const items = news.items || [];
  const matched =
    items.find((item) => {
      const title = String(item.title || "").toLowerCase();
      return terms.some((term) => term.keywords.some((keyword) => title.includes(keyword)));
    }) || items[0];

  if (!matched) {
    return {
      title: "최근 경제뉴스를 확인하지 못했어요.",
      source: "OurCFO",
      note: "오늘은 시장 뉴스보다 개념 자체를 차분히 익히는 날로 볼게요."
    };
  }

  return {
    title: matched.title,
    source: matched.source || "Google News",
    note: matched.koreanSummary || matched.title
  };
}

function buildSummary(terms, issue, review) {
  const simpleLines = terms.map((item) => item.simple);
  const homeLines = terms.map((item) => item.home);
  if (review) {
    simpleLines.push(`그리고 7일 전 배운 "${review.term}"도 살짝 복습해요. 지난 개념은 오늘 뉴스와 연결될 때 더 오래 기억나요.`);
  }
  return {
    simple: simpleLines,
    issue: `최근 이슈로는 "${issue.title}" 흐름을 같이 보면 좋아요. 뉴스 제목을 맞히려 하기보다, 오늘 배운 개념이 시장의 어떤 걱정이나 기대와 연결되는지 보는 연습이에요.`,
    home: homeLines,
    takeaway: terms[0].takeaway
  };
}

function buildQuiz(term) {
  return {
    question: `"${term.term}"은 우리집 투자에서 무엇을 점검하게 해줄까요?`,
    answer: term.takeaway
  };
}

async function maybeBuildReview() {
  const lesson = await fetchLessonDaysAgo(7);
  const terms = Array.isArray(lesson?.terms) ? lesson.terms : [];
  const first = terms[0];
  if (!first?.term) return null;
  return { term: first.term, category: first.category || "" };
}

function formatLessonMessage({ selectedTerms, issue, summary, quiz, review }) {
  const lines = [];
  lines.push("📚 OurCFO 경제 과외");
  lines.push(kstDate());
  lines.push("");
  lines.push("오늘의 주제:");
  selectedTerms.forEach((item, index) => lines.push(`${index + 1}. ${item.term}`));
  lines.push("");
  lines.push(`난이도: ${selectedTerms.map((item) => item.difficulty).join(" + ")}`);
  if (review) lines.push(`복습: 7일 전 배운 "${review.term}"도 살짝 떠올려보기`);
  lines.push("");
  lines.push("🧡 쉽게 말하면");
  summary.simple.slice(0, 5).forEach((item) => lines.push(item));
  lines.push("");
  lines.push("📰 요즘 이슈와 연결하면");
  lines.push(summary.issue);
  if (issue.source) lines.push(`참고 이슈: ${issue.source}`);
  lines.push("");
  lines.push("💰 우리집 투자와 연결하면");
  summary.home.slice(0, 4).forEach((item) => lines.push(item));
  lines.push("단기매매보다 2036년 목표, 복리, 분산, 현금관리를 먼저 봐요.");
  lines.push("");
  lines.push("✅ 오늘의 한 줄 정리");
  lines.push(summary.takeaway);
  lines.push("");
  lines.push("📝 미니 복습");
  lines.push(quiz.question);
  return lines.join("\n");
}

async function handler(req, res) {
  if (!requireCronAuth(req, res)) return;

  const dryRun = req.query?.dryRun === "1" || req.query?.dryRun === "true";
  const shouldSend = req.query?.send === "0" || req.query?.send === "false" ? false : !dryRun;
  const shouldSave = req.query?.save === "0" || req.query?.save === "false" ? false : !dryRun;

  try {
    const lesson = await runEconomyLesson({ send: shouldSend, save: shouldSave });
    res.status(200).json({
      ok: true,
      sent: shouldSend,
      saved: shouldSave,
      lessonDate: lesson.lessonDate,
      terms: lesson.terms,
      difficulty: lesson.difficulty,
      message: dryRun ? lesson.message : undefined
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await logEconomyLessonError(message).catch(() => {});
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      await sendTelegramMessage(`🚨 OurCFO 경제 과외 발송 실패\n${message}`).catch(() => {});
    }
    res.status(500).json({ ok: false, error: message });
  }
}

async function saveEconomyLesson(lesson) {
  await Promise.allSettled([saveLessonToSupabase(lesson), appendLessonCsv(lesson)]);
}

async function saveLessonToSupabase(lesson) {
  if (!hasSupabase()) return false;
  const row = {
    lesson_date: lesson.lessonDate,
    terms: lesson.terms,
    difficulty: lesson.difficulty,
    summary: lesson.summary,
    quiz: lesson.quiz,
    message: lesson.message,
    news_snapshot: lesson.newsSnapshot,
    sent_at: lesson.sentAt,
    created_at: new Date().toISOString()
  };
  await supabaseUpsert("economy_lessons", [row], "lesson_date");
  return true;
}

async function fetchRecentlySentTerms(days) {
  if (!hasSupabase()) return [];
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);
  const url = new URL(`${supabaseBaseUrl()}/rest/v1/economy_lessons`);
  url.searchParams.set("select", "terms");
  url.searchParams.set("lesson_date", `gte.${since.toISOString().slice(0, 10)}`);
  url.searchParams.set("order", "lesson_date.desc");

  const response = await fetch(url, { headers: supabaseHeaders() });
  if (!response.ok) return [];
  const rows = await response.json().catch(() => []);
  return rows.flatMap((row) => (Array.isArray(row.terms) ? row.terms.map((item) => item.term).filter(Boolean) : []));
}

async function fetchLessonDaysAgo(days) {
  if (!hasSupabase()) return null;
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  const dateText = kstDate(date);
  const url = new URL(`${supabaseBaseUrl()}/rest/v1/economy_lessons`);
  url.searchParams.set("select", "terms,summary,quiz");
  url.searchParams.set("lesson_date", `eq.${dateText}`);
  url.searchParams.set("limit", "1");
  const response = await fetch(url, { headers: supabaseHeaders() });
  if (!response.ok) return null;
  const rows = await response.json().catch(() => []);
  return rows[0] || null;
}

async function logEconomyLessonError(message) {
  if (!hasSupabase()) return;
  await supabaseUpsert(
    "alerts",
    [
      {
        alert_key: `economy-lesson-error:${new Date().toISOString()}`,
        report_date: kstDate(),
        type: "error",
        severity: "error",
        title: "OurCFO 경제 과외 실패",
        message,
        payload: { message },
        triggered_at: new Date().toISOString()
      }
    ],
    "alert_key"
  );
}

async function appendLessonCsv(lesson) {
  if (process.env.VERCEL) return;
  const backupDir = process.env.OURCFO_CSV_BACKUP_DIR || path.join(__dirname, "..", "backups");
  await fs.mkdir(backupDir, { recursive: true });
  const filePath = path.join(backupDir, "economy-lessons.csv");
  const exists = await fs
    .access(filePath)
    .then(() => true)
    .catch(() => false);
  const header = "lesson_date,terms,difficulty,summary,quiz,sent_at\n";
  const row = [
    lesson.lessonDate,
    csvEscape(lesson.terms.map((item) => item.term).join("|")),
    csvEscape(lesson.difficulty),
    csvEscape(lesson.summary.takeaway),
    csvEscape(lesson.quiz.question),
    lesson.sentAt
  ].join(",");
  await fs.appendFile(filePath, `${exists ? "" : header}${row}\n`, "utf8");
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

function difficultyForDate(date) {
  const values = ["초급", "중급", "실전투자"];
  const dayIndex = Math.floor(date.getTime() / 86400000);
  return values[dayIndex % values.length];
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

function hash(value) {
  return String(value)
    .split("")
    .reduce((total, char) => (total * 31 + char.charCodeAt(0)) >>> 0, 0);
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

module.exports = { buildEconomyLesson, handler, runEconomyLesson };
