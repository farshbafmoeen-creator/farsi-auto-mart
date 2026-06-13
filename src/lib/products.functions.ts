import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getProducts = createServerFn({ method: "GET" })
  .inputValidator((input: { featured?: boolean; categorySlug?: string; limit?: number } | undefined) =>
    z
      .object({
        featured: z.boolean().optional(),
        categorySlug: z.string().optional(),
        limit: z.number().int().min(1).max(100).optional(),
      })
      .optional()
      .parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("products")
      .select("id,title_fa,slug,price,compare_at_price,stock,brand,images,is_featured,category_id,categories!inner(slug,name_fa)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (data?.featured) q = q.eq("is_featured", true);
    if (data?.categorySlug) q = q.eq("categories.slug", data.categorySlug);
    if (data?.limit) q = q.limit(data.limit);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
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
