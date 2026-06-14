هدف: قبل از فاز پرداخت، تجربه‌ی کاربر و پنل مدیریت به وضعیت کاربردی برسد.

## بخش ۱ — UI عمومی

### ۱.۱ هدر با مگامنو + جستجو + منوی موبایل
- فایل: `src/components/layout/Header.tsx`
- "دسته‌بندی‌ها": مگامنوی hover/click با ۲ ستون — دسته‌ها (از `getCategories`) و برندهای خودرو (از `getCarMakes`)، هر کدام لینک به `/shop?category=...` یا `/shop?make=...`.
- "فروشگاه": لینک ساده به `/shop`.
- "خانه / درباره ما / تماس": لینک‌های واقعی.
- دکمه‌ی جستجو → باز کردن یک Command/Dialog سبک که به `/shop?q=...` هدایت می‌کند.
- آیکن همبرگر → `Sheet` راست‌به‌چپ شامل همان لینک‌ها + جمع‌شونده‌های دسته/برند.
- شامل لینک «ورود به پنل ادمین» در صورت ادمین بودن کاربر.

### ۱.۲ فوتر مشترک
- جدا کردن فوتر فعلی از `index.tsx` به `src/components/layout/Footer.tsx` و استفاده در همه‌ی صفحات اصلی (`/`, `/shop`, `/cart`, `/checkout`, `/product/$slug`).
- تبدیل تمام آیتم‌های لیست‌ها به `<Link>` به مقصدهای واقعی.

### ۱.۳ صفحات استاتیک جدید
- `src/routes/about.tsx` — درباره ما
- `src/routes/contact.tsx` — تماس با ما (فرم ساده‌ی mailto در فاز فعلی)
- `src/routes/faq.tsx` — سوالات متداول (Accordion)
- `src/routes/shipping.tsx` — روش‌های ارسال
- `src/routes/returns.tsx` — بازگشت کالا
- `src/routes/privacy.tsx` — حریم خصوصی
هر صفحه `head()` مستقل با title/description مخصوص خود + هدر/فوتر مشترک.

### ۱.۴ صفحه‌ی `/shop` — پشتیبانی از کوئری‌استرینگ
- `validateSearch` برای `q`, `category`, `make` تا لینک‌های مگامنو/جستجو کار کنند (اگر هنوز نیست).

## بخش ۲ — پنل ادمین

ساختار فعلی (`/admin`, `/admin/products`, `/admin/products/new`, `/admin/products/$id`, `/admin/orders`) حفظ می‌شود؛ موارد زیر اضافه/تکمیل می‌گردد:

### ۲.۱ داشبورد (`/admin`)
- کارت‌های آماری: تعداد محصولات، تعداد سفارش‌های امروز/کل، درآمد کل، تعداد سفارش‌های در انتظار.
- لیست ۵ سفارش اخیر + ۵ محصول کم‌موجودی.
- server fn جدید: `getAdminStats` در `src/lib/admin.functions.ts`.

### ۲.۲ مدیریت محصولات
- لیست: جستجو، فیلتر دسته، صفحه‌بندی، دکمه‌های ویرایش/حذف، نشانگر وضعیت موجودی.
- فرم: آپلود تصویر واقعی به Storage (`product-images` bucket) — جایگزین URL دستی.
- حذف با تأیید (`AlertDialog`).
- server fns: `deleteProduct`, `uploadProductImage` در `src/lib/products.functions.ts` (با چک ادمین).

### ۲.۳ مدیریت سفارش‌ها (`/admin/orders`)
- لیست با فیلتر وضعیت (`pending|paid|shipped|delivered|cancelled`).
- صفحه‌ی جزئیات سفارش (`/admin/orders/$id`): مشخصات مشتری، آدرس، اقلام، تغییر وضعیت.
- server fns: `getAdminOrders`, `getAdminOrder`, `updateOrderStatus`.

### ۲.۴ مدیریت دسته‌بندی‌ها و برندها (مختصر)
- صفحه‌ی `/admin/taxonomy`: CRUD ساده برای `categories` و `car_makes` (افزودن/حذف).

## جزئیات فنی

- همه‌ی server functionهای ادمین با `requireSupabaseAuth` + چک `has_role(uid, 'admin')` در ابتدای handler.
- آپلود تصویر از کلاینت با همان `supabase` clientِ احراز شده: `storage.from('product-images').upload(...)` سپس ذخیره‌ی public URL در `products.image_url`.
- مگامنو با Radix `NavigationMenu` (`src/components/ui/navigation-menu.tsx` در صورت نبود اضافه شود).
- منوی موبایل با `Sheet` موجود.
- جستجو با `Command` موجود (اگر نبود اضافه می‌شود)؛ Submit → `navigate({ to: '/shop', search: { q } })`.
- همه‌ی صفحات استاتیک سبک و RTL، با همان طراحی glass موجود.

## ترتیب پیاده‌سازی
1. Header (مگامنو + موبایل + جستجو) + Footer مشترک + ۶ صفحه‌ی استاتیک.
2. داشبورد ادمین + آمار.
3. تکمیل CRUD محصولات + آپلود تصویر.
4. تکمیل مدیریت سفارش‌ها + صفحه‌ی جزئیات.
5. مدیریت دسته‌بندی/برند.

سپس وارد فاز پرداخت می‌شویم.