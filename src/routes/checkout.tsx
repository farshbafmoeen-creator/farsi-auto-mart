import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CreditCard, MapPin, Truck, Check } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useCart } from "@/lib/cart-context";
import { formatToman } from "@/lib/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "تسویه‌حساب | پارت‌بازار" },
      { name: "description", content: "تکمیل سفارش و پرداخت آنلاین." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<"address" | "payment" | "done">("address");
  const [form, setForm] = useState({
    recipient_name: "",
    phone: "",
    province: "",
    city: "",
    address_line: "",
    postal_code: "",
  });

  if (items.length === 0 && step !== "done") {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto flex flex-col items-center justify-center px-4 pt-20 pb-16">
          <h1 className="text-xl font-bold">سبد خرید خالی است</h1>
          <Link to="/shop">
            <Button className="mt-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              بازگشت به فروشگاه
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const shipping = totalPrice > 5000000 ? 0 : 250000;
  const grandTotal = totalPrice + shipping;

  const handlePayment = () => {
    // Mock payment for now
    clearCart();
    setStep("done");
  };

  if (step === "done") {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto flex flex-col items-center justify-center px-4 pt-20 pb-16 text-center">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-green-500/20 text-green-400">
            <Check className="h-10 w-10" />
          </div>
          <h1 className="mt-6 text-2xl font-black">سفارش ثبت شد!</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            این یک پرداخت آزمایشی بود. اتصال به درگاه زرین‌پال در گام بعدی انجام می‌شود.
          </p>
          <Link to="/shop">
            <Button className="mt-6 gap-2">
              <ArrowLeft className="h-4 w-4" />
              ادامه خرید
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 pt-8 pb-16">
        <Link to="/cart" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> بازگشت به سبد
        </Link>

        <h1 className="mt-4 text-2xl font-black">تسویه‌حساب</h1>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {step === "address" && (
              <div className="rounded-3xl glass-strong p-6">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">آدرس تحویل</h2>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    placeholder="نام و نام خانوادگی گیرنده"
                    value={form.recipient_name}
                    onChange={(e) => setForm({ ...form, recipient_name: e.target.value })}
                    className="glass bg-white/5"
                  />
                  <Input
                    placeholder="شماره تماس"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="glass bg-white/5"
                  />
                  <Input
                    placeholder="استان"
                    value={form.province}
                    onChange={(e) => setForm({ ...form, province: e.target.value })}
                    className="glass bg-white/5"
                  />
                  <Input
                    placeholder="شهر"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="glass bg-white/5"
                  />
                  <Input
                    placeholder="کد پستی"
                    value={form.postal_code}
                    onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                    className="glass bg-white/5"
                  />
                  <Input
                    placeholder="آدرس کامل"
                    value={form.address_line}
                    onChange={(e) => setForm({ ...form, address_line: e.target.value })}
                    className="glass bg-white/5 sm:col-span-2"
                  />
                </div>
                <Button
                  className="mt-6 w-full gap-2 bg-gradient-to-r from-primary to-[oklch(0.75_0.20_45)] text-primary-foreground glow-primary"
                  onClick={() => setStep("payment")}
                >
                  ادامه به پرداخت
                </Button>
              </div>
            )}

            {step === "payment" && (
              <div className="rounded-3xl glass-strong p-6">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">پرداخت</h2>
                </div>
                <div className="mt-6 rounded-2xl border border-dashed border-white/20 bg-white/5 p-8 text-center">
                  <Truck className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    اتصال به درگاه زرین‌پال در گام بعدی فعال می‌شود.
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    فعلاً پرداخت آزمایشی است و هیچ وجهی کسر نمی‌شود.
                  </p>
                </div>
                <div className="mt-6 flex gap-3">
                  <Button variant="outline" onClick={() => setStep("address")} className="flex-1">
                    بازگشت
                  </Button>
                  <Button
                    className="flex-1 gap-2 bg-gradient-to-r from-primary to-[oklch(0.75_0.20_45)] text-primary-foreground glow-primary"
                    onClick={handlePayment}
                  >
                    <CreditCard className="h-4 w-4" />
                    پرداخت آزمایشی
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <aside className="h-fit rounded-3xl glass-strong p-6">
            <h2 className="text-lg font-bold">خلاصه سفارش</h2>
            <div className="mt-4 max-h-64 space-y-3 overflow-auto">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <img src={item.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold">{item.title_fa}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatToman(item.quantity)} × {formatToman(item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-3 border-t border-white/10 pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>جمع کالاها</span>
                <span>{formatToman(totalPrice)} تومان</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>هزینه ارسال</span>
                <span>{shipping === 0 ? "رایگان" : `${formatToman(shipping)} تومان`}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold">
                <span>مبلغ قابل پرداخت</span>
                <span className="gradient-text">{formatToman(grandTotal)} تومان</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
