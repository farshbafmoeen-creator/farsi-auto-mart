import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "بازگشت کالا | پارت‌بازار" },
      { name: "description", content: "شرایط و فرآیند مرجوع کردن کالا در پارت‌بازار." },
      { property: "og:title", content: "بازگشت کالا" },
      { property: "og:description", content: "شرایط مرجوعی و گارانتی پارت‌بازار." },
    ],
  }),
  component: ReturnsPage,
});

function ReturnsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-black md:text-4xl">بازگشت کالا</h1>
          <p className="mt-3 text-muted-foreground">
            رضایت شما برای ما در اولویت است. اگر به هر دلیلی از خرید خود راضی نبودید، می‌توانید کالا را در شرایط زیر مرجوع کنید.
          </p>
          <div className="mt-8 space-y-3 rounded-2xl glass p-6 text-sm leading-loose">
            <h2 className="text-base font-bold">شرایط مرجوعی</h2>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground">
              <li>درخواست مرجوعی حداکثر تا ۷ روز پس از تحویل کالا.</li>
              <li>کالا باید در بسته‌بندی اصلی، سالم و بدون استفاده باشد.</li>
              <li>فاکتور خرید یا شماره‌ی سفارش الزامی است.</li>
              <li>کالاهای مصرفی (مانند روغن باز شده) قابل مرجوع نیستند.</li>
            </ul>
          </div>
          <div className="mt-4 space-y-2 rounded-2xl glass p-6 text-sm leading-loose">
            <h2 className="text-base font-bold">فرآیند مرجوعی</h2>
            <ol className="list-inside list-decimal space-y-1 text-muted-foreground">
              <li>درخواست خود را از صفحه‌ی «تماس با ما» یا تلفن پشتیبانی اعلام کنید.</li>
              <li>کارشناسان ما برای هماهنگی برگشت کالا با شما تماس می‌گیرند.</li>
              <li>پس از دریافت و تأیید سلامت کالا، وجه ظرف ۳ روز کاری بازگردانده می‌شود.</li>
            </ol>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
