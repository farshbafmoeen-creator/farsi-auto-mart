import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ADMIN_NOTIFY_EMAIL, sendMail } from "./mailer.server";
import { orderConfirmationEmail, type OrderEmailItem } from "./templates/orderConfirmation";
import { orderStatusUpdateEmail } from "./templates/orderStatusUpdate";
import { adminNewOrderEmail } from "./templates/adminNewOrder";
import { contactFormEmail } from "./templates/contactForm";

async function loadOrder(orderId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("id,order_number,status,subtotal,shipping_cost,total,shipping_address,user_id,order_items(quantity,unit_price,product_snapshot)")
    .eq("id", orderId)
    .maybeSingle();
  if (error || !data) throw new Error(error?.message ?? "Order not found");

  let email: string | undefined;
  let fullName: string | undefined;
  try {
    const { data: u } = await supabaseAdmin.auth.admin.getUserById(data.user_id);
    email = u?.user?.email ?? undefined;
    fullName = (u?.user?.user_metadata as any)?.full_name;
  } catch {}

  const addr: any = data.shipping_address ?? {};
  const items: OrderEmailItem[] = (data.order_items ?? []).map((it: any) => ({
    title_fa: it.product_snapshot?.title_fa ?? "—",
    brand: it.product_snapshot?.brand ?? null,
    quantity: it.quantity,
    unit_price: it.unit_price,
  }));

  return {
    email,
    fullName,
    payload: {
      orderId: data.id,
      orderNumber: data.order_number,
      recipientName: addr.recipient_name ?? fullName,
      items,
      subtotal: data.subtotal,
      shippingCost: data.shipping_cost,
      total: data.total,
      address: addr,
    },
    status: data.status as string,
  };
}

export const sendOrderConfirmationEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { orderId: string }) => z.object({ orderId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    // Owner-only
    const { data: row, error } = await context.supabase
      .from("orders").select("id").eq("id", data.orderId).eq("user_id", context.userId).maybeSingle();
    if (error || !row) throw new Error("Forbidden");

    const o = await loadOrder(data.orderId);
    if (!o.email) return { ok: false, error: "no recipient" };
    const tpl = orderConfirmationEmail(o.payload);
    return sendMail({ to: o.email, ...tpl });
  });

export const sendAdminNewOrderEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { orderId: string }) => z.object({ orderId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    // Owner of the order may trigger admin notification (called right after createOrder).
    const { data: row, error } = await context.supabase
      .from("orders").select("id").eq("id", data.orderId).eq("user_id", context.userId).maybeSingle();
    if (error || !row) throw new Error("Forbidden");

    if (!ADMIN_NOTIFY_EMAIL) return { ok: true, skipped: true };
    const o = await loadOrder(data.orderId);
    const tpl = adminNewOrderEmail({ ...o.payload, customerEmail: o.email });
    return sendMail({ to: ADMIN_NOTIFY_EMAIL, ...tpl, replyTo: o.email });
  });

export const sendOrderStatusEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { orderId: string; newStatus: string }) =>
    z.object({
      orderId: z.string().uuid(),
      newStatus: z.enum(["pending_payment", "paid", "processing", "shipped", "delivered", "cancelled"]),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    // Admin-only
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");

    const o = await loadOrder(data.orderId);
    if (!o.email) return { ok: false, error: "no recipient" };
    const tpl = orderStatusUpdateEmail({
      orderId: o.payload.orderId,
      orderNumber: o.payload.orderNumber,
      newStatus: data.newStatus,
      recipientName: o.payload.recipientName,
    });
    return sendMail({ to: o.email, ...tpl });
  });

export const sendContactFormEmail = createServerFn({ method: "POST" })
  .inputValidator((input: { name: string; email: string; message: string }) =>
    z.object({
      name: z.string().min(1).max(200),
      email: z.string().email().max(200),
      message: z.string().min(2).max(5000),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    if (!ADMIN_NOTIFY_EMAIL) return { ok: true, skipped: true };
    const tpl = contactFormEmail(data);
    return sendMail({ to: ADMIN_NOTIFY_EMAIL, ...tpl, replyTo: data.email });
  });
