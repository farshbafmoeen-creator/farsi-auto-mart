import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { adminStats } from "@/lib/admin.functions";
import { toFa, formatToman } from "@/lib/fa";
import { Package, ShoppingBag, Clock, Wallet } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const fetchStats = useServerFn(adminStats);
  const { data, isLoading } = useQuery({ queryKey: ["adminStats"], queryFn: () => fetchStats() });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold">داشبورد مدیریت</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Package className="h-5 w-5" />} label="محصولات" value={isLoading ? "…" : toFa(data?.productsCount ?? 0)} />
        <StatCard icon={<ShoppingBag className="h-5 w-5" />} label="کل سفارشات" value={isLoading ? "…" : toFa(data?.ordersCount ?? 0)} />
        <StatCard icon={<Clock className="h-5 w-5" />} label="در انتظار پرداخت" value={isLoading ? "…" : toFa(data?.pendingCount ?? 0)} />
        <StatCard icon={<Wallet className="h-5 w-5" />} label="درآمد (تومان)" value={isLoading ? "…" : formatToman(data?.revenue ?? 0)} />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link to="/admin/products" className="rounded-2xl border border-border bg-card/40 p-5 transition hover:border-primary/40 hover:bg-card/60">
          <h3 className="mb-1 font-bold">مدیریت محصولات</h3>
          <p className="text-sm text-muted-foreground">افزودن، ویرایش و حذف محصولات کاتالوگ</p>
        </Link>
        <Link to="/admin/orders" className="rounded-2xl border border-border bg-card/40 p-5 transition hover:border-primary/40 hover:bg-card/60">
          <h3 className="mb-1 font-bold">مدیریت سفارشات</h3>
          <p className="text-sm text-muted-foreground">مشاهده و بروزرسانی وضعیت سفارش‌ها</p>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card/40 p-5">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">{icon}</div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
    </div>
  );
}
