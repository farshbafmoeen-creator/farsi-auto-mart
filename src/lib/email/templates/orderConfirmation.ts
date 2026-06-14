import { escapeHtml, formatToman, layout } from "./layout";
import { SITE_URL } from "../mailer.server";

export type OrderEmailItem = {
  title_fa: string;
  brand?: string | null;
  quantity: number;
  unit_price: number;
};

export type OrderEmailData = {
  orderNumber: string;
  orderId: string;
  recipientName?: string;
  items: OrderEmailItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  address: {
    recipient_name?: string;
    phone?: string;
    province?: string;
    city?: string;
    address_line?: string;
    postal_code?: string;
  };
};

export function orderConfirmationEmail(d: OrderEmailData) {
  const itemsRows = d.items
    .map(
      (it) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #1f2330;">
          <div style="font-weight:bold;">${escapeHtml(it.title_fa)}</div>
          <div style="color:#7a8194;font-size:12px;">${escapeHtml(it.brand ?? "")} · ${it.quantity.toLocaleString("fa-IR")} عدد</div>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #1f2330;text-align:left;white-space:nowrap;">${formatToman(it.unit_price * it.quantity)}</td>
      </tr>`,
    )
    .join("");

  const body = `
    <h2 style="margin:0 0 8px;color:#fff;font-size:18px;">سفارش شما با موفقیت ثبت شد</h2>
    <p style="margin:0 0 16px;color:#c8ccd6;">
      ${escapeHtml(d.recipientName ?? "")} عزیز، از خرید شما متشکریم.<br/>
      شماره سفارش: <strong style="color:#f59e0b;direction:ltr;display:inline-block;">${escapeHtml(d.orderNumber)}</strong>
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:8px;">
      ${itemsRows}
      <tr><td style="padding-top:12px;color:#7a8194;">جمع کالاها</td><td style="padding-top:12px;text-align:left;">${formatToman(d.subtotal)}</td></tr>
      <tr><td style="color:#7a8194;">هزینه ارسال</td><td style="text-align:left;">${d.shippingCost === 0 ? "رایگان" : formatToman(d.shippingCost)}</td></tr>
      <tr><td style="padding-top:8px;font-weight:900;color:#fff;">مبلغ کل</td><td style="padding-top:8px;text-align:left;font-weight:900;color:#f59e0b;">${formatToman(d.total)}</td></tr>
    </table>

    <h3 style="margin:24px 0 8px;color:#fff;font-size:15px;">آدرس تحویل</h3>
    <p style="margin:0;color:#c8ccd6;line-height:1.9;">
      ${escapeHtml(d.address.recipient_name ?? "")} — ${escapeHtml(d.address.phone ?? "")}<br/>
      ${escapeHtml(d.address.province ?? "")}، ${escapeHtml(d.address.city ?? "")}<br/>
      ${escapeHtml(d.address.address_line ?? "")}<br/>
      کدپستی: ${escapeHtml(d.address.postal_code ?? "")}
    </p>

    <div style="margin-top:24px;text-align:center;">
      <a href="${SITE_URL}/orders/${encodeURIComponent(d.orderId)}"
         style="display:inline-block;background:#f59e0b;color:#0b0d12;font-weight:900;padding:12px 22px;border-radius:10px;text-decoration:none;">
        مشاهده سفارش
      </a>
    </div>
  `;

  return {
    subject: `تأیید سفارش ${d.orderNumber}`,
    html: layout({ title: "تأیید سفارش", preheader: `سفارش ${d.orderNumber} ثبت شد`, bodyHtml: body }),
  };
}
