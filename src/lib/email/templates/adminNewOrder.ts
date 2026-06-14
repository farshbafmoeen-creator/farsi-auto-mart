import { escapeHtml, formatToman, layout } from "./layout";
import { SITE_URL } from "../mailer.server";
import type { OrderEmailData } from "./orderConfirmation";

export function adminNewOrderEmail(d: OrderEmailData & { customerEmail?: string }) {
  const itemsRows = d.items
    .map(
      (it) => `<tr>
        <td style="padding:6px 0;border-bottom:1px solid #1f2330;">${escapeHtml(it.title_fa)} <span style="color:#7a8194;font-size:12px;">(${escapeHtml(it.brand ?? "")})</span></td>
        <td style="padding:6px 0;border-bottom:1px solid #1f2330;text-align:center;">${it.quantity.toLocaleString("fa-IR")}</td>
        <td style="padding:6px 0;border-bottom:1px solid #1f2330;text-align:left;white-space:nowrap;">${formatToman(it.unit_price * it.quantity)}</td>
      </tr>`,
    )
    .join("");

  const body = `
    <h2 style="margin:0 0 8px;color:#fff;font-size:18px;">سفارش جدید ثبت شد</h2>
    <p style="margin:0 0 12px;color:#c8ccd6;">
      شماره: <strong style="color:#f59e0b;direction:ltr;display:inline-block;">${escapeHtml(d.orderNumber)}</strong><br/>
      مشتری: ${escapeHtml(d.recipientName ?? "—")} ${d.customerEmail ? `· ${escapeHtml(d.customerEmail)}` : ""}<br/>
      مبلغ کل: <strong style="color:#fff;">${formatToman(d.total)}</strong>
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:8px;">
      <tr style="color:#7a8194;font-size:12px;"><td>کالا</td><td style="text-align:center;">تعداد</td><td style="text-align:left;">جمع</td></tr>
      ${itemsRows}
    </table>

    <h3 style="margin:20px 0 8px;color:#fff;font-size:15px;">آدرس تحویل</h3>
    <p style="margin:0;color:#c8ccd6;line-height:1.9;">
      ${escapeHtml(d.address.recipient_name ?? "")} — ${escapeHtml(d.address.phone ?? "")}<br/>
      ${escapeHtml(d.address.province ?? "")}، ${escapeHtml(d.address.city ?? "")} — ${escapeHtml(d.address.address_line ?? "")}<br/>
      کدپستی: ${escapeHtml(d.address.postal_code ?? "")}
    </p>

    <div style="margin-top:20px;">
      <a href="${SITE_URL}/admin/orders/${encodeURIComponent(d.orderId)}"
         style="display:inline-block;background:#f59e0b;color:#0b0d12;font-weight:900;padding:10px 18px;border-radius:10px;text-decoration:none;">
        مدیریت سفارش
      </a>
    </div>
  `;

  return {
    subject: `[سفارش جدید] ${d.orderNumber} — ${formatToman(d.total)}`,
    html: layout({ title: "سفارش جدید", preheader: `${d.orderNumber}`, bodyHtml: body }),
  };
}
