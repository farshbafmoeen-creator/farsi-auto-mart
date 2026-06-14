# پلن استقرار روی VPS ایرانی با Supabase سلف‌هاست

گزینه B تایید شد. در این مرحله **هیچ تغییری در منطق برنامه ایجاد نمی‌شود** — فقط فایل‌های راهنما، اسکریپت‌های مهاجرت و فایل‌های پیکربندی سرور ساخته می‌شوند تا وقتی VPS را گرفتی، فقط طبق راهنما پیش بروی.

## معماری نهایی روی سرور

```text
[Internet]
   │
   ▼
[Nginx + SSL]  ── reverse proxy
   │
   ├── /  ───────────►  Node.js (TanStack Start build) :3000   (PM2)
   │
   └── /supabase/* ─►  Supabase Docker stack
                        ├── Kong (API gateway)  :8000
                        ├── PostgREST
                        ├── GoTrue (Auth)
                        ├── Storage API + MinIO/Local
                        ├── Realtime
                        └── PostgreSQL :5432
```

## پیشنهاد سرور (ایران)

- **ابرآروان / پارس‌پک / آسیاتک / های‌وب**: VPS با حداقل ۴ هسته، ۸ گیگ رم، ۸۰ گیگ SSD، اوبونتو ۲۲.۰۴
- IP استاتیک + امکان نصب SSL (ZeroSSL داخلی یا Let's Encrypt در صورت دسترسی)
- یک دامنه `.ir` یا `.com` که DNS آن قابل تنظیم باشد

## فایل‌هایی که در این مرحله ساخته می‌شود

### راهنماها (فارسی)
1. `DEPLOYMENT.md` — راهنمای گام‌به‌گام کامل از صفر تا انتشار
2. `MIGRATION.md` — راهنمای انتقال دیتای فعلی (دیتابیس + استوریج + کاربران) به سرور جدید

### اسکریپت‌های مهاجرت داده
3. `scripts/export-data.mjs` — اکسپورت کامل از Lovable Cloud با Service Role Key:
   - همه جداول `public` به‌صورت JSON
   - فایل‌های باکت `product-images` به‌صورت ZIP
   - لیست کاربران `auth.users` (متادیتا، نه پسورد)
4. `scripts/import-data.mjs` — ایمپورت در Supabase سلف‌هاست
5. `scripts/migrate-users.sql` — قالب SQL برای ایجاد مجدد کاربران (با ارسال ایمیل ریست پسورد)

### پیکربندی Supabase سلف‌هاست
6. `selfhost/docker-compose.yml` — استک کامل Supabase (Postgres + Auth + PostgREST + Storage + Realtime + Kong)
7. `selfhost/.env.example` — تمام متغیرها (JWT secret، پسورد دیتابیس، کلیدهای anon/service)
8. `selfhost/volumes/db/init/` — اسکریپت‌های اولیه دیتابیس
9. `selfhost/kong.yml` — تنظیمات gateway

### اپلیکیشن TanStack
10. `.env.production.example` — متغیرهای محیطی production:
    ```
    VITE_SUPABASE_URL=https://yourdomain.ir/supabase
    VITE_SUPABASE_PUBLISHABLE_KEY=...
    SUPABASE_URL=...
    SUPABASE_PUBLISHABLE_KEY=...
    SUPABASE_SERVICE_ROLE_KEY=...
    SMTP_HOST=...
    SMTP_PORT=587
    SMTP_USER=...
    SMTP_PASS=...
    SMTP_FROM=...
    ADMIN_NOTIFY_EMAIL=...
    SITE_URL=https://yourdomain.ir
    ```
11. `ecosystem.config.cjs` — تنظیمات PM2 برای اجرای دائمی Node
12. `nginx/site.conf.example` — کانفیگ Nginx با SSL، gzip، caching و reverse proxy به `/supabase/*`

### مهاجرت Migrationها
13. `scripts/apply-migrations.sh` — اعمال خودکار تمام فایل‌های `supabase/migrations/*.sql` روی دیتابیس جدید

## مراحل اجرایی برای تو (بعد از تهیه VPS)

1. **اوبونتو آماده کن** → نصب Docker، Node 20، PM2، Nginx
2. **استک Supabase را بالا بیار** → `cd selfhost && docker compose up -d`
3. **Migrationها را اعمال کن** → `./scripts/apply-migrations.sh`
4. **داده‌ها را اکسپورت/ایمپورت کن** → دو اسکریپت `export-data.mjs` و `import-data.mjs`
5. **پروژه را build کن** → `bun install && bun run build`
6. **با PM2 اجرا کن** → `pm2 start ecosystem.config.cjs`
7. **Nginx + SSL** → کانفیگ سایت + گرفتن SSL
8. **DNS** → دامنه را به IP سرور وصل کن
9. **SMTP** → مقادیر را در `.env.production` پر کن (سیستم ایمیل قبلاً آماده است)

## نکات مهم

- **کاربران موجود**: پسوردها از Supabase قابل خروجی نیستند. در سرور جدید کاربران دوباره ساخته می‌شوند و باید لینک «بازنشانی رمز» برایشان ارسال شود (در راهنما توضیح داده می‌شود).
- **استوریج**: استک سلف‌هاست از MinIO استفاده می‌کند تا کاملاً مستقل از سرویس‌های خارجی باشد.
- **بکاپ**: در `DEPLOYMENT.md` اسکریپت بکاپ روزانه Postgres + MinIO اضافه می‌شود.
- **بدون تغییر کد برنامه**: تنها چیزی که فرق می‌کند، مقادیر `.env` است. منطق برنامه دست نمی‌خورد.

با تایید این پلن، تمام فایل‌های بالا را در پروژه می‌سازم تا برای روزی که VPS را گرفتی آماده باشد.
