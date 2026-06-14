import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminGetOrder, adminUpdateOrderStatus } from "@/lib/admin.functions";
import { sendOrderStatusEmail } from "@/lib/email/send.functions";
import { formatToman, toFa } from "@/lib/fa";
import { ArrowRight } from "lucide-react";

const STATUSES = [
  { value: "pending_payment", label: "در انتظار پرداخت" },
  { value: "paid", label: "پرداخت شده" },
  { value: "processing", label: "در حال آماده‌سازی" },
  { value: "shipped", label: "ارسال شده" },
  { value: "delivered", label: "تحویل داده شده" },
  { value: "cancelled", label: "لغو شده" },
];

export const Route = createFileRoute("/_authenticated/admin/orders/$id")({
  component: AdminOrderDetail,
});

function AdminOrderDetail() {
  const { id } = Route.useParams();
  const getFn = useServerFn(adminGetOrder);
  const updateFn = useServerFn(adminUpdateOrderStatus);
  const sendStatusFn = useServerFn(sendOrderStatusEmail);
  const qc = useQueryClient();

  const { data: o, isLoading } = useQuery({
    queryKey: ["adminOrder", id],
    queryFn: () => getFn({ data: { id } }),
  });

  if (isLoading) return <div className="py-10 text-center text-muted-foreground">در حال بارگذاری…</div>;
  if (!o) return <div className="py-10 text-center text-muted-foreground">سفارش پیدا نشد.</div>;

  const addr: any = o.shipping_address ?? {};

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">
          سفارش <span className="font-mono">{o.order_number}</span>
        </h1>
        <Link to="/admin/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowRight className="h-4 w-4" />
          بازگشت به لیست
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-card/40 p-5">
          <h2 className="mb-3 font-bold">اقلام سفارش</h2>
          <ul className="divide-y divide-white/10 text-sm">
            {o.order_items?.map((it: any) => (
              <li key={it.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  {it.product_snapshot?.image && (
                    <img src={it.product_snapshot.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  )}
                  <div>
                    <div className="font-medium">{it.product_snapshot?.title_fa ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">
                      {it.product_snapshot?.brand} · {toFa(it.quantity)} × {formatToman(it.unit_price)}
                    </div>
                  </div>
                </div>
                <div className="font-bold">{formatToman(it.unit_price * it.quantity)}</div>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t border-white/10 pt-4 text-sm">
            <Row label="جمع" v={formatToman(o.subtotal)} />
            <Row label="هزینه ارسال" v={formatToman(o.shipping_cost)} />
            <Row label="جمع کل" v={formatToman(o.total)} bold />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-card/40 p-5">
            <h2 className="mb-3 font-bold">وضعیت</h2>
            <select
              value={o.status}
              onChange={async (e) => {
                const newStatus = e.target.value;
                await updateFn({ data: { id: o.id, status: newStatus } });
                qc.invalidateQueries({ queryKey: ["adminOrder", id] });
                qc.invalidateQueries({ queryKey: ["adminOrders"] });
                void sendStatusFn({ data: { orderId: o.id, newStatus } }).catch((err) => console.warn("[email] status", err));
              }}
              className="w-full rounded-lg border border-white/10 bg-background px-3 py-2 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <p className="mt-2 text-xs text-muted-foreground">
              ثبت در {new Date(o.created_at).toLocaleString("fa-IR")}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-card/40 p-5">
            <h2 className="mb-3 font-bold">گیرنده</h2>
            <dl className="space-y-1.5 text-sm">
              <Row label="نام" v={addr.recipient_name ?? addr.full_name ?? "—"} />
              <Row label="تلفن" v={addr.phone ?? "—"} />
              <Row label="استان" v={addr.province ?? "—"} />
              <Row label="شهر" v={addr.city ?? "—"} />
              <Row label="آدرس" v={addr.address_line ?? addr.line1 ?? "—"} />
              <Row label="کدپستی" v={addr.postal_code ?? "—"} />
            </dl>
          </div>

          {o.notes && (
            <div className="rounded-2xl border border-white/10 bg-card/40 p-5">
              <h2 className="mb-2 font-bold">یادداشت</h2>
              <p className="text-sm text-muted-foreground">{o.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
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
