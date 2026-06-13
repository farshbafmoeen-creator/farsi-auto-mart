import { Link } from "@tanstack/react-router";
import { ShoppingCart, Search, User, Menu } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { toFa } from "@/lib/fa";

export function Header() {
  const { totalItems } = useCart();
  return (
    <header className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-[oklch(0.75_0.20_45)] glow-primary">
              <span className="text-lg font-black text-primary-foreground">پ</span>
            </div>
            <span className="text-lg font-extrabold tracking-tight">پارت‌بازار</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link to="/" className="text-muted-foreground transition-colors hover:text-foreground">خانه</Link>
            <Link to="/shop" className="text-muted-foreground transition-colors hover:text-foreground">فروشگاه</Link>
            <a href="/" className="text-muted-foreground transition-colors hover:text-foreground">دسته‌بندی‌ها</a>
            <a href="/" className="text-muted-foreground transition-colors hover:text-foreground">درباره ما</a>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button className="grid h-10 w-10 place-items-center rounded-xl glass transition hover:bg-white/10" aria-label="جستجو">
            <Search className="h-4 w-4" />
          </button>
          <Link to="/auth" className="grid h-10 w-10 place-items-center rounded-xl glass transition hover:bg-white/10" aria-label="حساب کاربری">
            <User className="h-4 w-4" />
          </Link>
          <Link to="/cart" className="relative grid h-10 w-10 place-items-center rounded-xl glass transition hover:bg-white/10" aria-label="سبد خرید">
            <ShoppingCart className="h-4 w-4" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -left-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {toFa(totalItems)}
              </span>
            )}
          </Link>
          <button className="grid h-10 w-10 place-items-center rounded-xl glass md:hidden" aria-label="منو">
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
