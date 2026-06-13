
## محصول
فروشگاه آنلاین قطعات خودرو با رابط کاملاً فارسی و RTL، طراحی مدرن ۲۰۲۶ (گلس‌مورفیسم، 3D ظریف، پارالاکس، میکرو-اینتراکشن)، الهام‌گرفته از Stripe/Apple ولی بومی‌سازی‌شده برای کاربران ایرانی.

## فازبندی

### فاز ۱ — پایه و طراحی
- فعال‌سازی **Lovable Cloud** (دیتابیس، احراز هویت، استوریج تصاویر)
- پیکربندی **RTL سراسری** (`dir="rtl"`, `lang="fa"` در `__root.tsx`)
- بارگذاری فونت فارسی **Vazirmatn** از طریق `<link>` در head + تعریف در `@theme`
- سیستم طراحی در `src/styles.css`:
  - پالت تیره/روشن با لهجهٔ قرمز-نارنجی (حس صنعت خودرو)
  - توکن‌های `--gradient-glass`, `--shadow-elegant`, `--shadow-glow`
  - یوتیلیتی `glass-card` با `backdrop-blur` و حاشیهٔ نیمه‌شفاف
  - انیمیشن‌های `fade-in`, `scale-in`, `float`, `parallax`
- ارقام فارسی (هلپر `toFa()`) و فرمت قیمت تومان

### فاز ۲ — اسکیمای دیتابیس
جدول‌ها در public با GRANT و RLS کامل:
- `categories` (id, name_fa, slug, parent_id, icon)
- `car_makes` / `car_models` (برند خودرو → مدل → سال)
- `products` (id, title_fa, slug, description_fa, price, stock, brand, sku, category_id, images[], specs jsonb, is_active)
- `product_compatibility` (product_id ↔ car_model_id, year_from, year_to)
- `profiles` (id → auth.users, full_name, phone)
- `addresses` (user_id, province, city, postal_code, address_line, recipient_name, phone)
- `cart_items` (user_id, product_id, quantity)
- `orders` (id, user_id, status, total, shipping_address jsonb, payment_ref, created_at)
- `order_items` (order_id, product_id, quantity, unit_price, snapshot)
- `app_role` enum (`admin`, `customer`) + `user_roles` + تابع `has_role()` security definer
- استوریج باکت `product-images` (عمومی)
- **Seed**: ~۲۵ محصول نمونه (لنت ترمز، فیلتر روغن، شمع، باتری، ...) با تصاویر AI‌جنریت‌شده، چند برند خودرو ایرانی/خارجی (پراید، پژو ۲۰۶، سمند، تیبا، شاهین، تویوتا، هیوندای)

### فاز ۳ — صفحات عمومی (مسیرها)
ساختار TanStack file-based routes:
- `/` — لندینگ: هیرو ۳D پارالاکس با تصویر موتور، نوار جستجوی شیشه‌ای «خودروی خود را انتخاب کنید»، دسته‌بندی‌های محبوب، محصولات پیشنهادی، اعتمادسازها
- `/shop` — کاتالوگ با فیلتر کناری (دسته، برند خودرو، مدل، سال، محدودهٔ قیمت، موجودی) + گرید محصولات + مرتب‌سازی
- `/product/$slug` — صفحهٔ محصول: گالری، مشخصات، انتخابگر سازگاری خودرو، دکمهٔ افزودن به سبد با میکرو-اینتراکشن
- `/cart` — سبد خرید
- `/checkout` — انتخاب آدرس، روش ارسال، خلاصه، دکمهٔ «پرداخت» (آماده برای زرین‌پال)
- `/auth` — ورود/ثبت‌نام با ایمیل + Google
- `/orders/$id/success` — تأیید سفارش

### فاز ۴ — ناحیهٔ کاربر (`_authenticated/`)
- `/account` — پروفایل
- `/account/orders` — تاریخچهٔ سفارشات
- `/account/addresses` — مدیریت آدرس‌ها

### فاز ۵ — پنل ادمین (`_authenticated/admin/`، گیت با `has_role('admin')`)
- داشبورد (آمار کلی)
- مدیریت محصولات (CRUD + آپلود تصویر به استوریج)
- مدیریت سفارشات (تغییر وضعیت: در انتظار پرداخت / پرداخت‌شده / در حال ارسال / تحویل‌شده / لغو)
- مدیریت دسته‌بندی‌ها و خودروها

### فاز ۶ — پرداخت (آماده‌سازی زرین‌پال)
- سرور-فانکشن `createPaymentRequest` با ساختار آمادهٔ زرین‌پال (فعلاً mock: ساخت سفارش با وضعیت `pending` و ریدایرکت به صفحهٔ success)
- سرور-روت `/api/public/payment/callback` آمادهٔ دریافت کال‌بک
- secret ها: `ZARINPAL_MERCHANT_ID` بعداً اضافه می‌شود
- در UI واضح: «پرداخت آزمایشی — اتصال به درگاه در گام بعدی»

## جزئیات فنی
- **Server Functions** برای همهٔ خواندن/نوشتن دیتا (`*.functions.ts` در `src/lib/`)
  - `getProducts`, `getProduct`, `addToCart`, `getCart`, `createOrder`, `getOrders`, `admin.*` و ...
  - محافظت‌شده‌ها با `requireSupabaseAuth`؛ عمومی‌ها (لیست محصولات) با `supabaseAdmin` داخل handler و projection امن
- **TanStack Query** برای کش (الگوی `ensureQueryData` در loader + `useSuspenseQuery` در کامپوننت)
- **اعتبارسنجی** با Zod در همهٔ ورودی‌های فرم و سرور-فانکشن
- **SEO**: `head()` اختصاصی برای هر مسیر با تایتل/توضیح فارسی، og:image از تصویر محصول
- **شیدسی‌ان** کامپوننت‌ها به‌علاوهٔ واریانت `glass` و `premium` سفارشی
- **MagicUI** برای: Border Beam روی کارت محصول ویژه، Particles در هیرو، Animated Beam در بخش «چگونه کار می‌کند»

## ساختار فایل‌ها (اصلی)
```
src/
  routes/
    __root.tsx              (RTL, فونت، Header/Footer)
    index.tsx               (لندینگ)
    shop.tsx, shop.index.tsx
    product.$slug.tsx
    cart.tsx, checkout.tsx, auth.tsx
    orders.$id.success.tsx
    _authenticated/
      route.tsx             (مدیریت‌شده)
      account.tsx, account.orders.tsx, account.addresses.tsx
      admin.tsx (gate has_role)
      admin.products.tsx, admin.orders.tsx, admin.categories.tsx
    api/public/payment/callback.ts
  components/
    layout/ (Header, Footer, MobileNav)
    shop/ (ProductCard, ProductGrid, FilterSidebar, CarSelector)
    ui/ (shadcn + variants)
    magic/ (border-beam, particles)
  lib/
    products.functions.ts, cart.functions.ts, orders.functions.ts,
    admin.functions.ts, payment.functions.ts
    fa.ts (toFa, formatToman)
    schemas.ts (zod)
```

## آنچه ساخته نمی‌شود (در این فاز)
- اتصال واقعی به درگاه زرین‌پال (نیاز به merchant id)
- پیامک OTP (نیاز به سرویس)
- جستجوی فول‌تکست پیشرفته (در فاز بعد)
- چندزبانه (فقط فارسی)

پس از تأیید این پلن، با فعال‌سازی Lovable Cloud و ساخت اسکیمای دیتابیس شروع می‌کنم.
