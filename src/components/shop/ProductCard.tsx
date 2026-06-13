import { formatToman } from "@/lib/fa";
import { ShoppingCart } from "lucide-react";

type Props = {
  title_fa: string;
  brand: string | null;
  price: number;
  compare_at_price: number | null;
  images: string[];
  slug: string;
};

export function ProductCard({ title_fa, brand, price, compare_at_price, images }: Props) {
  const discount = compare_at_price ? Math.round(((compare_at_price - price) / compare_at_price) * 100) : 0;
  return (
    <article className="group relative overflow-hidden rounded-2xl glass transition-all duration-500 hover:-translate-y-1 hover:shadow-elegant hover:border-white/25">
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-white/5 to-transparent">
        <img
          src={images[0] ?? "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600"}
          alt={title_fa}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {discount > 0 && (
          <span className="absolute top-3 right-3 rounded-lg bg-primary px-2 py-1 text-xs font-bold text-primary-foreground glow-primary">
            {formatToman(discount)}٪ تخفیف
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 z-10 flex h-28 translate-y-full flex-col justify-end bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-all duration-500 group-hover:translate-y-0">
          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-lg transition hover:bg-primary/90 hover:scale-[1.02] active:scale-95">
            <ShoppingCart className="h-4 w-4" />
            افزودن به سبد
          </button>
        </div>
      </div>
      <div className="space-y-2 p-4">
        {brand && <p className="text-xs text-muted-foreground">{brand}</p>}
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-relaxed">{title_fa}</h3>
        <div className="flex items-baseline justify-between gap-2 pt-1">
          <div>
            {compare_at_price && (
              <span className="block text-xs text-muted-foreground line-through">{formatToman(compare_at_price)}</span>
            )}
            <span className="text-base font-extrabold gradient-text">{formatToman(price)}</span>
            <span className="mr-1 text-[10px] text-muted-foreground">تومان</span>
          </div>
        </div>
      </div>
    </article>
  );
}
