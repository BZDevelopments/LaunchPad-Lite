import { Resend } from "resend";
import { siteConfig } from "@/user-control/site-config";

const resend = new Resend(process.env.RESEND_API_KEY);

type AuthEmailType = "verification" | "magic-link" | "password-reset" | "welcome" | "delete-account";

interface AuthEmailOptions {
  to: string;
  subject: string;
  type: AuthEmailType;
  data: { url?: string; name?: string; [key: string]: unknown };
}

export async function sendAuthEmail({ to, subject, type, data }: AuthEmailOptions) {
  const from = `${siteConfig.name} <${siteConfig.email.noreply}>`;
  const html = buildAuthEmailHtml(type, data, subject);
  try {
    // IMPORTANT: the Resend SDK does NOT throw on API-level failures (like
    // sending from an unverified domain) — it returns { data, error }.
    // Checking only try/catch here silently swallowed every failed send,
    // which is why verification/reset emails could go missing with zero
    // error in the logs. Always check `error` explicitly.
    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) {
      console.error(`[Email] Resend rejected ${type} email to ${to}:`, error);
      if (error.name === "validation_error" && /domain is not verified/i.test(error.message ?? "")) {
        throw new Error(
          `Resend rejected this email because the sending domain isn't verified. ` +
          `Using the default "onboarding@resend.dev" address only delivers to the ` +
          `email you signed up to Resend with. Verify a domain in your Resend ` +
          `dashboard, or set RESEND_FROM_EMAIL, to send to real users. ` +
          `See docs/ENVIRONMENT_VARIABLES.md.`
        );
      }
      throw new Error(error.message ?? "Resend rejected this email.");
    }
  } catch (error) {
    console.error(`[Email] Failed to send ${type} email to ${to}:`, error);
    throw error instanceof Error ? error : new Error("Failed to send email. Please try again.");
  }
}

function buildAuthEmailHtml(
  type: AuthEmailType,
  data: { url?: string; name?: string; [key: string]: unknown },
  subject: string
): string {
  const { name = "there", url = "#" } = data;
  const appName = siteConfig.name;
  const appUrl = siteConfig.url;

  const buttonLabels: Record<AuthEmailType, string> = {
    verification: "Verify Email Address",
    "magic-link": "Sign In to " + appName,
    "password-reset": "Reset Password",
    welcome: "Go to Dashboard",
    "delete-account": "Confirm Account Deletion",
  };

  const bodies: Record<AuthEmailType, string> = {
    verification: `Please verify your email address by clicking the button below. This link expires in 24 hours.`,
    "magic-link": `Click the button below to sign in. This link expires in 15 minutes and can only be used once.`,
    "password-reset": `We received a request to reset your password. Click the button below to set a new one. This link expires in 1 hour.`,
    welcome: `Welcome to ${appName}! Your account has been set up and you're ready to start building.`,
    "delete-account": `We received a request to permanently delete your ${appName} account and all associated data. This cannot be undone. If you didn't request this, ignore this email.`,
  };

  return wrapEmailShell(
    subject,
    `
    <p style="margin:0 0 8px;color:#64748b;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">${subject}</p>
    <h1 style="margin:0 0 24px;color:#171717;font-size:24px;font-weight:700;line-height:1.3;">Hi ${name},</h1>
    <p style="margin:0 0 32px;color:#525252;font-size:16px;line-height:1.7;">${bodies[type]}</p>
    <a href="${url}" style="display:inline-block;background:#c2540f;color:#ffffff;font-size:16px;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;">${buttonLabels[type]}</a>
    <p style="margin:32px 0 0;color:#a3a3a3;font-size:13px;line-height:1.6;">If you didn't request this, you can safely ignore this email.</p>
    `
  );
}

/**
 * Sent to siteConfig.email.admin whenever the contact form is submitted
 * (used by portfolio/agency/marketing site types' leads module).
 */
export async function sendContactNotification(data: {
  name: string;
  email: string;
  company?: string;
  message: string;
}) {
  const from = `${siteConfig.name} <${siteConfig.email.noreply}>`;
  try {
    const { error } = await resend.emails.send({
      from,
      to: siteConfig.email.admin,
      replyTo: data.email,
      subject: `New contact form submission from ${data.name}`,
      html: wrapEmailShell(
        "New Contact Form Submission",
        `
        <h1 style="margin:0 0 20px;color:#171717;font-size:22px;font-weight:700;">New message from ${data.name}</h1>
        <table style="width:100%;font-size:14px;color:#404040;margin-bottom:20px;">
          <tr><td style="padding:4px 0;font-weight:600;width:100px;">Email</td><td>${data.email}</td></tr>
          ${data.company ? `<tr><td style="padding:4px 0;font-weight:600;">Company</td><td>${data.company}</td></tr>` : ""}
        </table>
        <p style="white-space:pre-wrap;color:#404040;font-size:15px;line-height:1.7;background:#fafafa;border-radius:10px;padding:16px;">${data.message}</p>
        `
      ),
    });
    if (error) console.error("[Email] Resend rejected contact notification:", error);
  } catch (error) {
    console.error("[Email] Failed to send contact notification:", error);
    // Don't throw — the lead is already saved to the DB even if the email fails
  }
}

/**
 * Sent to the customer after a successful one-time purchase (shop module).
 */
export async function sendOrderConfirmation(data: {
  to: string;
  orderId: string;
  items: Array<{ name: string; quantity: number; priceCents: number }>;
  totalCents: number;
  currencySymbol: string;
}) {
  const from = `${siteConfig.name} <${siteConfig.email.noreply}>`;
  const itemsHtml = data.items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;">${item.name} × ${item.quantity}</td><td style="padding:8px 0;text-align:right;">${data.currencySymbol}${((item.priceCents * item.quantity) / 100).toFixed(2)}</td></tr>`
    )
    .join("");

  try {
    const { error } = await resend.emails.send({
      from,
      to: data.to,
      subject: `Order confirmed — ${siteConfig.name}`,
      html: wrapEmailShell(
        "Order Confirmed",
        `
        <h1 style="margin:0 0 20px;color:#171717;font-size:22px;font-weight:700;">Thanks for your order!</h1>
        <p style="color:#525252;font-size:15px;margin-bottom:20px;">Order #${data.orderId.slice(0, 8)}</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#404040;">
          ${itemsHtml}
          <tr style="border-top:1px solid #e5e5e5;"><td style="padding:12px 0 0;font-weight:700;">Total</td><td style="padding:12px 0 0;text-align:right;font-weight:700;">${data.currencySymbol}${(data.totalCents / 100).toFixed(2)}</td></tr>
        </table>
        `
      ),
    });
    if (error) console.error("[Email] Resend rejected order confirmation:", error);
  } catch (error) {
    console.error("[Email] Failed to send order confirmation:", error);
  }
}

function wrapEmailShell(title: string, bodyHtml: string): string {
  const appName = siteConfig.name;
  const appUrl = siteConfig.url;
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <tr><td style="background:#1c1917;padding:28px 40px;">
          <a href="${appUrl}" style="color:#ffffff;font-size:20px;font-weight:700;text-decoration:none;">${appName}</a>
        </td></tr>
        <tr><td style="padding:40px;">${bodyHtml}</td></tr>
        <tr><td style="padding:24px 40px;border-top:1px solid #f5f5f4;">
          <p style="margin:0;color:#a3a3a3;font-size:13px;">© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
