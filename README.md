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

This is the Lite version. If you need:

- **Stripe / LemonSqueezy** subscriptions
- **AI** — chat, image generation, knowledge base
- **E-commerce** — product catalog, cart, checkout
- **6 site types** — Agency, Portfolio, Blog, Waitlist, Marketing
- **Email with Resend**, file uploads with Cloudflare R2

→ **[Get LaunchPad Pro ($64.99)](https://launchpad-checkout.netlify.app/)**

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

## License

MIT — use it however you want. No attribution required (though always appreciated).

---

*LaunchPad Pro includes everything in Lite plus payments, AI, and 5 more layouts — [check it out](https://launchpad-checkout.netlify.app/).*
