const tasks = {
  "cio-briefing": async () => {
    const { runDailyBriefing } = require("../api/_cio.js");
    const report = await runDailyBriefing({ send: true, save: true });
    return {
      reportDate: report.reportDate,
      qqqZone: report.qqq.zone,
      actionCard: report.actionCard
    };
  },
  "economy-lesson": async () => {
    const { runEconomyLesson } = require("../api/_economy-lesson.js");
    const lesson = await runEconomyLesson({ send: true, save: true });
    return {
      lessonDate: lesson.lessonDate,
      terms: lesson.terms,
      difficulty: lesson.difficulty
    };
  },
  "nasdaq-drawdowns": async () => {
    const { runNasdaqDrawdownScan } = require("../api/_nasdaq-drawdowns.js");
    const report = await runNasdaqDrawdownScan({ send: true });
    return {
      reportDate: report.reportDate,
      totalScanned: report.totalScanned,
      rows: report.rows.length,
      top: report.rows.slice(0, 3).map((item) => item.symbol)
    };
  },
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
  }
};

async function main() {
  const taskName = process.argv[2];
  const task = tasks[taskName];
  if (!task) {
    throw new Error(`Unknown OurCFO task: ${taskName || "(missing)"}`);
  }

  const result = await task();
  console.log(JSON.stringify({ ok: true, task: taskName, ...result }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
