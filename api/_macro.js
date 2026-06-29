const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36";

const FRED_SERIES = [
  { key: "fedFunds", id: "FEDFUNDS", label: "미국 기준금리", unit: "%" },
  { key: "cpi", id: "CPIAUCSL", label: "CPI", unit: "index", yoy: true },
  { key: "coreCpi", id: "CPILFESL", label: "Core CPI", unit: "index", yoy: true },
  { key: "pce", id: "PCEPI", label: "PCE", unit: "index", yoy: true },
  { key: "unemployment", id: "UNRATE", label: "실업률", unit: "%" },
  { key: "gdp", id: "GDP", label: "GDP", unit: "USD billions" },
  { key: "ismManufacturing", id: "NAPM", label: "ISM 제조업지수", unit: "index" }
];

async function collectMacroData() {
  const [series, fomc] = await Promise.all([
    Promise.all(FRED_SERIES.map(fetchFredSeries)),
    fetchFomcCalendar()
  ]);

  const byKey = {};
  for (const item of series) byKey[item.key] = item;

  return {
    asOf: new Date().toISOString(),
    source: "FRED, Federal Reserve",
    items: series,
    byKey,
    fomc,
    upcoming: buildUpcoming(fomc)
  };
}

async function fetchFredSeries(config) {
  try {
    const url = new URL("https://fred.stlouisfed.org/graph/fredgraph.csv");
    url.searchParams.set("id", config.id);
    const response = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "text/csv" } });
    if (!response.ok) throw new Error(`FRED ${config.id} failed: ${response.status}`);

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
    const prior = rows.at(-2);
    const yearAgo = rows.at(-13) || rows.at(-12);
    const yoyPct = config.yoy && latest && yearAgo?.value ? ((latest.value - yearAgo.value) / yearAgo.value) * 100 : null;

    return {
      key: config.key,
      seriesId: config.id,
      label: config.label,
      value: latest?.value ?? null,
      previousValue: prior?.value ?? null,
      change: latest && prior ? latest.value - prior.value : null,
      yoyPct,
      unit: config.unit,
      date: latest?.date || null,
      source: "FRED"
    };
  } catch (error) {
    return {
      key: config.key,
      seriesId: config.id,
      label: config.label,
      unit: config.unit,
      error: error instanceof Error ? error.message : "unknown macro error"
    };
  }
}

async function fetchFomcCalendar() {
  try {
    const response = await fetch("https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm", {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" }
    });
    if (!response.ok) throw new Error(`FOMC calendar failed: ${response.status}`);

    const html = await response.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const currentYear = new Date().getUTCFullYear();
    const datePattern =
      /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:-(\d{1,2}))?,\s+(20\d{2})/g;
    const meetings = [];
    let match;
    while ((match = datePattern.exec(text))) {
      const [, monthName, day, endDay, year] = match;
      if (Number(year) < currentYear - 1 || Number(year) > currentYear + 1) continue;
      const date = toIsoDate(monthName, endDay || day, year);
      meetings.push({ date, label: `${monthName} ${day}${endDay ? `-${endDay}` : ""}, ${year}` });
    }

    const uniqueMeetings = [...new Map(meetings.map((item) => [item.date, item])).values()].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
    const today = new Date().toISOString().slice(0, 10);
    const next = uniqueMeetings.find((item) => item.date >= today) || null;
    const recent = [...uniqueMeetings].reverse().find((item) => item.date < today) || null;

    return {
      recentResult: recent ? `${recent.label} FOMC 완료. 공식 성명 확인 필요.` : "최근 FOMC 결과 확인 필요",
      nextMeeting: next,
      meetings: uniqueMeetings.slice(0, 12),
      source: "Federal Reserve"
    };
  } catch (error) {
    return {
      recentResult: "최근 FOMC 결과 확인 필요",
      nextMeeting: null,
      meetings: [],
      error: error instanceof Error ? error.message : "unknown FOMC error"
    };
  }
}

function buildUpcoming(fomc) {
  const upcoming = [];
  if (fomc?.nextMeeting?.date) {
    upcoming.push({ date: fomc.nextMeeting.date, title: "FOMC" });
  }
  upcoming.push({ date: null, title: "CPI/PCE/고용지표 발표일은 BLS/BEA 캘린더 확인 필요" });
  return upcoming;
}

function toIsoDate(monthName, day, year) {
  const month = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ].indexOf(monthName);
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

module.exports = { collectMacroData };
