import { escapeHtml, layout } from "./layout";

export function contactFormEmail(d: { name: string; email: string; message: string }) {
  const body = `
    <h2 style="margin:0 0 8px;color:#fff;font-size:18px;">پیام جدید از فرم تماس</h2>
    <p style="margin:0 0 6px;color:#c8ccd6;">از طرف: <strong>${escapeHtml(d.name)}</strong></p>
    <p style="margin:0 0 16px;color:#c8ccd6;">ایمیل پاسخ: <a href="mailto:${escapeHtml(d.email)}" style="color:#f59e0b;direction:ltr;display:inline-block;">${escapeHtml(d.email)}</a></p>
    <div style="background:#0b0d12;border:1px solid #1f2330;border-radius:10px;padding:14px;white-space:pre-wrap;color:#e7e9ee;">${escapeHtml(d.message)}</div>
  `;
  return {
    subject: `[تماس] پیام جدید از ${d.name}`,
    html: layout({ title: "پیام تماس", preheader: d.name, bodyHtml: body }),
  };
}
