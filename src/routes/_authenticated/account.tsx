import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/admin.functions";
import { LogOut, Shield, Package, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "حساب کاربری | پارت‌بازار" }] }),
  component: AccountPage,
});

function AccountPage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const checkAdmin = useServerFn(checkIsAdmin);
  const { data } = useQuery({ queryKey: ["isAdmin"], queryFn: () => checkAdmin() });

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <>
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-6 text-3xl font-extrabold">حساب کاربری</h1>
        <div className="rounded-2xl border border-white/10 bg-card/40 p-6">
          <p className="text-sm text-muted-foreground">ایمیل</p>
          <p className="mb-6 text-lg font-medium">{user.email}</p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/orders"><ShoppingBag className="ms-2 h-4 w-4" /> سفارش‌های من</Link>
            </Button>
            {data?.isAdmin && (
              <Button variant="outline" asChild>
                <Link to="/admin"><Shield className="ms-2 h-4 w-4" /> پنل ادمین</Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link to="/shop"><Package className="ms-2 h-4 w-4" /> مشاهده فروشگاه</Link>
            </Button>
            <Button variant="ghost" onClick={signOut}>
              <LogOut className="ms-2 h-4 w-4" /> خروج
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
