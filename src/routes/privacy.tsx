import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "حریم خصوصی | پارت‌بازار" },
      { name: "description", content: "سیاست حریم خصوصی پارت‌بازار درباره‌ی جمع‌آوری، استفاده و حفاظت از اطلاعات کاربران." },
      { property: "og:title", content: "حریم خصوصی پارت‌بازار" },
      { property: "og:description", content: "ما به حریم خصوصی شما متعهدیم." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-3xl prose prose-invert">
          <h1 className="text-3xl font-black md:text-4xl">حریم خصوصی</h1>
          <div className="mt-6 space-y-4 text-sm leading-loose text-muted-foreground">
            <p>پارت‌بازار به حفظ حریم خصوصی کاربران خود متعهد است. این سند شیوه‌ی جمع‌آوری، استفاده و حفاظت از اطلاعات شما را شرح می‌دهد.</p>
            <h2 className="text-base font-bold text-foreground">اطلاعاتی که جمع‌آوری می‌کنیم</h2>
            <p>برای پردازش سفارش، نام، شماره تماس، آدرس و ایمیل شما را دریافت می‌کنیم. هیچ اطلاعات کارت بانکی روی سرورهای ما ذخیره نمی‌شود.</p>
            <h2 className="text-base font-bold text-foreground">استفاده از اطلاعات</h2>
            <p>اطلاعات شما تنها برای پردازش سفارش، ارسال کالا، پشتیبانی و — در صورت تأیید شما — اطلاع‌رسانی پیشنهادها استفاده می‌شود.</p>
            <h2 className="text-base font-bold text-foreground">امنیت</h2>
            <p>تمام ارتباطات با وب‌سایت از طریق پروتکل امن HTTPS انجام می‌گیرد و دسترسی به داده‌ها فقط برای پرسنل مجاز فراهم است.</p>
            <h2 className="text-base font-bold text-foreground">اشتراک‌گذاری با شخص ثالث</h2>
            <p>اطلاعات شخصی شما تنها در حدی که برای انجام ارسال کالا (با شرکت‌های پستی) لازم باشد به اشتراک گذاشته می‌شود.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
