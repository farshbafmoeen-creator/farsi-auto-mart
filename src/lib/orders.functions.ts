import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const addressSchema = z.object({
  recipient_name: z.string().min(1).max(200),
  phone: z.string().min(5).max(30),
  province: z.string().min(1).max(100),
  city: z.string().min(1).max(100),
  address_line: z.string().min(3).max(500),
  postal_code: z.string().min(3).max(20),
});

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        quantity: z.number().int().min(1).max(1000),
      }),
    )
    .min(1)
    .max(100),
  shipping_address: addressSchema,
  shipping_cost: z.number().int().min(0).max(100_000_000).default(0),
});

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.input<typeof createOrderSchema>) => createOrderSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: orderId, error } = await context.supabase.rpc("create_order_with_items", {
      _items: data.items,
      _shipping_address: data.shipping_address,
      _shipping_cost: data.shipping_cost,
    });
    if (error) throw new Error(error.message);
    return { orderId: orderId as unknown as string };
  });

export const getMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("orders")
      .select("id,order_number,status,total,created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getMyOrder = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("orders")
      .select(
        "id,order_number,status,total,subtotal,shipping_cost,shipping_address,created_at,order_items(id,quantity,unit_price,product_snapshot)",
      )
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });
