import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Mail, Phone, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تماس با ما | پارت‌بازار" },
      { name: "description", content: "راه‌های ارتباطی با تیم پشتیبانی پارت‌بازار." },
      { property: "og:title", content: "تماس با پارت‌بازار" },
      { property: "og:description", content: "ما در کنار شماییم — پاسخگوی پرسش‌های شما." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const mailto = `mailto:support@partbazaar.example?subject=${encodeURIComponent("پیام از " + (form.name || "وب‌سایت"))}&body=${encodeURIComponent(form.message + "\n\n— " + form.email)}`;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h1 className="text-3xl font-black md:text-4xl">تماس با ما</h1>
            <p className="mt-3 text-muted-foreground">
              برای راهنمایی در انتخاب قطعه، پیگیری سفارش یا هر سؤال دیگری با ما در ارتباط باشید.
            </p>
            <ul className="mt-8 space-y-4">
              <li className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">تلفن پشتیبانی</div>
                  <div className="font-bold" dir="ltr">021 — 1234 5678</div>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">ایمیل</div>
                  <div className="font-bold" dir="ltr">support@partbazaar.example</div>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">آدرس</div>
                  <div className="font-bold">تهران، خیابان نمونه، پلاک ۱۲</div>
                </div>
              </li>
            </ul>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = mailto;
            }}
            className="rounded-2xl glass p-6"
          >
            <h2 className="text-lg font-bold">پیام به ما</h2>
            <div className="mt-4 space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block text-muted-foreground">نام شما</span>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-muted-foreground">ایمیل</span>
                <Input type="email" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-muted-foreground">پیام</span>
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  className="w-full rounded-md border border-white/10 bg-background p-3 text-sm"
                />
              </label>
            </div>
            <Button type="submit" className="mt-4 w-full">ارسال پیام</Button>
            <p className="mt-2 text-xs text-muted-foreground">پیام شما در برنامه‌ی ایمیل پیش‌فرض باز می‌شود.</p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
