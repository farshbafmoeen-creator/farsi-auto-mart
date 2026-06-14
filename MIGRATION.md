# راهنمای انتقال داده‌ها از Lovable Cloud به سرور جدید

## پیش‌نیازها

- روی کامپیوتر شخصی Node.js 20+ نصب باشد
- دسترسی به `SUPABASE_SERVICE_ROLE_KEY` پروژه Lovable (از Lovable → Project Settings → Cloud)
- استک Supabase سلف‌هاست روی سرور بالا و migrationها اعمال شده باشد

---

## مرحله ۱: اکسپورت از Lovable Cloud

روی کامپیوتر شخصی:

```bash
cd path/to/project

# نصب وابستگی‌ها
npm install @supabase/supabase-js

# متغیرها
export SOURCE_SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
export SOURCE_SERVICE_ROLE_KEY="eyJ..."   # از Lovable بگیر

# اجرا
node scripts/export-data.mjs
```

خروجی در پوشه `export/` ساخته می‌شود:
- `export/tables/*.json` — یک فایل برای هر جدول
- `export/storage/product-images/` — تمام تصاویر باکت
- `export/auth-users.json` — لیست کاربران (بدون پسورد)

---

## مرحله ۲: انتقال به سرور

```bash
scp -r export/ root@YOUR_SERVER:/opt/myshop/app/
```

---

## مرحله ۳: ایمپورت روی سرور

```bash
ssh root@YOUR_SERVER
cd /opt/myshop/app

# متغیرها (از selfhost/.env)
export TARGET_SUPABASE_URL="http://localhost:8000"
export TARGET_SERVICE_ROLE_KEY="eyJ..."   # SERVICE_ROLE_KEY از selfhost/.env

# اجرا
node scripts/import-data.mjs
```

این اسکریپت:
1. تمام جداول `public` را پر می‌کند (به‌ترتیب وابستگی)
2. کاربران را در `auth.users` ایجاد می‌کند (با پسورد تصادفی)
3. تصاویر را به باکت `product-images` آپلود می‌کند

---

## مرحله ۴: ارسال ایمیل بازنشانی رمز به کاربران

از آنجا که پسوردها در Supabase به‌صورت hash ذخیره می‌شوند و قابل اکسپورت نیستند، باید به کاربران ایمیل «بازنشانی رمز» ارسال شود:

```bash
node scripts/send-password-reset.mjs
```

این اسکریپت برای همه کاربران لینک reset ارسال می‌کند. بهتر است یک ایمیل توضیحی هم بفرستی که «سایت به سرور جدید منتقل شد، لطفاً رمز را بازنشانی کنید».

---

## بررسی پس از مهاجرت

```sql
-- روی سرور، با psql در داخل کانتینر db:
docker exec -it supabase-db psql -U postgres -d postgres

SELECT count(*) FROM products;
SELECT count(*) FROM orders;
SELECT count(*) FROM auth.users;
```

تعداد ردیف‌ها باید با Lovable Cloud یکسان باشد.

---

## نکات

- اگر جدولی جدید اضافه کردی، آن را در آرایه `TABLES` در دو اسکریپت ایمپورت/اکسپورت اضافه کن
- اگر باکت جدیدی اضافه کردی، آن را در آرایه `BUCKETS` اضافه کن
- ترتیب جداول مهم است: ابتدا جداول پایه (مثل `categories`, `car_makes`) و سپس جداولی که FK دارند
