import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getMyOrder } from "@/lib/orders.functions";
import { formatToman, toFa } from "@/lib/fa";
import { ArrowRight } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "در انتظار پرداخت",
  paid: "پرداخت شده",
  processing: "در حال آماده‌سازی",
  shipped: "ارسال شده",
  delivered: "تحویل شده",
  cancelled: "لغو شده",
};

export const Route = createFileRoute("/_authenticated/orders/$id")({
  head: () => ({ meta: [{ title: "جزئیات سفارش | پارت‌بازار" }] }),
  component: OrderDetail,
});

function OrderDetail() {
  const { id } = Route.useParams();
  const getFn = useServerFn(getMyOrder);
  const { data: o, isLoading } = useQuery({
    queryKey: ["myOrder", id],
    queryFn: () => getFn({ data: { id } }),
  });

  return (
    <>
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-10">
        <div className="mb-5 flex items-center justify-between">
          <Link to="/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowRight className="h-4 w-4" /> بازگشت
          </Link>
        </div>

        {isLoading && <p className="text-muted-foreground">در حال بارگذاری…</p>}
        {!isLoading && !o && <p className="text-muted-foreground">سفارش پیدا نشد.</p>}

        {o && (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-extrabold">
                سفارش <span className="font-mono">{o.order_number}</span>
              </h1>
              <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary">
                {STATUS_LABEL[o.status] ?? o.status}
              </span>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
              <div className="rounded-2xl border border-border bg-card/40 p-5">
                <h2 className="mb-3 font-bold">اقلام</h2>
                <ul className="divide-y divide-white/10 text-sm">
                  {(o.order_items ?? []).map((it: any) => (
                    <li key={it.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        {it.product_snapshot?.image && (
                          <img src={it.product_snapshot.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                        )}
                        <div>
                          <div className="font-medium">{it.product_snapshot?.title_fa ?? "—"}</div>
                          <div className="text-xs text-muted-foreground">
                            {toFa(it.quantity)} × {formatToman(it.unit_price)}
                          </div>
                        </div>
                      </div>
                      <div className="font-bold">{formatToman(it.unit_price * it.quantity)}</div>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
                  <Row label="جمع" v={`${formatToman(o.subtotal)} تومان`} />
                  <Row label="هزینه ارسال" v={o.shipping_cost ? `${formatToman(o.shipping_cost)} تومان` : "رایگان"} />
                  <Row label="جمع کل" v={`${formatToman(o.total)} تومان`} bold />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card/40 p-5">
                <h2 className="mb-3 font-bold">آدرس تحویل</h2>
                <dl className="space-y-1.5 text-sm">
                  <Row label="نام" v={(o.shipping_address as any)?.recipient_name ?? "—"} />
                  <Row label="تلفن" v={(o.shipping_address as any)?.phone ?? "—"} />
                  <Row label="استان" v={(o.shipping_address as any)?.province ?? "—"} />
                  <Row label="شهر" v={(o.shipping_address as any)?.city ?? "—"} />
                  <Row label="آدرس" v={(o.shipping_address as any)?.address_line ?? "—"} />
                  <Row label="کدپستی" v={(o.shipping_address as any)?.postal_code ?? "—"} />
                </dl>
                <p className="mt-3 text-xs text-muted-foreground">
                  ثبت در {new Date(o.created_at).toLocaleString("fa-IR")}
                </p>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}

function Row({ label, v, bold }: { label: string; v: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={bold ? "text-base font-extrabold" : ""}>{v}</dd>
    </div>
  );
}
