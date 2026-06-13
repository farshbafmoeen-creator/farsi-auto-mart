import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { checkIsAdmin } from "@/lib/admin.functions";
import { LayoutDashboard, Package, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "پنل ادمین | پارت‌بازار" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const checkAdmin = useServerFn(checkIsAdmin);
  const { data, isLoading } = useQuery({ queryKey: ["isAdmin"], queryFn: () => checkAdmin() });

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-20 text-center text-muted-foreground">در حال بررسی دسترسی…</main>
      </>
    );
  }

  if (!data?.isAdmin) {
    return (
      <>
        <Header />
        <main className="container mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="mb-3 text-2xl font-bold">دسترسی غیرمجاز</h1>
          <p className="text-muted-foreground">شما به پنل مدیریت دسترسی ندارید.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-white/10 bg-card/40 p-3">
              <nav className="flex flex-col gap-1 text-sm">
                <AdminNavLink to="/admin" icon={<LayoutDashboard className="h-4 w-4" />} label="داشبورد" exact />
                <AdminNavLink to="/admin/products" icon={<Package className="h-4 w-4" />} label="محصولات" />
                <AdminNavLink to="/admin/orders" icon={<ShoppingBag className="h-4 w-4" />} label="سفارشات" />
              </nav>
            </div>
          </aside>
          <section className="min-w-0">
            <Outlet />
          </section>
        </div>
      </div>
    </>
  );
}

function AdminNavLink({ to, icon, label, exact }: { to: string; icon: React.ReactNode; label: string; exact?: boolean }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact }}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
      activeProps={{ className: "bg-primary/15 text-foreground" }}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
