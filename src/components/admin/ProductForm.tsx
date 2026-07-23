import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/admin/ImageUpload";

export type ProductFormValues = {
  title_fa: string;
  slug: string;
  description_fa: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  brand: string | null;
  sku: string | null;
  category_id: string | null;
  images: string[];
  is_featured: boolean;
  is_active: boolean;
};

export function ProductForm({
  initial,
  categories,
  onSubmit,
}: {
  initial?: any;
  categories: { id: string; name_fa: string }[];
  onSubmit: (values: ProductFormValues) => Promise<void>;
}) {
  const [v, setV] = useState<ProductFormValues>({
    title_fa: initial?.title_fa ?? "",
    slug: initial?.slug ?? "",
    description_fa: initial?.description_fa ?? "",
    price: initial?.price ?? 0,
    compare_at_price: initial?.compare_at_price ?? null,
    stock: initial?.stock ?? 0,
    brand: initial?.brand ?? "",
    sku: initial?.sku ?? "",
    category_id: initial?.category_id ?? null,
    images: initial?.images ?? [],
    is_featured: initial?.is_featured ?? false,
    is_active: initial?.is_active ?? true,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof ProductFormValues>(k: K, val: ProductFormValues[K]) => setV((s) => ({ ...s, [k]: val }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit({
        ...v,
        description_fa: v.description_fa || null,
        brand: v.brand || null,
        sku: v.sku || null,
        category_id: v.category_id || null,
        compare_at_price: v.compare_at_price || null,
      });
    } catch (err: any) {
      setError(err?.message ?? "خطایی رخ داد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="rounded-2xl border border-border bg-card/40 p-5">
        <h2 className="mb-4 font-bold">اطلاعات اصلی</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="عنوان فارسی" required>
            <Input value={v.title_fa} onChange={(e) => set("title_fa", e.target.value)} required />
          </Field>
          <Field label="اسلاگ (URL)" required hint="حروف کوچک انگلیسی، اعداد و خط تیره">
            <Input value={v.slug} onChange={(e) => set("slug", e.target.value)} required dir="ltr" />
          </Field>
          <Field label="برند">
            <Input value={v.brand ?? ""} onChange={(e) => set("brand", e.target.value)} />
          </Field>
          <Field label="کد محصول (SKU)">
            <Input value={v.sku ?? ""} onChange={(e) => set("sku", e.target.value)} dir="ltr" />
          </Field>
          <Field label="دسته‌بندی">
            <select
              value={v.category_id ?? ""}
              onChange={(e) => set("category_id", e.target.value || null)}
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="">— بدون دسته —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name_fa}</option>
              ))}
            </select>
          </Field>
          <Field label="توضیحات">
            <textarea
              value={v.description_fa ?? ""}
              onChange={(e) => set("description_fa", e.target.value)}
              rows={4}
              className="w-full rounded-md border border-border bg-background p-3 text-sm"
            />
          </Field>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card/40 p-5">
        <h2 className="mb-4 font-bold">قیمت و موجودی</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="قیمت (تومان)" required>
            <Input type="number" min={0} value={v.price} onChange={(e) => set("price", Number(e.target.value))} required dir="ltr" />
          </Field>
          <Field label="قیمت قبل تخفیف">
            <Input type="number" min={0} value={v.compare_at_price ?? ""} onChange={(e) => set("compare_at_price", e.target.value ? Number(e.target.value) : null)} dir="ltr" />
          </Field>
          <Field label="موجودی" required>
            <Input type="number" min={0} value={v.stock} onChange={(e) => set("stock", Number(e.target.value))} required dir="ltr" />
          </Field>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card/40 p-5">
        <h2 className="mb-4 font-bold">تصاویر</h2>
        <ImageUpload value={v.images} onChange={(imgs) => set("images", imgs)} />
      </div>

      <div className="rounded-2xl border border-border bg-card/40 p-5">
        <h2 className="mb-4 font-bold">وضعیت</h2>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={v.is_active} onChange={(e) => set("is_active", e.target.checked)} />
            فعال (در فروشگاه نمایش داده شود)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={v.is_featured} onChange={(e) => set("is_featured", e.target.checked)} />
            محصول ویژه
          </label>
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "در حال ذخیره…" : "ذخیره"}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-muted-foreground">
        {label} {required && <span className="text-red-400">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}
