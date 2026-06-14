# راه‌اندازی ایمیل روی سرور شما

این پروژه برای ارسال ایمیل از **SMTP استاندارد (Nodemailer)** استفاده می‌کنه.
هیچ وابستگی به سرویس خارجی نداره — هر SMTP سرور (Gmail, Zoho, Mailcow, Liara, چاپار، …) کار می‌کنه.

## متغیرهای محیطی (.env روی سرور)

```env
# سرور SMTP
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_SECURE=false           # true فقط اگر پورت 465 باشه
SMTP_USER=no-reply@yourdomain.com
SMTP_PASS=********

# آدرس فرستنده‌ای که در inbox دیده می‌شه
SMTP_FROM="پارت‌بازار <no-reply@yourdomain.com>"

# گیرنده‌ی اعلان‌های مدیر (سفارش جدید + فرم تماس)
ADMIN_NOTIFY_EMAIL=admin@yourdomain.com

# آدرس عمومی سایت (در لینک‌های داخل ایمیل)
SITE_URL=https://yourdomain.com
```

> اگر این متغیرها ست نباشن، ارسال ایمیل **skip** می‌شه و فقط در لاگ سرور نشون داده می‌شه — هیچ خطایی به کاربر نمی‌خوره.

## نمونه تنظیمات

**Gmail (App Password):**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
```

**Zoho:**
```
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_SECURE=true
```

**Liara Mail:**
```
SMTP_HOST=smtp.liara.ir
SMTP_PORT=587
SMTP_SECURE=false
```

**Mailcow / Postfix شخصی:**
```
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
```

## DNS برای دلیوری بهتر

روی دامنه‌ی فرستنده حتماً تنظیم کنید:
- **SPF** — مثلاً: `v=spf1 include:_spf.google.com ~all`
- **DKIM** — رکوردی که ارائه‌دهنده‌ی SMTP می‌ده
- **DMARC** — مثلاً: `v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com`

## ایمیل‌های فعال

| تریگر | گیرنده | تابع |
|---|---|---|
| ثبت موفق سفارش | مشتری | `sendOrderConfirmationEmail` |
| سفارش جدید | ادمین | `sendAdminNewOrderEmail` |
| تغییر وضعیت سفارش (توسط ادمین) | مشتری | `sendOrderStatusEmail` |
| ارسال فرم تماس | ادمین | `sendContactFormEmail` |

## تست

روی سرور بعد از ست‌کردن ENV ها:
1. یک سفارش ثبت کنید → ایمیل «تأیید سفارش» باید برسه.
2. در پنل ادمین وضعیت رو تغییر بدید → ایمیل «به‌روزرسانی وضعیت» باید برسه.
3. فرم تماس رو پر کنید → پیام به `ADMIN_NOTIFY_EMAIL` می‌رسه.

اگر چیزی نرسید، لاگ سرور رو ببینید (پیام‌های `[mail:sent]` / `[mail:error]` / `[mail:skipped]`).
