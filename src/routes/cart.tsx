import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/lib/cart-context";
import { formatToman } from "@/lib/fa";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "سبد خرید | پارت‌بازار" },
      { name: "description", content: "مدیریت سبد خرید و تکمیل سفارش." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, removeItem, updateQty, totalPrice, totalItems } = useCart();

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 pt-8 pb-16">
        <h1 className="text-2xl font-black md:text-3xl">سبد خرید</h1>

        {items.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-3xl glass-strong p-12 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-bold">سبد خرید شما خالی است</h2>
            <p className="mt-2 text-sm text-muted-foreground">محصولات مورد نظر خود را به سبد اضافه کنید.</p>
            <Link to="/shop">
              <Button className="mt-6 gap-2">
                <ArrowLeft className="h-4 w-4" />
                بازگشت به فروشگاه
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
            {/* Items */}
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-4 rounded-2xl glass p-4 transition hover:border-border"
                >
                  <Link to="/product/$slug" params={{ slug: item.slug }} className="shrink-0">
                    <img
                      src={item.image || "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=200"}
                      alt={item.title_fa}
                      className="h-20 w-20 rounded-xl object-cover"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link to="/product/$slug" params={{ slug: item.slug }} className="hover:text-primary">
                      <h3 className="text-sm font-bold leading-snug">{item.title_fa}</h3>
                    </Link>
                    {item.brand && <p className="mt-1 text-xs text-muted-foreground">{item.brand}</p>}
                    <p className="mt-2 text-sm font-extrabold gradient-text">
                      {formatToman(item.price)} <span className="text-[10px] text-muted-foreground">تومان</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQty(item.productId, item.quantity - 1)}
                      className="grid h-8 w-8 place-items-center rounded-lg bg-accent/50 transition hover:bg-accent"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold">{formatToman(item.quantity)}</span>
                    <button
                      onClick={() => updateQty(item.productId, item.quantity + 1)}
                      className="grid h-8 w-8 place-items-center rounded-lg bg-accent/50 transition hover:bg-accent"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground transition hover:bg-destructive/15 hover:text-destructive"
                    aria-label="حذف"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <aside className="h-fit rounded-3xl glass-strong p-6">
              <h2 className="text-lg font-bold">خلاصه سفارش</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>تعداد کالا</span>
                  <span>{formatToman(totalItems)}</span>
                </div>
                <div className="flex justify-between font-extrabold">
                  <span>جمع کل</span>
                  <span className="gradient-text">{formatToman(totalPrice)} تومان</span>
                </div>
              </div>
              <Link to="/checkout">
                <Button className="mt-6 w-full gap-2 bg-gradient-to-r from-primary to-[oklch(0.75_0.20_45)] text-primary-foreground glow-primary">
                  تکمیل خرید
                </Button>
              </Link>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                هزینه ارسال در مرحله بعد محاسبه می‌شود.
              </p>
            </aside>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
