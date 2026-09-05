export const siteConfig = {
  name: "LaunchPad Lite",
  tagline: "The free Next.js SaaS starter",
  description: "Authentication, database, and a clean dashboard — ready to go. Need payments, AI, or more layouts? Upgrade to Pro.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ogImage: "/og-image.png",

  email: {
    support: "support@yourapp.com",
    admin: "admin@yourapp.com",
  },

  social: {
    twitter: "https://twitter.com/BZDevelopments",
    github: "https://github.com/BZDevelopments",
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
    },
  },

  seo: {
    keywords: ["nextjs", "saas", "starter", "boilerplate", "better-auth", "drizzle"],
    twitterCard: "summary_large_image" as const,
    locale: "en_US",
  },
} as const;

export type SiteConfig = typeof siteConfig;
