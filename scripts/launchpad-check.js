#!/usr/bin/env node

const REQUIRED = [
  { key: "DATABASE_URL", hint: "Your PostgreSQL connection string — use the POOLED connection on Supabase/Neon (e.g. port 6543)" },
  { key: "BETTER_AUTH_SECRET", hint: 'Generate with: openssl rand -base64 32 (or: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))")' },
  { key: "NEXT_PUBLIC_APP_URL", hint: "Your app URL (e.g. https://yourapp.com)" },
];

const OPTIONAL = [
  { key: "OPENAI_API_KEY", hint: "Required for AI features (OpenAI)" },
  { key: "ANTHROPIC_API_KEY", hint: "Required for AI features (Anthropic)" },
  { key: "GOOGLE_CLIENT_ID", hint: "Required for Google OAuth" },
  { key: "GITHUB_CLIENT_ID", hint: "Required for GitHub OAuth" },
  { key: "STRIPE_SECRET_KEY", hint: "Required for Stripe payments" },
  { key: "STRIPE_WEBHOOK_SECRET", hint: "Required for Stripe webhooks" },
  { key: "RESEND_API_KEY", hint: "Required for transactional email" },
  { key: "UPSTASH_REDIS_REST_URL", hint: "Required for AI rate limiting in production" },
  { key: "UPSTASH_REDIS_REST_TOKEN", hint: "Required for AI rate limiting in production" },
  { key: "R2_ACCOUNT_ID", hint: "Required for file uploads (Cloudflare R2)" },
  { key: "DIRECT_URL", hint: "Direct (non-pooled) DB connection for drizzle-kit — falls back to DATABASE_URL if unset" },
];

try {
  const fs = require("fs");
  const path = require("path");
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const [key, ...rest] = trimmed.split("=");
      if (key && rest.length > 0 && !process.env[key]) {
        process.env[key] = rest.join("=").replace(/^["']|["']$/g, "");
      }
    }
  }
} catch {}

const RESET = "\x1b[0m", RED = "\x1b[31m", GREEN = "\x1b[32m", YELLOW = "\x1b[33m", CYAN = "\x1b[36m", BOLD = "\x1b[1m";

console.log(`\n${BOLD}${CYAN}⚡ Launchpad — Environment Check${RESET}\n`);

let hasErrors = false;
let warnings = 0;

console.log(`${BOLD}Required Variables${RESET}`);
for (const { key, hint } of REQUIRED) {
  if (process.env[key]) console.log(`  ${GREEN}✓${RESET}  ${key}`);
  else {
    console.log(`  ${RED}✗${RESET}  ${key}`);
    console.log(`     ${YELLOW}→ ${hint}${RESET}`);
    hasErrors = true;
  }
}

console.log(`\n${BOLD}Optional Variables${RESET}`);
for (const { key, hint } of OPTIONAL) {
  if (process.env[key]) console.log(`  ${GREEN}✓${RESET}  ${key}`);
  else {
    console.log(`  ${YELLOW}○${RESET}  ${key} ${YELLOW}(not set)${RESET}`);
    console.log(`     → ${hint}`);
    warnings++;
  }
}

console.log(`\n${BOLD}Provider Consistency${RESET}`);

if (process.env.RESEND_API_KEY && !process.env.RESEND_FROM_EMAIL) {
  console.log(`  ${YELLOW}○${RESET}  RESEND_FROM_EMAIL not set — emails send from onboarding@resend.dev`);
  console.log(`     → This ONLY delivers to the email you signed up to Resend with, not to`);
  console.log(`       real users. Verify a domain and set RESEND_FROM_EMAIL before giving this`);
  console.log(`       app to anyone else. See docs/ENVIRONMENT_VARIABLES.md.`);
  warnings++;
}
const paymentProvider = process.env.PAYMENT_PROVIDER || "stripe";
if (paymentProvider === "stripe") {
  const ready = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET;
  console.log(ready ? `  ${GREEN}✓${RESET}  PAYMENT_PROVIDER=stripe — keys configured` : `  ${YELLOW}○${RESET}  PAYMENT_PROVIDER=stripe, but keys are missing`);
  if (!ready) warnings++;
} else if (paymentProvider === "lemonsqueezy") {
  const ready = process.env.LS_API_KEY && process.env.LS_WEBHOOK_SECRET;
  console.log(ready ? `  ${GREEN}✓${RESET}  PAYMENT_PROVIDER=lemonsqueezy — keys configured` : `  ${YELLOW}○${RESET}  PAYMENT_PROVIDER=lemonsqueezy, but keys are missing`);
  if (!ready) warnings++;
} else {
  console.log(`  ${RED}✗${RESET}  PAYMENT_PROVIDER="${paymentProvider}" is not recognized (expected "stripe" or "lemonsqueezy")`);
  hasErrors = true;
}

const r2Ready = process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY;
const s3Ready = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;
if (r2Ready || s3Ready) console.log(`  ${GREEN}✓${RESET}  Storage credentials found for ${r2Ready ? "Cloudflare R2" : "AWS S3"}`);
else { console.log(`  ${YELLOW}○${RESET}  No storage credentials found (R2 or S3)`); warnings++; }

console.log("");
if (hasErrors) {
  console.log(`${RED}${BOLD}✗ Missing required environment variables.${RESET}`);
  console.log(`  Copy .env.example to .env.local and fill in the missing values.\n`);
  process.exit(1);
} else if (warnings > 0) {
  console.log(`${YELLOW}${BOLD}⚠ ${warnings} optional item(s) not configured. Some features may be disabled.${RESET}\n`);
} else {
  console.log(`${GREEN}${BOLD}✓ All environment variables configured. Ready to launch! 🚀${RESET}\n`);
}
