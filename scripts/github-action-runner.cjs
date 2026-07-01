const tasks = {
  "cio-briefing": async () => runScheduledOnce("cio-briefing", async () => {
    const { runDailyBriefing } = require("../api/_cio.js");
    const report = await runDailyBriefing({ send: true, save: true });
    return {
      reportDate: report.reportDate,
      qqqZone: report.qqq.zone,
      actionCard: report.actionCard
    };
  }),
  "economy-lesson": async () => runScheduledOnce("economy-lesson", async () => {
    const { runEconomyLesson } = require("../api/_economy-lesson.js");
    const lesson = await runEconomyLesson({ send: true, save: true });
    return {
      lessonDate: lesson.lessonDate,
      terms: lesson.terms,
      difficulty: lesson.difficulty
    };
  }),
  "nasdaq-drawdowns": async () => runScheduledOnce("nasdaq-drawdowns", async () => {
    const { runNasdaqDrawdownScan } = require("../api/_nasdaq-drawdowns.js");
    const report = await runNasdaqDrawdownScan({ send: true });
    return {
      reportDate: report.reportDate,
      totalScanned: report.totalScanned,
      rows: report.rows.length,
      top: report.rows.slice(0, 3).map((item) => item.symbol)
    };
  }),
  "condition-alerts": async () => {
    const { runConditionAlerts } = require("../api/_cio.js");
    const result = await runConditionAlerts({ send: true, save: true });
    return {
      reportDate: result.reportDate,
      checked: result.checked,
      sent: result.sent.length
    };
  },
  "migrate-seed-to-supabase": async () => {
    const { replaceSupabaseState } = require("../api/_state-sync.js");
    const raw = process.env.OURCFO_INITIAL_DATA_BASE64
      ? Buffer.from(process.env.OURCFO_INITIAL_DATA_BASE64, "base64").toString("utf8")
      : process.env.OURCFO_INITIAL_DATA;

    if (!raw) {
      throw new Error("OURCFO_INITIAL_DATA_BASE64 or OURCFO_INITIAL_DATA is required.");
    }

    const saved = await replaceSupabaseState(JSON.parse(raw));
    return { saved };
  },
  "ensure-reports-storage": async () => {
    const bucket = process.env.OURCFO_REPORTS_BUCKET || "ourcfo-reports";
    requiredEnv("SUPABASE_URL");
    const { supabaseBaseUrl } = require("../api/_supabase.js");
    const base = supabaseBaseUrl();
    const key = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const headers = {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json"
    };

    const read = await fetch(`${base}/storage/v1/bucket/${encodeURIComponent(bucket)}`, { headers });
    if (read.status === 404) {
      const created = await fetch(`${base}/storage/v1/bucket`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          id: bucket,
          name: bucket,
          public: false,
          allowed_mime_types: ["application/pdf"],
          file_size_limit: 20_000_000
        })
      });
      if (!created.ok && created.status !== 409) {
        throw new Error(`Supabase bucket create failed: ${created.status} ${await created.text()}`.trim());
      }
      return { bucket, visibility: "private", action: "created" };
    }

    if (!read.ok) {
      throw new Error(`Supabase bucket read failed: ${read.status} ${await read.text()}`.trim());
    }

    const current = await read.json();
    if (current.public === true) {
      const updated = await fetch(`${base}/storage/v1/bucket/${encodeURIComponent(bucket)}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          public: false,
          allowed_mime_types: ["application/pdf"],
          file_size_limit: 20_000_000
        })
      });
      if (!updated.ok) {
        throw new Error(`Supabase bucket update failed: ${updated.status} ${await updated.text()}`.trim());
      }
      return { bucket, visibility: "private", action: "updated" };
    }

    return { bucket, visibility: "private", action: "already-ready" };
  },
  "morning-notifications": async () => {
    const now = kstNowParts();
    const dueTasks = morningDueTasks(now);
    const results = [];

    for (const taskName of dueTasks) {
      results.push({ taskName, result: await tasks[taskName]() });
    }

    return {
      kstTime: now.label,
      dueTasks,
      sentOrSkipped: results
    };
  }
};

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

async function runScheduledOnce(taskName, fn) {
  if (process.env.GITHUB_EVENT_NAME !== "schedule") return fn();

  const now = kstNowParts();
  const markerKey = `scheduled:${taskName}:${now.date}`;
  const { alertExists, saveAlert } = require("../api/_cio-storage.js");

  if (await alertExists(markerKey)) {
    return { skipped: true, reason: "Already sent today", markerKey, kstTime: now.label };
  }

  const result = await fn();
  await saveAlert({
    alert_key: markerKey,
    report_date: now.date,
    type: "schedule-marker",
    severity: "info",
    title: `OurCFO ${taskName} sent`,
    message: `${taskName} sent at ${now.label}`,
    payload: { taskName, result },
    triggered_at: new Date().toISOString(),
    sent_at: new Date().toISOString()
  }).catch(() => {});

  return result;
}

async function main() {
  const taskName = process.argv[2];
  const task = tasks[taskName];
  if (!task) {
    throw new Error(`Unknown OurCFO task: ${taskName || "(missing)"}`);
  }

  const scheduleGuard = scheduledTaskGuard(taskName);
  if (scheduleGuard.skipped) {
    console.log(JSON.stringify({ ok: true, task: taskName, ...scheduleGuard }, null, 2));
    return;
  }

  const result = await task();
  console.log(JSON.stringify({ ok: true, task: taskName, ...result }, null, 2));
}

function scheduledTaskGuard(taskName) {
  if (process.env.GITHUB_EVENT_NAME !== "schedule") return { skipped: false };

  const windows = {
    "cio-briefing": { start: 8 * 60, end: 8 * 60 + 29, label: "08:00-08:29 KST" },
    "nasdaq-drawdowns": { start: 8 * 60 + 30, end: 8 * 60 + 59, label: "08:30-08:59 KST" },
    "economy-lesson": { start: 9 * 60, end: 9 * 60 + 59, label: "09:00-09:59 KST" }
  };

  const window = windows[taskName];
  if (!window) return { skipped: false };

  const now = kstNowParts();
  const minuteOfDay = now.hour * 60 + now.minute;
  const skipped = minuteOfDay < window.start || minuteOfDay > window.end;
  return {
    skipped,
    reason: skipped ? `Outside scheduled KST window ${window.label}` : undefined,
    kstTime: now.label,
    allowedWindow: window.label
  };
}

function morningDueTasks(now = kstNowParts()) {
  const minuteOfDay = now.hour * 60 + now.minute;
  const due = [];
  if (minuteOfDay >= 8 * 60 && minuteOfDay <= 8 * 60 + 29) due.push("cio-briefing");
  if (minuteOfDay >= 8 * 60 + 30 && minuteOfDay <= 8 * 60 + 59) due.push("nasdaq-drawdowns");
  if (minuteOfDay >= 9 * 60 && minuteOfDay <= 9 * 60 + 59) due.push("economy-lesson");
  return due;
}

function kstNowParts() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    })
      .formatToParts(new Date())
      .map((part) => [part.type, part.value])
  );

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    label: `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`
  };
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
