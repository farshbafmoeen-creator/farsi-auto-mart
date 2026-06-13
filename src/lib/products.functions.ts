import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getProducts = createServerFn({ method: "GET" })
  .inputValidator((input: { featured?: boolean; categorySlug?: string; limit?: number; search?: string; minPrice?: number; maxPrice?: number; sort?: string; offset?: number } | undefined) =>
    z
      .object({
        featured: z.boolean().optional(),
        categorySlug: z.string().optional(),
        limit: z.number().int().min(1).max(100).optional(),
        search: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        sort: z.enum(["newest", "price_asc", "price_desc"]).optional(),
        offset: z.number().int().min(0).optional(),
      })
      .optional()
      .parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("products")
      .select("id,title_fa,slug,price,compare_at_price,stock,brand,images,is_featured,category_id,categories!inner(slug,name_fa)", { count: "exact" })
      .eq("is_active", true);

    if (data?.search) {
      q = q.or(`title_fa.ilike.%${data.search}%,brand.ilike.%${data.search}%,sku.ilike.%${data.search}%`);
    }
    if (data?.categorySlug) q = q.eq("categories.slug", data.categorySlug);
    if (data?.minPrice !== undefined) q = q.gte("price", data.minPrice);
    if (data?.maxPrice !== undefined) q = q.lte("price", data.maxPrice);

    const sort = data?.sort ?? "newest";
    if (sort === "price_asc") q = q.order("price", { ascending: true });
    else if (sort === "price_desc") q = q.order("price", { ascending: false });
    else q = q.order("created_at", { ascending: false });

    const limit = data?.limit ?? 24;
    const offset = data?.offset ?? 0;
    q = q.range(offset, offset + limit - 1);

    const { data: rows, error, count } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [], count: count ?? 0 };
  });

export const getCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("id,name_fa,slug,icon,sort_order")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getCarMakes = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("car_makes")
    .select("id,name_fa,slug,car_models(id,name_fa,slug)")
    .order("name_fa");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => z.object({ slug: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("products")
      .select("*,categories(name_fa,slug)")
      .eq("slug", data.slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const getRelatedProducts = createServerFn({ method: "GET" })
  .inputValidator((input: { categoryId: string | null; excludeSlug: string; limit?: number }) =>
    z.object({ categoryId: z.string().uuid().nullable(), excludeSlug: z.string(), limit: z.number().int().min(1).max(12).optional() }).parse(input)
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("products")
      .select("id,title_fa,slug,price,compare_at_price,stock,brand,images")
      .eq("is_active", true)
      .neq("slug", data.excludeSlug)
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 4);
    if (data.categoryId) {
      q = q.eq("category_id", data.categoryId);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
