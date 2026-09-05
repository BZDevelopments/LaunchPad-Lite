# LaunchPad Lite

A free, open-source Next.js 15 starter for SaaS apps. Auth, database, and a clean dashboard — all wired up. No fluff.

Built by [BZDevelopments](https://github.com/BZDevelopments).

---

## What's in the box

- **Next.js 15** App Router, Server Actions, TypeScript
- **Better Auth** — email/password, Google OAuth, GitHub OAuth
- **Drizzle ORM** + PostgreSQL
- **Tailwind CSS v4** + Radix UI components
- Dark mode (next-themes)
- A simple dashboard with Settings and an Admin panel

That's it. No payments, no AI, no e-commerce. Just the foundation.

## What's NOT in the box

This is the Lite version. The full **LaunchPad Pro** includes:

- **Stripe / LemonSqueezy** subscriptions and one-time checkouts
- **AI** — chat, image generation, RAG knowledge base (Vercel AI SDK v5)
- **E-commerce** — product catalog, cart, checkout
- **6 site types** — SaaS, Agency, Portfolio, Blog, Waitlist, Marketing (all from one config switch)
- **Email with Resend**, file uploads with Cloudflare R2 / AWS S3
- **Upstash Redis** rate limiting

→ **[See the Pro showcase & live demo](https://github.com/BZDevelopments/launchpad-showcase)**
→ **[Get LaunchPad Pro — $64.99](https://launchpad-checkout.netlify.app/)**

---

## Getting started

```bash
git clone https://github.com/BZDevelopments/launchpad-lite.git my-app
cd my-app
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

```
DATABASE_URL=postgresql://user:pass@host:5432/db
BETTER_AUTH_SECRET=your-random-secret
BETTER_AUTH_URL=http://localhost:3000
```

```bash
npm run db:push
npm run dev
```

Done. Edit `src/user-control/site-config.ts` to change the name, links, and auth providers.

---

## Want to see what Pro looks like first?

Check out the **[showcase repo](https://github.com/BZDevelopments/launchpad-showcase)** — it has screenshots of all 6 layouts and a live interactive demo.

If Pro is what you need, grab it at **[launchpad-checkout.netlify.app](https://launchpad-checkout.netlify.app/)**.

---

## License

MIT — use it however you want. No attribution required (though always appreciated).
