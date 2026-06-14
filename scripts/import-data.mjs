#!/usr/bin/env node
/**
 * Import data from ./export/ into target Supabase (self-hosted).
 *
 * Usage on server:
 *   export TARGET_SUPABASE_URL="http://localhost:8000"
 *   export TARGET_SERVICE_ROLE_KEY="eyJ..."
 *   node scripts/import-data.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { randomBytes } from "node:crypto";

const URL = process.env.TARGET_SUPABASE_URL;
const KEY = process.env.TARGET_SERVICE_ROLE_KEY;

if (!URL || !KEY) {
  console.error("Missing TARGET_SUPABASE_URL or TARGET_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(URL, KEY, { auth: { persistSession: false } });

const TABLES = [
  "categories",
  "car_makes",
  "car_models",
  "products",
  "product_compatibility",
  "profiles",
  "user_roles",
  "addresses",
  "cart_items",
  "orders",
  "order_items",
];

const BUCKETS = ["product-images"];

const SRC = "export";

async function importUsers() {
  console.log(`→ importing auth users`);
  const users = JSON.parse(await readFile(join(SRC, "auth-users.json"), "utf8"));
  let ok = 0;
  for (const u of users) {
    const { error } = await supabase.auth.admin.createUser({
      id: u.id, // keep same id so FKs work
      email: u.email ?? undefined,
      phone: u.phone ?? undefined,
      email_confirm: !!u.email_confirmed_at,
      phone_confirm: !!u.phone_confirmed_at,
      user_metadata: u.user_metadata ?? {},
      app_metadata: u.app_metadata ?? {},
      password: randomBytes(24).toString("hex"), // user must reset
    });
    if (error && !/already.*exist|duplicate/i.test(error.message)) {
      console.warn(`  ! ${u.email}: ${error.message}`);
    } else {
      ok++;
    }
  }
  console.log(`  ✓ ${ok}/${users.length} users created`);
}

async function importTable(name) {
  console.log(`→ importing table: ${name}`);
  let rows;
  try {
    rows = JSON.parse(await readFile(join(SRC, "tables", `${name}.json`), "utf8"));
  } catch {
    console.log(`  ! skip (no file)`);
    return;
  }
  if (!rows.length) {
    console.log(`  ✓ 0 rows`);
    return;
  }
  const CHUNK = 500;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const batch = rows.slice(i, i + CHUNK);
    const { error } = await supabase.from(name).upsert(batch, { onConflict: "id" });
    if (error) throw new Error(`${name}: ${error.message}`);
  }
  console.log(`  ✓ ${rows.length} rows`);
}

async function importBucket(bucket) {
  console.log(`→ importing bucket: ${bucket}`);
  // ensure bucket exists
  const { data: list } = await supabase.storage.listBuckets();
  if (!list?.some((b) => b.name === bucket)) {
    await supabase.storage.createBucket(bucket, { public: false });
  }

  const root = join(SRC, "storage", bucket);

  async function walk(dir, prefix = "") {
    let entries;
    try {
      entries = await readdir(dir);
    } catch {
      return;
    }
    for (const e of entries) {
      const full = join(dir, e);
      const s = await stat(full);
      const key = prefix ? `${prefix}/${e}` : e;
      if (s.isDirectory()) {
        await walk(full, key);
      } else {
        const buf = await readFile(full);
        const { error } = await supabase.storage.from(bucket).upload(key, buf, { upsert: true });
        if (error) console.warn(`  ! ${key}: ${error.message}`);
      }
    }
  }

  await walk(root);
  console.log(`  ✓ done`);
}

(async () => {
  await importUsers();
  for (const t of TABLES) await importTable(t);
  for (const b of BUCKETS) await importBucket(b);
  console.log("\n✅ Import complete");
  console.log("→ Next: run scripts/send-password-reset.mjs to email users");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
