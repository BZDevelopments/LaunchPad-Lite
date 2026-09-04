<div align="center">

# Launchpad Lite

**The Open-Source Next.js 15 SaaS Starter**

A clean, production-ready starting point for your next SaaS project. Pre-configured with Better Auth, Drizzle ORM, and modern Next.js 15 App Router patterns.

[**Get Launchpad Pro ($64.99) →**](https://launchpad-checkout.netlify.app/)

</div>

---

## What is Launchpad Lite?

Launchpad Lite is the free, open-source version of [Launchpad Pro](https://github.com/BZDevelopments/launchpad-showcase). It gives you the foundational SaaS layout, authentication, and database setup so you can start building immediately without rewiring the plumbing.

### Features Included in Lite:
- **Framework:** Next.js 15 (App Router, Server Actions)
- **Authentication:** Better Auth (ready for Google, GitHub, Email/Password)
- **Database:** Drizzle ORM + PostgreSQL
- **Styling:** Tailwind CSS v4 + UI Components
- **Layout:** Standard SaaS landing page (Hero, Features, Pricing)

---

## Want to skip 30+ more hours of work? Get Launchpad Pro.

The **Pro** version includes the complete modular engine that adapts to 6 different site types (SaaS, E-commerce, Portfolio, Agency, Blog, Waitlist) from a single config file, plus all premium integrations:

✅ **Stripe & LemonSqueezy** subscriptions and one-time checkouts pre-wired
✅ **Vercel AI SDK v5** with streaming chat, image gen, and pgvector RAG
✅ **E-commerce & Portfolio Modules** (Cart, product catalog, case studies)
✅ **Cloudflare R2 / AWS S3** file upload implementation
✅ **Upstash Redis** rate limiting and **Resend** email templates

👉 **[View the Pro Showcase & Demo](https://github.com/BZDevelopments/launchpad-showcase)**
👉 **[Purchase Launchpad Pro ($64.99)](https://launchpad-checkout.netlify.app/)**

---

## Getting Started with Lite

1. **Clone & Install**
   ```bash
   git clone https://github.com/yourusername/launchpad-lite.git my-app
   cd my-app
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your `DATABASE_URL` and generate a `BETTER_AUTH_SECRET`.

3. **Database Setup**
   ```bash
   npm run db:push
   ```

4. **Run**
   ```bash
   npm run dev
   ```

## License

Launchpad Lite is open-source under the MIT License.
Launchpad Pro requires a commercial license.
