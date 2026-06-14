# راهنمای استقرار روی VPS ایرانی

این راهنما برای انتقال کامل سایت (فرانت + بک + دیتابیس + استوریج) به یک سرور ایرانی مستقل از سرویس‌های خارجی است.

---

## ۱. تهیه سرور

**مشخصات پیشنهادی:**
- VPS با حداقل **۴ هسته CPU، ۸ گیگ RAM، ۸۰ گیگ SSD**
- سیستم‌عامل: **Ubuntu 22.04 LTS**
- IP استاتیک
- ارائه‌دهندگان داخلی: ابرآروان، پارس‌پک، آسیاتک، های‌وب، فالنیک

**یک دامنه** تهیه کن (`.ir` یا `.com`) و رکورد A آن را به IP سرور وصل کن.

---

## ۲. آماده‌سازی سرور

```bash
# اتصال SSH
ssh root@YOUR_SERVER_IP

# آپدیت
apt update && apt upgrade -y

# نصب ابزارهای پایه
apt install -y curl git unzip nginx ufw

# فایروال
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable

# Docker
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker

# Node.js 20 + Bun
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2 bun
```

---

## ۳. راه‌اندازی Supabase سلف‌هاست

```bash
mkdir -p /opt/myshop && cd /opt/myshop

# پروژه را به سرور منتقل کن (ZIP از Lovable دانلود کن و آپلود کن)
# مثلاً با scp:
#   scp project.zip root@SERVER:/opt/myshop/
unzip project.zip -d app
cd app

# استک Supabase
cd selfhost
cp .env.example .env

# مقادیر زیر را ویرایش کن:
#   POSTGRES_PASSWORD     ← یک پسورد قوی
#   JWT_SECRET            ← رشته تصادفی ۴۰+ کاراکتر
#   ANON_KEY              ← با اسکریپت تولید کن (راهنما در .env.example)
#   SERVICE_ROLE_KEY      ← با اسکریپت تولید کن
#   SITE_URL              ← https://yourdomain.ir
nano .env

# اجرای استک
docker compose up -d

# بررسی سلامت
docker compose ps
```

پس از چند ثانیه، Supabase روی پورت `8000` (Kong) در دسترس است.

---

## ۴. اعمال Migrationها

```bash
cd /opt/myshop/app
bash scripts/apply-migrations.sh
```

این اسکریپت تمام فایل‌های `supabase/migrations/*.sql` را به‌ترتیب روی دیتابیس جدید اجرا می‌کند.

---

## ۵. انتقال داده‌ها

راهنمای کامل در `MIGRATION.md`. خلاصه:

```bash
# روی کامپیوتر شخصی (با دسترسی به Lovable Cloud)
node scripts/export-data.mjs

# انتقال پوشه export/ به سرور
scp -r export/ root@SERVER:/opt/myshop/app/

# روی سرور
node scripts/import-data.mjs
```

---

## ۶. Build و اجرای اپلیکیشن

```bash
cd /opt/myshop/app

# تنظیم متغیرها
cp .env.production.example .env.production
nano .env.production   # پر کن

# نصب و build
bun install
bun run build

# اجرا با PM2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup   # دستور خروجی را اجرا کن تا با ریبوت بالا بیاید
```

---

## ۷. Nginx + SSL

```bash
cp /opt/myshop/app/nginx/site.conf.example /etc/nginx/sites-available/myshop
# دامنه را در فایل ویرایش کن:
nano /etc/nginx/sites-available/myshop

ln -s /etc/nginx/sites-available/myshop /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# SSL (Let's Encrypt - در صورت دسترسی)
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.ir -d www.yourdomain.ir

# اگر Let's Encrypt در دسترس نبود:
# گواهی از ZeroSSL یا یک ارائه‌دهنده ایرانی بگیر و دستی در /etc/nginx/ssl/ قرار بده
```

---

## ۸. SMTP

سیستم ایمیل قبلاً آماده است. فقط مقادیر `SMTP_*` در `.env.production` را پر کن و PM2 را ری‌استارت کن:

```bash
pm2 restart all
```

ارائه‌دهندگان SMTP داخلی: **MailerSend ایران، Mailerlite، یا SMTP خود هاست (مثلاً پارس‌پک، های‌وب)**.

---

## ۹. بکاپ روزانه

```bash
cat > /opt/myshop/backup.sh <<'EOF'
#!/bin/bash
DATE=$(date +%F)
DIR=/opt/backups/$DATE
mkdir -p $DIR

# دیتابیس
docker exec supabase-db pg_dump -U postgres postgres | gzip > $DIR/db.sql.gz

# استوریج (MinIO volumes)
tar czf $DIR/storage.tar.gz -C /opt/myshop/app/selfhost/volumes storage

# حذف بکاپ‌های قدیمی‌تر از ۱۴ روز
find /opt/backups -maxdepth 1 -type d -mtime +14 -exec rm -rf {} \;
EOF
chmod +x /opt/myshop/backup.sh

# اضافه به crontab (هر شب ساعت ۳)
(crontab -l 2>/dev/null; echo "0 3 * * * /opt/myshop/backup.sh") | crontab -
```

برای امنیت بیشتر، یک کپی از `/opt/backups/` را روی فضای ابری داخلی (مثل ابرآروان) همگام کن.

---

## ۱۰. به‌روزرسانی سایت

هر بار که در Lovable تغییری دادی:

```bash
# ZIP جدید را روی سرور آپلود کن
unzip -o project.zip -d /opt/myshop/app
cd /opt/myshop/app
bun install
bun run build
pm2 restart all
```

migrationهای جدید را هم اجرا کن:
```bash
bash scripts/apply-migrations.sh
```

---

## عیب‌یابی

- **سایت بالا نمیاد**: `pm2 logs`
- **خطای دیتابیس**: `docker compose -f selfhost/docker-compose.yml logs db`
- **خطای auth**: `docker compose -f selfhost/docker-compose.yml logs auth`
- **Nginx**: `tail -f /var/log/nginx/error.log`
