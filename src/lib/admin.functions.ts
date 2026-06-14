import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin only");
}

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) throw new Error(error.message);
    return { isAdmin: !!data };
  });

export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { search?: string; offset?: number; limit?: number } | undefined) =>
    z
      .object({
        search: z.string().max(200).optional(),
        offset: z.number().int().min(0).optional(),
        limit: z.number().int().min(1).max(100).optional(),
      })
      .optional()
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("products")
      .select("id,title_fa,slug,price,stock,brand,is_active,is_featured,images,category_id,categories(name_fa,slug)", { count: "exact" })
      .order("created_at", { ascending: false });
    if (data?.search) q = q.or(`title_fa.ilike.%${data.search}%,brand.ilike.%${data.search}%,sku.ilike.%${data.search}%`);
    const limit = data?.limit ?? 25;
    const offset = data?.offset ?? 0;
    q = q.range(offset, offset + limit - 1);
    const { data: rows, error, count } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [], count: count ?? 0 };
  });

export const adminGetProduct = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin.from("products").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

const productSchema = z.object({
  title_fa: z.string().min(1).max(255),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "اسلاگ فقط حروف کوچک انگلیسی، عدد و خط تیره"),
  description_fa: z.string().max(10000).optional().nullable(),
  price: z.number().int().min(0),
  compare_at_price: z.number().int().min(0).optional().nullable(),
  stock: z.number().int().min(0),
  brand: z.string().max(100).optional().nullable(),
  sku: z.string().max(100).optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  images: z.array(z.string().max(1000)).max(10).default([]),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export const adminCreateProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.input<typeof productSchema>) => productSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin.from("products").insert(data).select("id").single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminUpdateProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string } & z.input<typeof productSchema>) =>
    z.object({ id: z.string().uuid() }).merge(productSchema).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { id, ...rest } = data;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("products").update(rest).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { status?: string } | undefined) =>
    z
      .object({
        status: z.enum(["pending_payment", "paid", "shipped", "delivered", "cancelled", "processing"]).optional(),
      })
      .optional()
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("orders")
      .select("id,order_number,status,total,subtotal,shipping_cost,shipping_address,created_at,user_id,order_items(id,quantity,unit_price,product_snapshot)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data?.status) q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminGetOrder = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("orders")
      .select("id,order_number,status,total,subtotal,shipping_cost,shipping_address,notes,payment_ref,created_at,updated_at,user_id,order_items(id,quantity,unit_price,product_snapshot,product_id)")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminUpdateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: string }) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending_payment", "paid", "shipped", "delivered", "cancelled", "processing"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("orders").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ count: productsCount }, { count: ordersCount }, { count: pendingCount }, { data: revenueRow }] = await Promise.all([
      supabaseAdmin.from("products").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("orders").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending_payment"),
      supabaseAdmin.from("orders").select("total").in("status", ["paid", "shipped", "delivered"]),
    ]);
    const revenue = (revenueRow ?? []).reduce((s: number, r: any) => s + (r.total ?? 0), 0);
    return {
      productsCount: productsCount ?? 0,
      ordersCount: ordersCount ?? 0,
      pendingCount: pendingCount ?? 0,
      revenue,
    };
  });
