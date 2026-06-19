import { Link } from "@tanstack/react-router";
import { toFa } from "@/lib/fa";
import logoFull from "@/assets/logo-full.png.asset.json";


const COLS: { t: string; l: { label: string; to: string }[] }[] = [
  {
    t: "فروشگاه",
    l: [
      { label: "همه محصولات", to: "/shop" },
      { label: "پیشنهاد ویژه", to: "/shop?sort=price_asc" },
      { label: "سبد خرید", to: "/cart" },
      { label: "حساب کاربری", to: "/account" },
    ],
  },
  {
    t: "پشتیبانی",
    l: [
      { label: "تماس با ما", to: "/contact" },
      { label: "سؤالات متداول", to: "/faq" },
      { label: "روش‌های ارسال", to: "/shipping" },
      { label: "بازگشت کالا", to: "/returns" },
    ],
  },
  {
    t: "پارت‌بازار",
    l: [
      { label: "درباره ما", to: "/about" },
      { label: "حریم خصوصی", to: "/privacy" },
      { label: "فروشگاه", to: "/shop" },
      { label: "خانه", to: "/" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 glass">
      <div className="container mx-auto grid grid-cols-1 gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center">
            <img src={logoFull.url} alt="پارت‌بازار" className="h-12 w-auto" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">مرجع تخصصی قطعات یدکی خودرو در ایران.</p>
        </div>

        {COLS.map((col) => (
          <div key={col.t}>
            <h4 className="mb-4 text-sm font-bold">{col.t}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {col.l.map((i) => (
                <li key={i.to + i.label}>
                  <Link to={i.to} className="transition-colors hover:text-foreground">
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-muted-foreground">
        © {toFa(1404)} پارت‌بازار — تمامی حقوق محفوظ است.
      </div>
    </footer>
  );
}
