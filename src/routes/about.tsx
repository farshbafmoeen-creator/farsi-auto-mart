import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Shield, Truck, Headphones, Award } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "درباره ما | پارت‌بازار" },
      { name: "description", content: "پارت‌بازار، مرجع تخصصی خرید آنلاین قطعات اصلی خودرو با تضمین اصالت و ارسال سراسری." },
      { property: "og:title", content: "درباره پارت‌بازار" },
      { property: "og:description", content: "مرجع تخصصی قطعات یدکی خودرو در ایران." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-black md:text-5xl">درباره‌ی پارت‌بازار</h1>
          <p className="mt-6 text-lg leading-loose text-muted-foreground">
            پارت‌بازار با هدف ایجاد تجربه‌ای ساده، شفاف و قابل اعتماد برای خرید قطعات یدکی خودرو راه‌اندازی شده است.
            ما با همکاری مستقیم با تأمین‌کننده‌های معتبر، تلاش می‌کنیم قطعات اصلی را با منصفانه‌ترین قیمت در اختیار شما قرار دهیم.
          </p>
          <p className="mt-4 text-base leading-loose text-muted-foreground">
            تیم ما متشکل از کارشناسان فنی، متخصصان لجستیک و پشتیبانی است که در تمام مراحل سفارش، از انتخاب قطعه تا تحویل،
            در کنار شما خواهند بود.
          </p>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {[
              { icon: Shield, t: "تضمین اصالت", d: "تمام قطعات با ضمانت اصل بودن ارائه می‌شوند." },
              { icon: Truck, t: "ارسال سریع", d: "ارسال به سراسر ایران در کوتاه‌ترین زمان." },
              { icon: Headphones, t: "پشتیبانی تخصصی", d: "مشاوره‌ی فنی پیش و پس از خرید." },
              { icon: Award, t: "قیمت منصفانه", d: "بدون واسطه، با تأمین مستقیم از منبع." },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="rounded-2xl glass p-5">
                <div className="mb-3 inline-grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold">{t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
