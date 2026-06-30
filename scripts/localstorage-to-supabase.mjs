import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { replaceSupabaseState } = require("../api/_state-sync.js");
require("../api/_env.js").loadLocalEnv();

const [filePath] = process.argv.slice(2);
if (!filePath) {
  console.error("Usage: node scripts/localstorage-to-supabase.mjs <ourcfo-export.json>");
  process.exit(1);
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  process.exit(1);
}

const state = JSON.parse(await readFile(filePath, "utf8"));
const saved = await replaceSupabaseState(state);
console.log(`OurCFO migration complete: ${JSON.stringify(saved)}`);
