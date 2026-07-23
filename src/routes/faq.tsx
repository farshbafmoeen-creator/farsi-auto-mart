import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = [
  { q: "چگونه از اصالت قطعه‌ی خریداری‌شده مطمئن شوم؟", a: "تمام قطعات پارت‌بازار از تأمین‌کننده‌های معتبر تهیه می‌شوند و دارای ضمانت اصالت هستند." },
  { q: "زمان ارسال سفارش چقدر است؟", a: "سفارش‌های ثبت‌شده تا ساعت ۱۲ ظهر، در همان روز کاری ارسال می‌شوند و معمولاً ۱ تا ۳ روز کاری به دست شما می‌رسند." },
  { q: "آیا امکان مرجوع کردن کالا وجود دارد؟", a: "بله — تا ۷ روز پس از تحویل، در صورت عدم استفاده و سالم بودن بسته‌بندی، امکان مرجوع کردن کالا وجود دارد." },
  { q: "روش‌های پرداخت چیست؟", a: "در حال حاضر پرداخت در محل تحویل (COD) و پرداخت آنلاین از طریق درگاه‌های معتبر فعال است." },
  { q: "چطور از مناسب بودن قطعه برای خودرویم مطمئن شوم؟", a: "از طریق صفحه‌ی هر محصول می‌توانید مدل‌های سازگار را مشاهده کنید یا با پشتیبانی تماس بگیرید." },
  { q: "آیا فاکتور رسمی صادر می‌شود؟", a: "بله، در صورت درخواست هنگام ثبت سفارش، فاکتور رسمی به همراه مرسوله ارسال می‌شود." },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "سؤالات متداول | پارت‌بازار" },
      { name: "description", content: "پاسخ پرسش‌های پرتکرار درباره‌ی خرید، ارسال و مرجوعی قطعات از پارت‌بازار." },
      { property: "og:title", content: "سؤالات متداول پارت‌بازار" },
      { property: "og:description", content: "پاسخ سؤالات شما درباره‌ی سفارش و ارسال." },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-black md:text-4xl">سؤالات متداول</h1>
          <p className="mt-3 text-muted-foreground">پاسخ پرسش‌های پرتکرار شما را در این بخش گردآوری کرده‌ایم.</p>
          <Accordion type="single" collapsible className="mt-8 rounded-2xl glass p-2">
            {FAQ.map((f, i) => (
              <AccordionItem key={i} value={String(i)} className="border-border">
                <AccordionTrigger className="px-4 text-right hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="px-4 text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>
      <Footer />
    </div>
  );
}
