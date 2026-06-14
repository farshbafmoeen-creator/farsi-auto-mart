import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Truck, Clock, Package } from "lucide-react";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "روش‌های ارسال | پارت‌بازار" },
      { name: "description", content: "روش‌ها و زمان‌بندی ارسال سفارش در پارت‌بازار." },
      { property: "og:title", content: "روش‌های ارسال پارت‌بازار" },
      { property: "og:description", content: "ارسال سریع و امن به سراسر ایران." },
    ],
  }),
  component: ShippingPage,
});

function ShippingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-black md:text-4xl">روش‌های ارسال</h1>
          <p className="mt-3 text-muted-foreground">سفارش شما با امن‌ترین و سریع‌ترین روش ممکن به دست شما می‌رسد.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Truck, t: "پست پیشتاز", d: "ارسال به سراسر کشور، ۲ تا ۴ روز کاری." },
              { icon: Package, t: "تیپاکس / باربری", d: "برای اقلام حجیم یا سنگین." },
              { icon: Clock, t: "پیک تهران", d: "ارسال هم‌روز در محدوده‌ی تهران." },
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
          <div className="mt-8 rounded-2xl glass p-5 text-sm leading-loose text-muted-foreground">
            <h2 className="mb-2 text-base font-bold text-foreground">هزینه‌ی ارسال</h2>
            <p>هزینه‌ی ارسال بر اساس وزن، حجم و مقصد سفارش، در صفحه‌ی پرداخت محاسبه و نمایش داده می‌شود. سفارش‌های بالای مبلغ مشخص، رایگان ارسال می‌شوند.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
