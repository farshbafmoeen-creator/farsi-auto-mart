import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getMyOrders } from "@/lib/orders.functions";
import { formatToman } from "@/lib/fa";
import { Package, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "در انتظار پرداخت",
  paid: "پرداخت شده",
  processing: "در حال آماده‌سازی",
  shipped: "ارسال شده",
  delivered: "تحویل شده",
  cancelled: "لغو شده",
};

const STATUS_COLOR: Record<string, string> = {
  pending_payment: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  paid: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  processing: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  shipped: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  delivered: "bg-green-500/15 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
};

export const Route = createFileRoute("/_authenticated/orders/")({
  head: () => ({ meta: [{ title: "سفارش‌های من | پارت‌بازار" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  const getFn = useServerFn(getMyOrders);
  const { data, isLoading } = useQuery({ queryKey: ["myOrders"], queryFn: () => getFn() });

  return (
    <>
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-3xl font-extrabold">سفارش‌های من</h1>
          <Link to="/account">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" /> حساب کاربری
            </Button>
          </Link>
        </div>

        {isLoading && <p className="text-muted-foreground">در حال بارگذاری…</p>}

        {!isLoading && (!data || data.length === 0) && (
          <div className="rounded-3xl border border-border bg-card/40 p-10 text-center">
            <Package className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">هنوز سفارشی ثبت نکرده‌اید.</p>
            <Link to="/shop">
              <Button className="mt-4">رفتن به فروشگاه</Button>
            </Link>
          </div>
        )}

        {data && data.length > 0 && (
          <ul className="space-y-3">
            {data.map((o) => (
              <li key={o.id}>
                <Link
                  to="/orders/$id"
                  params={{ id: o.id }}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/40 p-4 transition hover:border-primary/40 hover:bg-card/60"
                >
                  <div>
                    <div className="font-mono text-sm font-bold">{o.order_number}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleString("fa-IR")}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full border px-3 py-1 text-xs ${STATUS_COLOR[o.status] ?? ""}`}>
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                    <span className="font-extrabold">{formatToman(o.total)} تومان</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </>
  );
}
