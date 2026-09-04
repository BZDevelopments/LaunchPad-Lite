/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║              LAUNCHPAD — SITE CONFIGURATION                      ║
 * ║                                                                  ║
 * ║  This is the ONLY file most people need to edit.                ║
 * ║  siteType below decides what your homepage, nav, and dashboard   ║
 * ║  look like. Everything else is optional fine-tuning.             ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

/**
 * The single most important setting in this file.
 *
 * Each value swaps in a different homepage layout and a different default
 * dashboard module — pick the one closest to what you're building, then
 * fine-tune with the flags below. You can change this later; it only
 * controls which components render, not your data.
 *
 *  "saas"       — subscription product behind login (AI chat/image/RAG,
 *                 or delete src/app/(dashboard)/dashboard/chat|image-lab|
 *                 knowledge-base and build your own core feature there)
 *  "portfolio"  — personal site: work showcase, about, contact. No auth
 *                 required for visitors.
 *  "agency"     — services + case studies + team + lead-gen contact form
 *  "ecommerce"  — product catalog, cart, one-time checkout, order history
 *  "content"    — blog/publication-first, newsletter signup
 *  "marketing"  — single-page product pitch + waitlist, nothing behind login
 */
export type SiteType =
  | "saas"
  | "portfolio"
  | "agency"
  | "ecommerce"
  | "content"
  | "marketing";

export const siteConfig = {
  // ─── SITE TYPE ────────────────────────────────────────────────────────────
  siteType: "saas" as SiteType,

  // ─── BRAND ───────────────────────────────────────────────────────────────
  name: "LaunchPad Lite",
  tagline: "The Open-Source SaaS Starter",
  description:
    "A production-ready Next.js 15 starter. Get Launchpad Pro for E-commerce, AI, Portfolios and more.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ogImage: "/og-image.png",

  // ─── CONTACT ──────────────────────────────────────────────────────────────
  email: {
    support: "support@yourapp.com",
    noreply: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
    admin: "admin@yourapp.com",
  },

  // ─── SOCIAL ───────────────────────────────────────────────────────────────
  social: {
    twitter: "https://twitter.com/yourbrand",
    github: "https://github.com/yourbrand",
    linkedin: "https://linkedin.com/company/yourbrand",
    instagram: "https://instagram.com/yourbrand",
  },

  // ─── NAVIGATION ───────────────────────────────────────────────────────────
  nav: {
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
    ],
  },

  // ─── FEATURE FLAGS ────────────────────────────────────────────────────────
  features: {
    waitlist: false,
    maintenanceMode: false,
    blog: false,
    changelog: false,

    requireAuthForDashboard: true,

    // Launchpad Pro unlocks all these modules.
    modules: {
      ai: false, 
      shop: false, 
      content: false, 
      leads: false, 
      projects: false, 
    },

    ai: {
      chat: false,
      imageGeneration: false,
      knowledgeBase: false,
    },
  },

  // ─── AUTH ─────────────────────────────────────────────────────────────────
  auth: {
    providers: {
      google: true,
      github: true,
      magicLink: true,
      emailPassword: true,
    },
    sessionExpiresIn: 60 * 60 * 24 * 30,
    requireEmailVerification: true,
  },

  // ─── AI (only relevant if features.modules.ai is true) ───────────────────
  ai: {
    defaultProvider: "openai" as "openai" | "anthropic" | "google",
    defaultModel: "gpt-4o-mini",
    systemPrompt: "You are a helpful AI assistant.",
    maxTokens: 2000,
    rateLimit: {
      requestsPerDay: 50,
      requestsPerMinute: 5,
    },
  },

  // ─── STORAGE ──────────────────────────────────────────────────────────────
  storage: {
    provider: "r2" as "r2" | "s3",
    maxFileSizeMB: 10,
    allowedFileTypes: ["pdf", "txt", "md", "png", "jpg", "jpeg", "webp"],
    bucketName: process.env.STORAGE_BUCKET_NAME ?? "launchpad-uploads",
  },

  // ─── COMMERCE (only relevant if features.modules.shop is true) ───────────
  commerce: {
    currency: "USD",
    currencySymbol: "$",
  },

  // ─── SEO ──────────────────────────────────────────────────────────────────
  seo: {
    keywords: ["saas", "startup", "boilerplate"],
    twitterCard: "summary_large_image" as const,
    locale: "en_US",
  },

  // ─── ANALYTICS ────────────────────────────────────────────────────────────
  analytics: {
    posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    vercelAnalytics: true,
  },
} as const;

export type SiteConfig = typeof siteConfig;
