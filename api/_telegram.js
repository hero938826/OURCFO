require("./_env.js").loadLocalEnv();

const TELEGRAM_API = "https://api.telegram.org";

async function sendTelegramMessage(text, options = {}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    throw new Error("TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are required");
  }

  const chunks = splitTelegramText(String(text || ""));
  const responses = [];

  for (const chunk of chunks) {
    const response = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: chunk,
        disable_web_page_preview: true,
        ...options
      })
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.ok === false) {
      throw new Error(`Telegram send failed: ${response.status} ${payload.description || ""}`.trim());
    }
    responses.push(payload);
  }

  return responses;
}

function splitTelegramText(text) {
  const max = 3900;
  if (text.length <= max) return [text];

  const chunks = [];
  let remaining = text;
  while (remaining.length > max) {
    const cut = Math.max(remaining.lastIndexOf("\n", max), remaining.lastIndexOf(" ", max), max);
    chunks.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

module.exports = { sendTelegramMessage };
