#!/usr/bin/env node
/**
 * Export all data from source Supabase (Lovable Cloud) to local files.
 *
 * Usage:
 *   export SOURCE_SUPABASE_URL="https://xxx.supabase.co"
 *   export SOURCE_SERVICE_ROLE_KEY="eyJ..."
 *   node scripts/export-data.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const URL = process.env.SOURCE_SUPABASE_URL;
const KEY = process.env.SOURCE_SERVICE_ROLE_KEY;

if (!URL || !KEY) {
  console.error("Missing SOURCE_SUPABASE_URL or SOURCE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(URL, KEY, { auth: { persistSession: false } });

// Order matters: base tables first, dependents later
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

const OUT = "export";

async function exportTable(name) {
  console.log(`→ exporting table: ${name}`);
  const all = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await supabase
      .from(name)
      .select("*")
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`${name}: ${error.message}`);
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  await writeFile(join(OUT, "tables", `${name}.json`), JSON.stringify(all, null, 2));
  console.log(`  ✓ ${all.length} rows`);
}

async function exportBucket(bucket) {
  console.log(`→ exporting bucket: ${bucket}`);
  const dir = join(OUT, "storage", bucket);
  await mkdir(dir, { recursive: true });

  async function walk(prefix = "") {
    const { data: list, error } = await supabase.storage.from(bucket).list(prefix, {
      limit: 1000,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw new Error(`${bucket}/${prefix}: ${error.message}`);
    for (const item of list || []) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null) {
        // folder
        await walk(path);
      } else {
        const { data: blob, error: dlErr } = await supabase.storage.from(bucket).download(path);
        if (dlErr) {
          console.warn(`  ! skip ${path}: ${dlErr.message}`);
          continue;
        }
        const localPath = join(dir, path);
        await mkdir(join(localPath, ".."), { recursive: true });
        const buf = Buffer.from(await blob.arrayBuffer());
        await writeFile(localPath, buf);
      }
    }
  }
  await walk("");
  console.log(`  ✓ done`);
}

async function exportAuthUsers() {
  console.log(`→ exporting auth.users`);
  const all = [];
  let page = 1;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`auth.users: ${error.message}`);
    if (!data.users.length) break;
    all.push(
      ...data.users.map((u) => ({
        id: u.id,
        email: u.email,
        phone: u.phone,
        email_confirmed_at: u.email_confirmed_at,
        phone_confirmed_at: u.phone_confirmed_at,
        user_metadata: u.user_metadata,
        app_metadata: u.app_metadata,
        created_at: u.created_at,
      })),
    );
    if (data.users.length < 1000) break;
    page++;
  }
  await writeFile(join(OUT, "auth-users.json"), JSON.stringify(all, null, 2));
  console.log(`  ✓ ${all.length} users`);
}

(async () => {
  await mkdir(join(OUT, "tables"), { recursive: true });
  for (const t of TABLES) await exportTable(t);
  for (const b of BUCKETS) await exportBucket(b);
  await exportAuthUsers();
  console.log("\n✅ Export complete in ./export/");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
