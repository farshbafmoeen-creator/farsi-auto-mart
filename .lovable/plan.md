
# پلن: آماده‌سازی سیستم ایمیل پرتابل (SMTP)

هدف: همه‌ی کدهای ارسال ایمیل با Nodemailer + SMTP نوشته بشه، با متغیرهای محیطی، تا بعداً روی سرور ایرانی فقط ENV ها رو پر کنی و کار کنه. هیچ وابستگی به Lovable Emails یا سرویس خارجی نباشه.

## ۱. نصب پکیج
- `nodemailer` و `@types/nodemailer`

## ۲. متغیرهای محیطی (لیست برای .env سرور خودت)
```
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM="فروشگاه فرشباف <no-reply@yourdomain.com>"
ADMIN_NOTIFY_EMAIL=farshbafmoeen@gmail.com
SITE_URL=https://yourdomain.com
```
الان فقط Placeholder توی کد ست می‌شه؛ ENV واقعی رو سر سرور می‌ذاری.

## ۳. ساختار فایل‌ها
- `src/lib/email/mailer.server.ts` — ساخت transporter از ENV، تابع `sendMail({to, subject, html, text})`، با حالت dev (اگر ENV نباشه فقط console.log)
- `src/lib/email/templates/` — تمپلیت‌های HTML فارسی RTL inline‑styled:
  - `orderConfirmation.ts` — تأیید سفارش (به مشتری)
  - `orderStatusUpdate.ts` — تغییر وضعیت سفارش (به مشتری)
  - `adminNewOrder.ts` — اطلاع سفارش جدید (به ادمین)
  - `contactForm.ts` — پیام فرم تماس (به ادمین)
  - `layout.ts` — Wrapper مشترک (هدر/فوتر، فونت Vazirmatn، RTL)
- `src/lib/email/send.functions.ts` — `createServerFn`ها:
  - `sendOrderConfirmationEmail({ orderId })` — داده از DB می‌خونه و می‌فرسته
  - `sendOrderStatusEmail({ orderId, newStatus })`
  - `sendAdminNewOrderEmail({ orderId })`
  - `sendContactEmail({ name, email, message })` — بدون auth، برای فرم تماس

## ۴. اتصال به جریان فعلی
- `checkout.tsx`: بعد از موفقیت `createOrder` → `sendOrderConfirmationEmail` + `sendAdminNewOrderEmail` (با try/catch تا خطای ایمیل، خرید رو خراب نکنه)
- `admin/orders.$id.tsx`: موقع تغییر وضعیت → `sendOrderStatusEmail`
- `contact.tsx`: فعال‌سازی Submit با `sendContactEmail`

## ۵. مستندات
- فایل `EMAIL_SETUP.md` در ریشه پروژه با:
  - لیست ENV ها
  - نمونه تنظیم برای Gmail / Zoho / SMTP سفارشی ایرانی (Chapar/Liara/Mailcow)
  - نحوه تست
  - نکات SPF/DKIM/DMARC

## ۶. نکات فنی
- همه‌ی توابع ایمیل **server-only** (`createServerFn`) — کلید SMTP هیچ‌وقت سمت کلاینت نمی‌ره
- Transporter به‌صورت lazy و singleton ساخته می‌شه
- در محیط فعلی (بدون ENV) ایمیل‌ها فقط لاگ می‌شن و خطا نمی‌دن، پس preview نمی‌شکنه
- متن‌ها فارسی، قالب RTL، با اطلاعات سفارش (شماره، اقلام، مبلغ، آدرس)

## خروجی نهایی
کد ۱۰۰٪ آماده. روی سرور خودت فقط `.env` رو پر می‌کنی و ری‌استارت — ایمیل‌ها کار می‌کنن.
