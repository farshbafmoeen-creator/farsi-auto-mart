/**
 * SMTP mailer — Nodemailer based.
 * Reads SMTP_* env vars at runtime. Lazy + dynamic import so the module
 * isn't bundled into edge/worker builds (Lovable preview SSR).
 * On a Node server (Iranian VPS, Liara, …) just set the ENV vars and it works.
 */

type SendArgs = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

let _transporterPromise: Promise<any> | null = null;

async function getTransporter(): Promise<any | null> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  if (_transporterPromise) return _transporterPromise;

  _transporterPromise = (async () => {
    // Dynamic import via variable so Vite/Workers don't statically bundle nodemailer.
    const moduleName = "nodemailer";
    const mod: any = await import(/* @vite-ignore */ moduleName);
    const nodemailer = mod.default ?? mod;
    return nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: String(process.env.SMTP_SECURE ?? "false") === "true",
      auth: { user, pass },
    });
  })();

  return _transporterPromise;
}

export async function sendMail(args: SendArgs): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  try {
    const transporter = await getTransporter();
    const from = process.env.SMTP_FROM ?? "no-reply@example.com";

    if (!transporter) {
      // No SMTP configured — log and skip (dev/preview safe).
      console.log("[mail:skipped]", { to: args.to, subject: args.subject, from });
      return { ok: true, skipped: true };
    }

    const info = await transporter.sendMail({
      from,
      to: Array.isArray(args.to) ? args.to.join(",") : args.to,
      subject: args.subject,
      html: args.html,
      text: args.text ?? stripHtml(args.html),
      replyTo: args.replyTo,
    });
    console.log("[mail:sent]", { messageId: info?.messageId, to: args.to });
    return { ok: true };
  } catch (err: any) {
    console.error("[mail:error]", err?.message ?? err);
    return { ok: false, error: err?.message ?? "send failed" };
  }
}

function stripHtml(html: string) {
  return html.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

export const SITE_URL = process.env.SITE_URL ?? "https://partbazaar.example";
export const SITE_NAME = "پارت‌بازار";
export const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL ?? "";
