import { escapeHtml, layout, STATUS_LABEL } from "./layout";
import { SITE_URL } from "../mailer.server";

export function orderStatusUpdateEmail(d: {
  orderNumber: string;
  orderId: string;
  newStatus: string;
  recipientName?: string;
}) {
  const label = STATUS_LABEL[d.newStatus] ?? d.newStatus;
  const body = `
    <h2 style="margin:0 0 8px;color:#fff;font-size:18px;">به‌روزرسانی وضعیت سفارش</h2>
    <p style="margin:0 0 16px;color:#c8ccd6;">
      ${escapeHtml(d.recipientName ?? "مشتری گرامی")}،<br/>
      وضعیت سفارش <strong style="color:#f59e0b;direction:ltr;display:inline-block;">${escapeHtml(d.orderNumber)}</strong>
      به «<strong style="color:#fff;">${escapeHtml(label)}</strong>» تغییر کرد.
    </p>
    <div style="margin-top:24px;text-align:center;">
      <a href="${SITE_URL}/orders/${encodeURIComponent(d.orderId)}"
         style="display:inline-block;background:#f59e0b;color:#0b0d12;font-weight:900;padding:12px 22px;border-radius:10px;text-decoration:none;">
        مشاهده جزئیات
      </a>
    </div>
  `;
  return {
    subject: `وضعیت سفارش ${d.orderNumber}: ${label}`,
    html: layout({ title: "به‌روزرسانی وضعیت", preheader: label, bodyHtml: body }),
  };
}
