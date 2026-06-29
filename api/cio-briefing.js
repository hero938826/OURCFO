const { requireCronAuth, runDailyBriefing } = require("./_cio.js");
const { saveErrorLog } = require("./_cio-storage.js");
const { sendTelegramMessage } = require("./_telegram.js");

module.exports = async function handler(req, res) {
  if (!requireCronAuth(req, res)) return;

  const dryRun = req.query?.dryRun === "1" || req.query?.dryRun === "true";
  const shouldSend = req.query?.send === "0" || req.query?.send === "false" ? false : !dryRun;
  const shouldSave = req.query?.save === "0" || req.query?.save === "false" ? false : !dryRun;

  try {
    const report = await runDailyBriefing({ send: shouldSend, save: shouldSave });
    res.status(200).json({
      ok: true,
      sent: shouldSend,
      saved: shouldSave,
      reportDate: report.reportDate,
      qqqZone: report.qqq.zone,
      actionCard: report.actionCard,
      message: dryRun ? report.message : undefined
    });
  } catch (error) {
    await saveErrorLog("cio-briefing", error);
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      await sendTelegramMessage(`🚨 OurCFO CIO Report 실패\n${error instanceof Error ? error.message : "Unknown error"}`).catch(
        () => {}
      );
    }
    res.status(500).json({ ok: false, error: error instanceof Error ? error.message : "Unknown error" });
  }
};
