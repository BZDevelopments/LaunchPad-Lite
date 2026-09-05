export const siteConfig = {
  name: "LaunchPad Lite",
  tagline: "The Open-Source SaaS Starter",
  description: "A production-ready Next.js 15 starter. Get Launchpad Pro for E-commerce, AI, Portfolios and more.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ogImage: "/og-image.png",

  email: {
    support: "support@yourapp.com",
    noreply: "onboarding@yourapp.com",
    admin: "admin@yourapp.com",
  },

  social: {
    twitter: "https://twitter.com/yourbrand",
    github: "https://github.com/yourbrand",
  },

  nav: {
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
    ],
  },

  auth: {
    providers: {
      google: true,
      github: true,
      magicLink: false,
      emailPassword: true,
    },
    sessionExpiresIn: 60 * 60 * 24 * 30,
    requireEmailVerification: true,
  },

  features: {
    waitlist: false,
    blog: false,
    changelog: false,
    requireAuthForDashboard: true,
    modules: {
      ai: false,
      shop: false,
      content: false,
      leads: false,
      projects: false,
    }
  },

  seo: {
    keywords: ["saas", "startup", "boilerplate"],
    twitterCard: "summary_large_image" as const,
    locale: "en_US",
  },
} as const;

export type SiteConfig = typeof siteConfig;
