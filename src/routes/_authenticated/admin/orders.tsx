import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminListOrders, adminUpdateOrderStatus } from "@/lib/admin.functions";
import { formatToman, toFa } from "@/lib/fa";
import { ExternalLink } from "lucide-react";

const STATUSES: { value: string; label: string; color: string }[] = [
  { value: "pending_payment", label: "در انتظار پرداخت", color: "bg-amber-500/15 text-amber-300" },
  { value: "paid", label: "پرداخت شده", color: "bg-blue-500/15 text-blue-300" },
  { value: "shipped", label: "ارسال شده", color: "bg-purple-500/15 text-purple-300" },
  { value: "delivered", label: "تحویل داده شده", color: "bg-emerald-500/15 text-emerald-300" },
  { value: "cancelled", label: "لغو شده", color: "bg-red-500/15 text-red-300" },
];

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: AdminOrdersPage,
});

function AdminOrdersPage() {
  const [filter, setFilter] = useState<string>("");
  const listFn = useServerFn(adminListOrders);
  const updateFn = useServerFn(adminUpdateOrderStatus);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["adminOrders", filter],
    queryFn: () => listFn({ data: filter ? { status: filter as any } : undefined }),
  });

  const changeStatus = async (id: string, status: string) => {
    await updateFn({ data: { id, status } });
    qc.invalidateQueries({ queryKey: ["adminOrders"] });
  };

  const statusBadge = (status: string) => {
    const s = STATUSES.find((x) => x.value === status);
    return <span className={`rounded-full px-2 py-0.5 text-xs ${s?.color ?? "bg-white/5 text-muted-foreground"}`}>{s?.label ?? status}</span>;
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold">سفارشات</h1>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter("")}
          className={`rounded-full px-3 py-1 text-xs transition ${filter === "" ? "bg-primary text-primary-foreground" : "border border-white/10 hover:bg-white/5"}`}
        >
          همه
        </button>
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={`rounded-full px-3 py-1 text-xs transition ${filter === s.value ? "bg-primary text-primary-foreground" : "border border-white/10 hover:bg-white/5"}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-muted-foreground">در حال بارگذاری…</div>
      ) : (data?.length ?? 0) === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-card/40 py-10 text-center text-muted-foreground">سفارشی پیدا نشد.</div>
      ) : (
        <div className="space-y-3">
          {data?.map((o: any) => (
            <div key={o.id} className="rounded-2xl border border-white/10 bg-card/40 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      to="/admin/orders/$id"
                      params={{ id: o.id }}
                      className="inline-flex items-center gap-1 font-mono text-sm font-bold hover:text-primary"
                    >
                      {o.order_number}
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </Link>
                    {statusBadge(o.status)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleString("fa-IR")} · {toFa(o.order_items?.length ?? 0)} قلم
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="text-muted-foreground">گیرنده: </span>
                    {o.shipping_address?.full_name} · {o.shipping_address?.phone} · {o.shipping_address?.city}
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">جمع</div>
                  <div className="text-lg font-extrabold">{formatToman(o.total)} <span className="text-xs font-normal text-muted-foreground">تومان</span></div>
                </div>
              </div>

              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">اقلام سفارش</summary>
                <ul className="mt-2 space-y-1 text-sm">
                  {o.order_items?.map((it: any) => (
                    <li key={it.id} className="flex justify-between border-t border-white/5 py-2">
                      <span>{it.product_snapshot?.title_fa ?? "—"} × {toFa(it.quantity)}</span>
                      <span className="text-muted-foreground">{formatToman(it.unit_price * it.quantity)}</span>
                    </li>
                  ))}
                </ul>
              </details>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
                <span className="text-xs text-muted-foreground">تغییر وضعیت:</span>
                <select
                  value={o.status}
                  onChange={(e) => changeStatus(o.id, e.target.value)}
                  className="rounded-lg border border-white/10 bg-background px-3 py-1.5 text-sm"
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
