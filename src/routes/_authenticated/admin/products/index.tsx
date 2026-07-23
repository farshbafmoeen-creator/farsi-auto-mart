import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminListProducts, adminDeleteProduct } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { formatToman, toFa } from "@/lib/fa";

export const Route = createFileRoute("/_authenticated/admin/products/")({
  component: AdminProductsPage,
});

function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const listFn = useServerFn(adminListProducts);
  const delFn = useServerFn(adminDeleteProduct);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["adminProducts", q],
    queryFn: () => listFn({ data: { search: q || undefined, limit: 50 } }),
  });

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`حذف «${title}»؟`)) return;
    await delFn({ data: { id } });
    qc.invalidateQueries({ queryKey: ["adminProducts"] });
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">محصولات {data && <span className="text-sm font-normal text-muted-foreground">({toFa(data.count)})</span>}</h1>
        <Button asChild>
          <Link to="/admin/products/new"><Plus className="ms-2 h-4 w-4" /> محصول جدید</Link>
        </Button>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); setQ(search); }}
        className="mb-4 flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجو در عنوان، برند یا کد محصول…" className="pe-10" />
        </div>
        <Button type="submit" variant="secondary">جستجو</Button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-border bg-card/40">
        <table className="w-full text-sm">
          <thead className="bg-accent/50 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-right">محصول</th>
              <th className="px-4 py-3 text-right">برند</th>
              <th className="px-4 py-3 text-right">قیمت</th>
              <th className="px-4 py-3 text-right">موجودی</th>
              <th className="px-4 py-3 text-right">وضعیت</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">در حال بارگذاری…</td></tr>
            )}
            {!isLoading && (data?.rows.length ?? 0) === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">محصولی پیدا نشد.</td></tr>
            )}
            {data?.rows.map((p: any) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-lg bg-accent/50">
                      {p.images?.[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div>
                      <div className="font-medium">{p.title_fa}</div>
                      <div className="text-xs text-muted-foreground">{p.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.brand ?? "—"}</td>
                <td className="px-4 py-3">{formatToman(p.price)}</td>
                <td className="px-4 py-3">{toFa(p.stock)}</td>
                <td className="px-4 py-3">
                  {p.is_active ? (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300">فعال</span>
                  ) : (
                    <span className="rounded-full bg-accent/50 px-2 py-0.5 text-xs text-muted-foreground">غیرفعال</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link to="/admin/products/$id" params={{ id: p.id }} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-accent" aria-label="ویرایش">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button onClick={() => handleDelete(p.id, p.title_fa)} className="grid h-8 w-8 place-items-center rounded-lg text-red-400 hover:bg-red-500/10" aria-label="حذف">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
