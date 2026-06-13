import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { Search, SlidersHorizontal, ArrowLeft, X } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { ProductCard } from "@/components/shop/ProductCard";
import { getProducts, getCategories } from "@/lib/products.functions";
import { toFa, formatToman } from "@/lib/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE = 24;

const shopQuery = (search: ShopSearch) =>
  queryOptions({
    queryKey: ["shop", search],
    queryFn: async () => {
      const offset = ((search.page ?? 1) - 1) * PAGE_SIZE;
      const [products, categories] = await Promise.all([
        getProducts({
          data: {
            search: search.q || undefined,
            categorySlug: search.category || undefined,
            sort: search.sort || "newest",
            limit: PAGE_SIZE,
            offset,
          },
        }),
        getCategories(),
      ]);
      return { products, categories };
    },
  });

type ShopSearch = {
  q?: string;
  category?: string;
  sort?: "newest" | "price_asc" | "price_desc";
  page?: number;
};

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "فروشگاه | پارت‌بازار" },
      { name: "description", content: "مشاهده و خرید قطعات اصلی خودرو با فیلتر پیشرفته و قیمت منصفانه." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    q: typeof search.q === "string" ? search.q : undefined,
    category: typeof search.category === "string" ? search.category : undefined,
    sort: ["newest", "price_asc", "price_desc"].includes(search.sort as string) ? (search.sort as ShopSearch["sort"]) : "newest",
    page: typeof search.page === "number" ? Math.max(1, search.page) : 1,
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(shopQuery(deps)),
  component: ShopPage,
});

function ShopPage() {
  const navigate = useNavigate({ from: "/shop" });
  const search = Route.useSearch();
  const { data } = useSuspenseQuery(shopQuery(search));

  const [localQ, setLocalQ] = useState(search.q ?? "");

  const applySearch = useCallback(() => {
    navigate({ search: (prev: ShopSearch) => ({ ...prev, q: localQ || undefined, page: 1 }) });
  }, [localQ, navigate]);

  const clearFilters = useCallback(() => {
    setLocalQ("");
    navigate({ search: { sort: search.sort } });
  }, [navigate, search.sort]);

  const totalPages = Math.max(1, Math.ceil((data.products.count ?? 0) / PAGE_SIZE));

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 pt-8 pb-16">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-black md:text-3xl">فروشگاه قطعات</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {toFa(data.products.count ?? 0)} محصول یافت شد
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={search.sort ?? "newest"}
              onValueChange={(v) =>
                navigate({ search: (prev: ShopSearch) => ({ ...prev, sort: v as ShopSearch["sort"], page: 1 }) })
              }
            >
              <SelectTrigger className="w-44 glass">
                <SlidersHorizontal className="h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">جدیدترین</SelectItem>
                <SelectItem value="price_asc">ارزان‌ترین</SelectItem>
                <SelectItem value="price_desc">گران‌ترین</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
          {/* Sidebar Filters */}
          <aside className="space-y-6">
            <div className="rounded-2xl glass p-4">
              <label className="mb-2 block text-sm font-bold">جستجو</label>
              <div className="flex gap-2">
                <Input
                  value={localQ}
                  onChange={(e) => setLocalQ(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applySearch()}
                  placeholder="نام قطعه یا برند..."
                  className="glass bg-white/5"
                />
                <Button size="icon" onClick={applySearch} className="shrink-0">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-2xl glass p-4">
              <label className="mb-3 block text-sm font-bold">دسته‌بندی</label>
              <div className="space-y-1">
                <button
                  onClick={() => navigate({ search: (prev) => ({ ...prev, category: undefined, page: 1 }) })}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
                    !search.category ? "bg-primary/15 text-primary font-bold" : "hover:bg-white/5"
                  }`}
                >
                  همه
                </button>
                {data.categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() =>
                      navigate({ search: (prev) => ({ ...prev, category: c.slug, page: 1 }) })
                    }
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
                      search.category === c.slug ? "bg-primary/15 text-primary font-bold" : "hover:bg-white/5"
                    }`}
                  >
                    <span>{c.icon ?? "🔩"}</span>
                    {c.name_fa}
                  </button>
                ))}
              </div>
            </div>

            {(search.q || search.category) && (
              <Button variant="outline" onClick={clearFilters} className="w-full gap-2">
                <X className="h-4 w-4" />
                پاک کردن فیلترها
              </Button>
            )}
          </aside>

          {/* Product Grid */}
          <div>
            {data.products.rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl glass-strong p-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-bold">محصولی یافت نشد</h3>
                <p className="mt-2 text-sm text-muted-foreground">با فیلترهای دیگر امتحان کنید.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                  {data.products.rows.map((p) => (
                    <ProductCard
                      key={p.id}
                      productId={p.id}
                      title_fa={p.title_fa}
                      brand={p.brand}
                      price={Number(p.price)}
                      compare_at_price={p.compare_at_price ? Number(p.compare_at_price) : null}
                      images={p.images}
                      slug={p.slug}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={search.page === 1}
                      onClick={() =>
                        navigate({ search: (prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }) })
                      }
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      صفحه {toFa(search.page ?? 1)} از {toFa(totalPages)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={search.page >= totalPages}
                      onClick={() =>
                        navigate({ search: (prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }) })
                      }
                    >
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
