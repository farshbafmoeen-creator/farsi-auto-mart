import { SITE_NAME, SITE_URL } from "../mailer.server";

export function layout(opts: { title: string; preheader?: string; bodyHtml: string }) {
  const { title, preheader = "", bodyHtml } = opts;
  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#0b0d12;font-family:Tahoma,Vazirmatn,'Segoe UI',Arial,sans-serif;color:#e7e9ee;direction:rtl;text-align:right;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b0d12;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#11141b;border:1px solid #1f2330;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:20px 24px;border-bottom:1px solid #1f2330;">
              <a href="${SITE_URL}" style="color:#f59e0b;font-weight:900;font-size:18px;text-decoration:none;">${SITE_NAME}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;font-size:14px;line-height:2;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px;border-top:1px solid #1f2330;color:#7a8194;font-size:12px;">
              این پیام به‌صورت خودکار از ${SITE_NAME} ارسال شده است.<br/>
              <a href="${SITE_URL}" style="color:#7a8194;">${SITE_URL}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function escapeHtml(s: unknown) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatToman(n: number | null | undefined) {
  const v = Number(n ?? 0);
  return v.toLocaleString("fa-IR") + " تومان";
}

export const STATUS_LABEL: Record<string, string> = {
  pending_payment: "در انتظار پرداخت",
  paid: "پرداخت شده",
  processing: "در حال آماده‌سازی",
  shipped: "ارسال شده",
  delivered: "تحویل داده شده",
  cancelled: "لغو شده",
};
