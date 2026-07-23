import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ShoppingCart, Check, ChevronLeft, ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/shop/ProductCard";
import { getProductBySlug, getRelatedProducts } from "@/lib/products.functions";
import { useCart } from "@/lib/cart-context";
import { formatToman } from "@/lib/fa";

const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async () => {
      const product = await getProductBySlug({ data: { slug } });
      if (!product) throw notFound();
      const related = await getRelatedProducts({
        data: { categoryId: product.category_id, excludeSlug: slug, limit: 4 },
      });
      return { product, related };
    },
  });

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `جزئیات محصول | پارت‌بازار` },
      { name: "description", content: `مشخصات و خرید آنلاین قطعه خودرو.` },
    ],
  }),
  loader: ({ context, params }) => context.queryClient.ensureQueryData(productQuery(params.slug)),
  component: ProductPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-xl font-bold">محصول پیدا نشد</h1>
        <Link to="/shop" className="mt-4 inline-flex items-center gap-1 text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> بازگشت به فروشگاه
        </Link>
      </div>
    </div>
  ),
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(productQuery(slug));
  const { product, related } = data;
  const { addItem } = useCart();

  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      title_fa: product.title_fa,
      brand: product.brand,
      price: Number(product.price),
      image: product.images[0] ?? "",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const specs = product.specs as Record<string, string> | null;

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 pt-8 pb-16">
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/shop" className="hover:text-foreground">فروشگاه</Link>
          <ChevronLeft className="h-3 w-3" />
          <span className="text-foreground">{product.title_fa}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-3xl glass">
              <img
                src={product.images[activeImage] ?? ""}
                alt={product.title_fa}
                className="h-full w-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`h-20 w-20 overflow-hidden rounded-xl border-2 transition ${
                      i === activeImage ? "border-primary" : "border-transparent glass"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {product.brand && (
              <span className="text-sm font-medium text-muted-foreground">{product.brand}</span>
            )}
            <h1 className="mt-2 text-2xl font-black md:text-3xl">{product.title_fa}</h1>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-3xl font-black gradient-text">{formatToman(Number(product.price))}</span>
              <span className="text-sm text-muted-foreground">تومان</span>
              {product.compare_at_price && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatToman(Number(product.compare_at_price))}
                </span>
              )}
              {discount > 0 && (
                <span className="rounded-lg bg-primary/15 px-2 py-1 text-sm font-bold text-primary">
                  {formatToman(discount)}٪ تخفیف
                </span>
              )}
            </div>

            <p className="mt-6 text-sm leading-7 text-muted-foreground">
              {product.description_fa ?? "بدون توضیحات"}
            </p>

            {specs && Object.keys(specs).length > 0 && (
              <div className="mt-8 rounded-2xl glass p-5">
                <h3 className="mb-4 text-sm font-bold">مشخصات فنی</h3>
                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between rounded-xl bg-accent/50 px-3 py-2">
                      <dt className="text-xs text-muted-foreground">{key}</dt>
                      <dd className="text-sm font-bold">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <div className="mt-auto pt-8">
              <button
                onClick={handleAddToCart}
                disabled={added}
                className={`flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 text-base font-bold text-primary-foreground transition-all ${
                  added
                    ? "bg-green-600"
                    : "bg-gradient-to-r from-primary to-[oklch(0.75_0.20_45)] glow-primary hover:scale-[1.02] active:scale-95"
                }`}
              >
                {added ? (
                  <>
                    <Check className="h-5 w-5" />
                    به سبد اضافه شد
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    افزودن به سبد خرید
                  </>
                )}
              </button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                موجودی: {formatToman(product.stock)} عدد
              </p>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-2xl font-black">محصولات مشابه</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {related.map((p) => (
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
          </section>
        )}
      </div>
      <Footer />
    </div>
  );
}
