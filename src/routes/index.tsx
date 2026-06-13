import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Shield, Truck, Headphones, Sparkles, ChevronDown, Search } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { ProductCard } from "@/components/shop/ProductCard";
import { getProducts, getCategories, getCarMakes } from "@/lib/products.functions";
import { toFa, formatToman } from "@/lib/fa";
import heroImage from "@/assets/hero-engine.jpg";

const homeQuery = queryOptions({
  queryKey: ["home-data"],
  queryFn: async () => {
    const [featured, all, categories, makes] = await Promise.all([
      getProducts({ data: { featured: true, limit: 8 } }),
      getProducts({ data: { limit: 12 } }),
      getCategories(),
      getCarMakes(),
    ]);
    return { featured: featured.rows, all: all.rows, categories, makes };
  },
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "پارت‌بازار | فروشگاه آنلاین قطعات خودرو" },
      { name: "description", content: "خرید قطعات اصلی خودرو با تضمین اصالت، قیمت منصفانه و ارسال سریع به سراسر ایران." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery),
  component: HomePage,
});

const CATEGORY_ICONS: Record<string, string> = {
  brake: "🛞", filters: "🌀", oil: "🛢️", electrical: "⚡",
  battery: "🔋", tires: "⚫", suspension: "🔧", engine: "⚙️",
};

function HomePage() {
  const { data } = useSuspenseQuery(homeQuery);
  return (
    <div className="min-h-screen">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroImage} alt="" className="h-full w-full object-cover opacity-50" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        </div>

        <div className="container mx-auto px-4 pt-20 pb-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-muted-foreground animate-fade-up">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>بیش از {toFa(50000)} قطعه اصلی موجود</span>
          </div>

          <h1 className="mt-6 text-5xl font-black leading-tight tracking-tight md:text-7xl animate-fade-up" style={{ animationDelay: "0.1s" }}>
            قطعات اصلی خودرو
            <br />
            <span className="gradient-text">بدون واسطه</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground md:text-lg animate-fade-up" style={{ animationDelay: "0.2s" }}>
            بزرگ‌ترین مرجع آنلاین قطعات یدکی ایران. تضمین اصالت، قیمت کارخانه، ارسال سریع.
          </p>

          {/* Glass car selector */}
          <div className="mx-auto mt-10 max-w-3xl rounded-3xl glass-strong p-2 shadow-elegant animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto]">
              <div className="relative">
                <select className="w-full appearance-none rounded-2xl bg-white/5 px-4 py-4 text-right text-sm outline-none focus:bg-white/10">
                  <option>برند خودرو را انتخاب کنید</option>
                  {data.makes.map((m) => <option key={m.id} value={m.slug}>{m.name_fa}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <div className="relative">
                <input placeholder="نام قطعه، برند یا کد فنی" className="w-full rounded-2xl bg-white/5 px-4 py-4 text-right text-sm outline-none placeholder:text-muted-foreground focus:bg-white/10" />
              </div>
              <button className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-[oklch(0.75_0.20_45)] px-6 py-4 text-sm font-bold text-primary-foreground glow-primary transition hover:scale-105">
                <Search className="h-4 w-4" />
                جستجو
              </button>
            </div>
          </div>

          {/* Trust strip */}
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            {[
              { icon: Shield, title: "تضمین اصالت", desc: "همه قطعات اورجینال" },
              { icon: Truck, title: "ارسال سریع", desc: "تحویل ۲۴ تا ۷۲ ساعت" },
              { icon: Headphones, title: "پشتیبانی ۲۴/۷", desc: "مشاوره تخصصی" },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-3 rounded-2xl glass p-4 text-right">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-black md:text-4xl">دسته‌بندی محصولات</h2>
            <p className="mt-2 text-sm text-muted-foreground">هر چیزی که برای خودرویتان نیاز دارید</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {data.categories.map((c, i) => (
            <button
              key={c.id}
              className="group flex flex-col items-center gap-3 rounded-2xl glass p-5 text-center transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant animate-fade-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 to-transparent text-3xl transition-transform group-hover:scale-110">
                {CATEGORY_ICONS[c.slug] ?? "🔩"}
              </div>
              <span className="text-xs font-bold">{c.name_fa}</span>
            </button>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section id="shop" className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-black md:text-4xl">پیشنهاد ویژه</h2>
            <p className="mt-2 text-sm text-muted-foreground">پرفروش‌ترین قطعات با بهترین قیمت</p>
          </div>
          <a href="#all" className="hidden items-center gap-1 text-sm text-primary hover:underline sm:flex">
            مشاهده همه <ArrowLeft className="h-4 w-4" />
          </a>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {data.featured.map((p) => (
            <ProductCard
              key={p.id}
              title_fa={p.title_fa}
              brand={p.brand}
              price={Number(p.price)}
              compare_at_price={p.compare_at_price ? Number(p.compare_at_price) : null}
              images={p.images}
              slug={p.slug}
            />
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 gap-4 rounded-3xl glass-strong p-8 md:grid-cols-4 md:p-12">
          {[
            { n: 50000, label: "قطعه موجود" },
            { n: 120, label: "برند معتبر" },
            { n: 25000, label: "مشتری راضی" },
            { n: 31, label: "استان تحت پوشش" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-black gradient-text md:text-5xl">+{formatToman(s.n)}</div>
              <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ALL PRODUCTS */}
      <section id="all" className="container mx-auto px-4 py-16">
        <h2 className="mb-8 text-3xl font-black md:text-4xl">جدیدترین محصولات</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {data.all.map((p) => (
            <ProductCard
              key={p.id}
              title_fa={p.title_fa}
              brand={p.brand}
              price={Number(p.price)}
              compare_at_price={p.compare_at_price ? Number(p.compare_at_price) : null}
              images={p.images}
              slug={p.slug}
            />
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer id="about" className="mt-16 border-t border-white/10 glass">
        <div className="container mx-auto grid grid-cols-1 gap-8 px-4 py-12 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-[oklch(0.75_0.20_45)]">
                <span className="text-lg font-black text-primary-foreground">پ</span>
              </div>
              <span className="text-lg font-extrabold">پارت‌بازار</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">مرجع تخصصی قطعات یدکی خودرو در ایران.</p>
          </div>
          {[
            { t: "فروشگاه", l: ["محصولات", "دسته‌بندی‌ها", "برندها", "پیشنهاد ویژه"] },
            { t: "پشتیبانی", l: ["تماس با ما", "سؤالات متداول", "روش‌های ارسال", "بازگشت کالا"] },
            { t: "پارت‌بازار", l: ["درباره ما", "وبلاگ", "همکاری با ما", "حریم خصوصی"] },
          ].map((col) => (
            <div key={col.t}>
              <h4 className="mb-4 text-sm font-bold">{col.t}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {col.l.map((i) => <li key={i}><a className="hover:text-foreground">{i}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 py-6 text-center text-xs text-muted-foreground">
          © {toFa(1404)} پارت‌بازار — تمامی حقوق محفوظ است.
        </div>
      </footer>
    </div>
  );
}
