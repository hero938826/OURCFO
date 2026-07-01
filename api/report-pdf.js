require("./_env.js").loadLocalEnv();
const { supabaseBaseUrl, supabaseHeaders } = require("./_supabase.js");

const DEFAULT_BUCKET = "ourcfo-reports";

module.exports = async (req, res) => {
  setJson(res);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method === "GET") {
    if (!requireWriteAuth(req, res)) return;
    try {
      if (!hasSupabaseStorage()) {
        res.statusCode = 409;
        res.end(JSON.stringify({ error: "Supabase Storage is not configured." }));
        return;
      }
      const bucket = process.env.OURCFO_REPORTS_BUCKET || DEFAULT_BUCKET;
      const fileName = safeReportFileName(req.query?.fileName || new URL(req.url, "http://localhost").searchParams.get("fileName"), req.query?.year, req.query?.month);
      await ensureBucket(bucket);
      const signedUrl = await createSignedUrl(bucket, fileName);
      res.end(JSON.stringify({ ok: true, signedUrl, fileName }));
    } catch (error) {
      res.statusCode = isMissingObjectError(error) ? 404 : 500;
      res.end(JSON.stringify({
        error: "OurCFO report PDF signed URL failed",
        message: error instanceof Error ? error.message : "Unknown error"
      }));
    }
    return;
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  if (!requireWriteAuth(req, res)) return;

  try {
    if (!hasSupabaseStorage()) {
      res.statusCode = 409;
      res.end(JSON.stringify({ error: "Supabase Storage is not configured." }));
      return;
    }

    const body = await readJsonBody(req);
    const fileName = safeReportFileName(body.fileName, body.year, body.month);
    const buffer = dataUrlToBuffer(body.dataUrl);
    const bucket = process.env.OURCFO_REPORTS_BUCKET || DEFAULT_BUCKET;
    await ensureBucket(bucket);
    const pdfUrl = await uploadPdf({ bucket, fileName, buffer, contentType: body.contentType || "application/pdf" });
    const reportUpdated = await updateReportPdfUrl(body.reportId, pdfUrl);
    if (!reportUpdated) await updateReportPdfUrlInMeta(body.reportId, pdfUrl);

    res.end(JSON.stringify({ ok: true, pdfUrl, fileName }));
  } catch (error) {
    res.statusCode = 500;
    res.end(JSON.stringify({
      error: "OurCFO report PDF upload failed",
      message: error instanceof Error ? error.message : "Unknown error"
    }));
  }
};

function hasSupabaseStorage() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

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
    if (size > 20_000_000) throw new Error("Request body is too large.");
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function safeReportFileName(fileName, year, month) {
  const fallback = `ourcfo-cfo-report-${year}-${String(month).padStart(2, "0")}.pdf`;
  const candidate = String(fileName || fallback).trim();
  if (!/^ourcfo-cfo-report-\d{4}-\d{2}\.pdf$/.test(candidate)) return fallback;
  return candidate;
}

function dataUrlToBuffer(dataUrl) {
  const raw = String(dataUrl || "");
  const match = raw.match(/^data:application\/pdf;base64,(.+)$/);
  if (!match) throw new Error("A PDF data URL is required.");
  return Buffer.from(match[1], "base64");
}

async function uploadPdf({ bucket, fileName, buffer, contentType }) {
  const base = supabaseBaseUrl();
  const encodedPath = encodeURIComponent(fileName);
  const response = await fetch(`${base}/storage/v1/object/${bucket}/${encodedPath}`, {
    method: "POST",
    headers: {
      ...supabaseHeaders(),
      "content-type": contentType,
      "x-upsert": "true"
    },
    body: buffer
  });

  if (!response.ok) {
    throw new Error(`Supabase Storage upload failed: ${response.status} ${await response.text()}`.trim());
  }

  return `storage://${bucket}/${fileName}`;
}

async function ensureBucket(bucket) {
  const existing = await getBucket(bucket);
  if (!existing) {
    await createBucket(bucket);
    return;
  }
  if (existing.public === true) await updateBucket(bucket);
}

async function getBucket(bucket) {
  const response = await fetch(`${supabaseBaseUrl()}/storage/v1/bucket/${encodeURIComponent(bucket)}`, {
    headers: supabaseHeaders()
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Supabase bucket read failed: ${response.status} ${await response.text()}`.trim());
  }
  return response.json();
}

async function createBucket(bucket) {
  const response = await fetch(`${supabaseBaseUrl()}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      ...supabaseHeaders(),
      "content-type": "application/json"
    },
    body: JSON.stringify({
      id: bucket,
      name: bucket,
      public: false,
      allowed_mime_types: ["application/pdf"],
      file_size_limit: 20_000_000
    })
  });

  if (!response.ok && response.status !== 409) {
    throw new Error(`Supabase bucket create failed: ${response.status} ${await response.text()}`.trim());
  }
}

async function updateBucket(bucket) {
  const response = await fetch(`${supabaseBaseUrl()}/storage/v1/bucket/${encodeURIComponent(bucket)}`, {
    method: "PUT",
    headers: {
      ...supabaseHeaders(),
      "content-type": "application/json"
    },
    body: JSON.stringify({
      public: false,
      allowed_mime_types: ["application/pdf"],
      file_size_limit: 20_000_000
    })
  });

  if (!response.ok) {
    throw new Error(`Supabase bucket update failed: ${response.status} ${await response.text()}`.trim());
  }
}

async function createSignedUrl(bucket, fileName) {
  const response = await fetch(`${supabaseBaseUrl()}/storage/v1/object/sign/${encodeURIComponent(bucket)}/${encodeURIComponent(fileName)}`, {
    method: "POST",
    headers: {
      ...supabaseHeaders(),
      "content-type": "application/json"
    },
    body: JSON.stringify({ expiresIn: 600 })
  });

  if (!response.ok) {
    throw new Error(`Supabase signed URL failed: ${response.status} ${await response.text()}`.trim());
  }

  const payload = await response.json();
  const signedPath = payload.signedURL || payload.signedUrl || "";
  if (!signedPath) throw new Error("Supabase signed URL response was empty.");
  return signedPath.startsWith("http") ? signedPath : `${supabaseBaseUrl()}${signedPath}`;
}

async function updateReportPdfUrl(reportId, pdfUrl) {
  if (!reportId) return false;
  const url = new URL(`${supabaseBaseUrl()}/rest/v1/ourcfo_reports`);
  url.searchParams.set("id", `eq.${reportId}`);
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      ...supabaseHeaders(),
      "content-type": "application/json",
      prefer: "return=minimal"
    },
    body: JSON.stringify({ pdf_url: pdfUrl, updated_at: new Date().toISOString() })
  });

  if (!response.ok) {
    const text = await response.text();
    if (isMissingTableResponse(response.status, text)) return false;
    throw new Error(`Supabase report update failed: ${response.status} ${text}`.trim());
  }
  return true;
}

async function updateReportPdfUrlInMeta(reportId, pdfUrl) {
  if (!reportId) return false;
  const readUrl = new URL(`${supabaseBaseUrl()}/rest/v1/ourcfo_state_meta`);
  readUrl.searchParams.set("select", "payload");
  readUrl.searchParams.set("state_key", "eq.default");
  readUrl.searchParams.set("limit", "1");
  const readResponse = await fetch(readUrl, { headers: supabaseHeaders() });
  if (!readResponse.ok) {
    const text = await readResponse.text();
    if (isMissingTableResponse(readResponse.status, text)) return false;
    throw new Error(`Supabase meta read failed: ${readResponse.status} ${text}`.trim());
  }

  const [row] = await readResponse.json();
  const payload = row?.payload || {};
  const reports = Array.isArray(payload.reports) ? payload.reports : [];
  const nextReports = reports.map((report) =>
    report?.id === reportId ? { ...report, pdfUrl, updatedAt: new Date().toISOString() } : report
  );
  if (!nextReports.some((report) => report?.id === reportId)) return false;

  const writeUrl = new URL(`${supabaseBaseUrl()}/rest/v1/ourcfo_state_meta`);
  writeUrl.searchParams.set("state_key", "eq.default");
  const writeResponse = await fetch(writeUrl, {
    method: "PATCH",
    headers: {
      ...supabaseHeaders(),
      "content-type": "application/json",
      prefer: "return=minimal"
    },
    body: JSON.stringify({
      payload: { ...payload, reports: nextReports },
      updated_at: new Date().toISOString()
    })
  });

  if (!writeResponse.ok) {
    const text = await writeResponse.text();
    if (isMissingTableResponse(writeResponse.status, text)) return false;
    throw new Error(`Supabase meta update failed: ${writeResponse.status} ${text}`.trim());
  }
  return true;
}

function isMissingTableResponse(status, text) {
  return status === 404 || /PGRST205|does not exist|not found|schema cache/i.test(String(text));
}

function isMissingObjectError(error) {
  const message = error instanceof Error ? error.message : String(error);
  return /404|not found|object not found|NoSuchKey/i.test(message);
}

function setJson(res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
}
