import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, User, Package, MapPin, Shield, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const [session, setSession] = useState<null | { user?: { email?: string } }>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session as unknown as typeof session);
      setLoading(false);
      if (!data.session) navigate({ to: "/auth" });
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession as unknown as typeof session);
      if (!newSession) navigate({ to: "/auth" });
    });

    return () => { listener.subscription.unsubscribe(); };
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 pt-8 pb-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="h-fit space-y-2 rounded-3xl glass-strong p-4">
            <div className="mb-4 border-b border-white/10 pb-4">
              <p className="text-xs text-muted-foreground">خوش آمدید</p>
              <p className="mt-1 text-sm font-bold">{session?.user?.email ?? "کاربر"}</p>
            </div>
            <NavItem to="/account" icon={User} label="پروفایل" />
            <NavItem to="/account/orders" icon={Package} label="سفارشات" />
            <NavItem to="/account/addresses" icon={MapPin} label="آدرس‌ها" />

            <button
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/" });
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-destructive transition hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              خروج
            </button>
          </aside>

          <main>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

function NavItem({ to, icon: Icon, label }: { to: string; icon: typeof User; label: string }) {
  return (
    <Link
      to={to}
      activeProps={{ className: "bg-primary/15 text-primary font-bold" }}
      className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition hover:bg-white/5"
    >
      <span className="flex items-center gap-3">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <ChevronLeft className="h-3 w-3 opacity-50" />
    </Link>
  );
}
