function hasSupabase() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function supabaseBaseUrl() {
  const raw = String(process.env.SUPABASE_URL || "").trim().replace(/\/$/, "");
  if (!raw) return "";

  try {
    const url = new URL(raw);
    const match = url.pathname.match(/\/dashboard\/project\/([^/]+)/);
    if (url.hostname === "supabase.com" && match?.[1]) {
      return `https://${match[1]}.supabase.co`;
    }
    return `${url.protocol}//${url.host}`;
  } catch {
    return raw;
  }
}

function supabaseHeaders() {
  return {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
  };
}

module.exports = { hasSupabase, supabaseBaseUrl, supabaseHeaders };
