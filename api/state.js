const { loadState } = require("./_data.js");
const { hasSupabaseWrite, replaceSupabaseState } = require("./_state-sync.js");

require("./_env.js").loadLocalEnv();

module.exports = async (req, res) => {
  setJson(res);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    if (req.method === "GET") {
      const state = await loadState();
      res.end(JSON.stringify({
        source: hasSupabaseWrite() ? "supabase" : "seed",
        state,
        counts: counts(state),
        asOf: new Date().toISOString()
      }));
      return;
    }

    if (req.method !== "PUT" && req.method !== "POST") {
      res.statusCode = 405;
      res.end(JSON.stringify({ error: "Method not allowed" }));
      return;
    }

    if (!requireWriteAuth(req, res)) return;
    if (!hasSupabaseWrite()) {
      res.statusCode = 409;
      res.end(JSON.stringify({ error: "Supabase is not configured." }));
      return;
    }

    const body = await readJsonBody(req);
    const state = body.state || body;
    const saved = await replaceSupabaseState(state);
    res.end(JSON.stringify({ ok: true, saved, asOf: new Date().toISOString() }));
  } catch (error) {
    res.statusCode = 500;
    res.end(JSON.stringify({
      error: "OurCFO state sync failed",
      message: error instanceof Error ? error.message : "Unknown error"
    }));
  }
};

function requireWriteAuth(req, res) {
  const expected = process.env.OURCFO_API_WRITE_TOKEN || process.env.OURCFO_APP_PIN || "1056";
  const auth = req.headers.authorization || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const provided = req.headers["x-ourcfo-write-token"] || req.headers["x-ourcfo-pin"] || bearer;
  if (provided === expected) return true;

  res.statusCode = 401;
  res.end(JSON.stringify({ error: "Unauthorized" }));
  return false;
}

async function readJsonBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 2_000_000) throw new Error("Request body is too large.");
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function setJson(res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
}

function counts(state) {
  return {
    assets: (state.assetItems || []).length,
    stockHoldings: (state.stockHoldings || []).length,
    ledgerEntries: (state.ledgerEntries || []).length,
    stockTransactions: (state.stockTransactions || []).length
  };
}
