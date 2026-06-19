import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingCart, Search, User, Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useCart } from "@/lib/cart-context";
import { toFa } from "@/lib/fa";
import { getCategories, getCarMakes } from "@/lib/products.functions";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import logoFull from "@/assets/logo-full.png.asset.json";



export function Header() {
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [q, setQ] = useState("");

  const getCats = useServerFn(getCategories);
  const getMakes = useServerFn(getCarMakes);
  const { data: categories } = useQuery({ queryKey: ["nav-categories"], queryFn: () => getCats() });
  const { data: makes } = useQuery({ queryKey: ["nav-makes"], queryFn: () => getMakes() });

  // close mega on escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMegaOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submitSearch = () => {
    const term = q.trim();
    setSearchOpen(false);
    setQ("");
    navigate({ to: "/shop", search: { q: term || undefined, sort: "newest", page: 1 } });
  };

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

          <nav className="hidden items-center gap-1 text-sm md:flex">
            <Link to="/" className="rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground">
              خانه
            </Link>
            <Link to="/shop" className="rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground">
              فروشگاه
            </Link>

            {/* Mega menu */}
            <div className="relative" onMouseLeave={() => setMegaOpen(false)}>
              <button
                onMouseEnter={() => setMegaOpen(true)}
                onClick={() => setMegaOpen((s) => !s)}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                دسته‌بندی‌ها
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${megaOpen ? "rotate-180" : ""}`} />
              </button>
              {megaOpen && (
                <div className="absolute right-0 top-full pt-2">
                  <div className="w-[640px] rounded-2xl border border-white/10 bg-card/95 p-6 shadow-2xl backdrop-blur-xl">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="mb-3 text-xs font-bold uppercase text-muted-foreground">دسته‌ی قطعه</h4>
                        <ul className="space-y-1">
                          {(categories ?? []).map((c) => (
                            <li key={c.id}>
                              <Link
                                to="/shop"
                                search={{ category: c.slug, sort: "newest", page: 1 }}
                                onClick={() => setMegaOpen(false)}
                                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
                              >
                                <span>{c.icon ?? "🔩"}</span>
                                {c.name_fa}
                              </Link>
                            </li>
                          ))}
                          {(categories?.length ?? 0) === 0 && (
                            <li className="px-2 py-1.5 text-xs text-muted-foreground">دسته‌ای موجود نیست</li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <h4 className="mb-3 text-xs font-bold uppercase text-muted-foreground">برند خودرو</h4>
                        <ul className="grid grid-cols-2 gap-1">
                          {(makes ?? []).slice(0, 12).map((m) => (
                            <li key={m.id}>
                              <Link
                                to="/shop"
                                search={{ q: m.name_fa, sort: "newest", page: 1 }}
                                onClick={() => setMegaOpen(false)}
                                className="block rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
                              >
                                {m.name_fa}
                              </Link>
                            </li>
                          ))}
                          {(makes?.length ?? 0) === 0 && (
                            <li className="col-span-2 px-2 py-1.5 text-xs text-muted-foreground">برندی موجود نیست</li>
                          )}
                        </ul>
                      </div>
                    </div>
                    <div className="mt-5 border-t border-white/10 pt-4">
                      <Link
                        to="/shop"
                        onClick={() => setMegaOpen(false)}
                        className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
                      >
                        مشاهده‌ی همه‌ی محصولات
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link to="/about" className="rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground">
              درباره ما
            </Link>
            <Link to="/contact" className="rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground">
              تماس
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Search dialog */}
          <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
            <DialogTrigger asChild>
              <button className="grid h-10 w-10 place-items-center rounded-xl glass transition hover:bg-white/10" aria-label="جستجو">
                <Search className="h-4 w-4" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>جستجوی محصول</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitSearch();
                }}
                className="flex gap-2"
              >
                <Input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="نام قطعه، برند یا کد محصول…"
                />
                <Button type="submit">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              <p className="text-xs text-muted-foreground">با Enter جستجو می‌شود.</p>
            </DialogContent>
          </Dialog>

          <Link to="/account" className="hidden h-10 w-10 place-items-center rounded-xl glass transition hover:bg-white/10 md:grid" aria-label="حساب کاربری">
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

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="grid h-10 w-10 place-items-center rounded-xl glass md:hidden" aria-label="منو">
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[340px]">
              <SheetHeader>
                <SheetTitle>منو</SheetTitle>
              </SheetHeader>
              <nav className="mt-4 flex flex-col gap-1 text-sm">
                <MobileLink to="/" onClick={() => setMobileOpen(false)}>خانه</MobileLink>
                <MobileLink to="/shop" onClick={() => setMobileOpen(false)}>فروشگاه</MobileLink>
                <Accordion type="single" collapsible>
                  <AccordionItem value="cats" className="border-b-0">
                    <AccordionTrigger className="rounded-lg px-3 py-2 hover:bg-white/5 hover:no-underline">دسته‌ها</AccordionTrigger>
                    <AccordionContent className="pb-0">
                      <ul className="space-y-0.5 ps-2">
                        {(categories ?? []).map((c) => (
                          <li key={c.id}>
                            <Link
                              to="/shop"
                              search={{ category: c.slug, sort: "newest", page: 1 }}
                              onClick={() => setMobileOpen(false)}
                              className="block rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
                            >
                              {c.icon ?? "🔩"} {c.name_fa}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="makes" className="border-b-0">
                    <AccordionTrigger className="rounded-lg px-3 py-2 hover:bg-white/5 hover:no-underline">برندهای خودرو</AccordionTrigger>
                    <AccordionContent className="pb-0">
                      <ul className="grid grid-cols-2 gap-0.5 ps-2">
                        {(makes ?? []).map((m) => (
                          <li key={m.id}>
                            <Link
                              to="/shop"
                              search={{ q: m.name_fa, sort: "newest", page: 1 }}
                              onClick={() => setMobileOpen(false)}
                              className="block rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
                            >
                              {m.name_fa}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <MobileLink to="/about" onClick={() => setMobileOpen(false)}>درباره ما</MobileLink>
                <MobileLink to="/contact" onClick={() => setMobileOpen(false)}>تماس با ما</MobileLink>
                <MobileLink to="/faq" onClick={() => setMobileOpen(false)}>سؤالات متداول</MobileLink>
                <MobileLink to="/shipping" onClick={() => setMobileOpen(false)}>روش‌های ارسال</MobileLink>
                <div className="mt-2 border-t border-white/10 pt-2">
                  <MobileLink to="/account" onClick={() => setMobileOpen(false)}>حساب کاربری</MobileLink>
                  <MobileLink to="/cart" onClick={() => setMobileOpen(false)}>سبد خرید</MobileLink>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function MobileLink({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="rounded-lg px-3 py-2 text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
    >
      {children}
    </Link>
  );
}
