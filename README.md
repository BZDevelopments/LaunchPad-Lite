# LaunchPad Lite

A free, open-source Next.js 15 starter. Auth, database, and a clean dashboard — wired up and ready to go.

Built by [BZDevelopments](https://github.com/BZDevelopments).

---

## What's included

- **Next.js 15** App Router · Server Actions · React 19 · TypeScript strict mode
- **Better Auth** — email/password, Google OAuth, GitHub OAuth, magic link
- **Drizzle ORM** + PostgreSQL (4-table schema: user, session, account, verification)
- **Tailwind CSS v4** + Radix UI components
- Dark mode (`next-themes`)
- Clean dashboard with Settings, Admin panel, and upgrade card

That's it. No payments, no AI, no e-commerce. Just the foundation — MIT licensed, use it however you want.

---

## Need the full production stack?

**LaunchPad Pro** is the turnkey commercial version — same foundation, everything else already built and tested:

| Feature | Lite | Pro |
|---|:---:|:---:|
| Next.js 15 + Better Auth + Drizzle | ✅ | ✅ |
| Stripe subscriptions + webhook handlers + customer portal | ❌ | ✅ |
| LemonSqueezy one-time checkouts + license keys | ❌ | ✅ |
| AI Chat + Image Studio (Vercel AI SDK v5) | ❌ | ✅ |
| RAG Knowledge Base (pgvector + HNSW indexing) | ❌ | ✅ |
| E-commerce: cart, products catalog, orders | ❌ | ✅ |
| Resend transactional email + React Email templates | ❌ | ✅ |
| Cloudflare R2 / AWS S3 presigned URL uploads | ❌ | ✅ |
| Upstash Redis token bucket rate limiting | ❌ | ✅ |
| 6 site types (SaaS, Agency, Portfolio, Blog, Waitlist, Shop) | ❌ | ✅ |
| Leads inbox + contact pipeline | ❌ | ✅ |
| Blog post editor (Markdown, draft/publish) | ❌ | ✅ |
| Admin panel with user list + stats | ❌ | ✅ |

**[→ See the interactive demo](https://bzdevelopments.github.io/launchpad-showcase/)**  
**[→ Get LaunchPad Pro — $64.99](https://launchpad-checkout.netlify.app/)** · One-time purchase · Unlimited personal & client projects · All updates included

---

## Getting started

```bash
git clone https://github.com/BZDevelopments/LaunchPad-Lite.git my-app
cd my-app
pnpm install # or npm install
cp .env.example .env.local
```

Fill in `.env.local`:

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
BETTER_AUTH_SECRET=your-random-secret
BETTER_AUTH_URL=http://localhost:3000
```

Run migrations and start:

```bash
npm run db:push
npm run dev
```

Edit `src/user-control/site-config.ts` to change the site name, branding, and auth providers.

---

## License

MIT — use it however you want. No attribution required (though always appreciated).
