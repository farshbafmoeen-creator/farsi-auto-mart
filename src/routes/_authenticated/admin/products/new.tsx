import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { adminCreateProduct } from "@/lib/admin.functions";
import { getCategories } from "@/lib/products.functions";
import { ProductForm } from "@/components/admin/ProductForm";

export const Route = createFileRoute("/_authenticated/admin/products/new")({
  component: NewProductPage,
});

function NewProductPage() {
  const navigate = useNavigate();
  const createFn = useServerFn(adminCreateProduct);
  const catFn = useServerFn(getCategories);
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: () => catFn() });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold">محصول جدید</h1>
      <ProductForm
        categories={categories ?? []}
        onSubmit={async (values) => {
          await createFn({ data: values });
          navigate({ to: "/admin/products" });
        }}
      />
    </div>
  );
}
