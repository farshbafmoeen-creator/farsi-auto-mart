#!/usr/bin/env node
/**
 * Send password reset email to all migrated users.
 *
 * Usage on server:
 *   export TARGET_SUPABASE_URL="http://localhost:8000"
 *   export TARGET_SERVICE_ROLE_KEY="eyJ..."
 *   export SITE_URL="https://yourdomain.ir"
 *   node scripts/send-password-reset.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";

const URL = process.env.TARGET_SUPABASE_URL;
const KEY = process.env.TARGET_SERVICE_ROLE_KEY;
const SITE = process.env.SITE_URL || "http://localhost:3000";

if (!URL || !KEY) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(URL, KEY, { auth: { persistSession: false } });
const users = JSON.parse(await readFile("export/auth-users.json", "utf8"));

let ok = 0;
for (const u of users) {
  if (!u.email) continue;
  const { error } = await supabase.auth.resetPasswordForEmail(u.email, {
    redirectTo: `${SITE}/auth/reset-password`,
  });
  if (error) console.warn(`! ${u.email}: ${error.message}`);
  else ok++;
  await new Promise((r) => setTimeout(r, 200)); // throttle
}
console.log(`✅ Sent reset emails to ${ok} users`);
