import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { adminGetProduct, adminUpdateProduct } from "@/lib/admin.functions";
import { getCategories } from "@/lib/products.functions";
import { ProductForm } from "@/components/admin/ProductForm";

export const Route = createFileRoute("/_authenticated/admin/products/$id")({
  component: EditProductPage,
});

function EditProductPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const getFn = useServerFn(adminGetProduct);
  const updateFn = useServerFn(adminUpdateProduct);
  const catFn = useServerFn(getCategories);

  const { data: product, isLoading } = useQuery({ queryKey: ["adminProduct", id], queryFn: () => getFn({ data: { id } }) });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: () => catFn() });

  if (isLoading) return <div className="py-10 text-center text-muted-foreground">در حال بارگذاری…</div>;
  if (!product) return <div className="py-10 text-center text-muted-foreground">محصول پیدا نشد.</div>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold">ویرایش محصول</h1>
      <ProductForm
        categories={categories ?? []}
        initial={product}
        onSubmit={async (values) => {
          await updateFn({ data: { id, ...values } });
          navigate({ to: "/admin/products" });
        }}
      />
    </div>
  );
}
