import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins";
import { db } from "@/engine/db/client";
import * as schema from "@/engine/db/schema";
import { siteConfig } from "@/user-control/site-config";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  appName: siteConfig.name,
  baseURL: siteConfig.url,

  emailAndPassword: {
    enabled: siteConfig.auth.providers.emailPassword,
    requireEmailVerification: siteConfig.auth.requireEmailVerification,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    sendResetPassword: async ({ user, url }) => {
      console.log(`[Email Mock] Reset password for ${user.email}: ${url}`);
    },
    resetPasswordTokenExpiresIn: 3600,
    revokeSessionsOnPasswordReset: true,
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      console.log(`[Email Mock] Verify email for ${user.email}: ${url}`);
    },
  },

  // Only registered when both the feature flag is on AND real credentials
  // are present — avoids Better Auth's noisy "missing clientId/clientSecret"
  // warning firing on every request when a provider is toggled on but its
  // .env keys aren't filled in yet.
  socialProviders: {
    ...(siteConfig.auth.providers.google &&
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET && {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          scope: ["email", "profile"],
        },
      }),
    ...(siteConfig.auth.providers.github &&
      process.env.GITHUB_CLIENT_ID &&
      process.env.GITHUB_CLIENT_SECRET && {
        github: {
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          scope: ["user:email"],
        },
      }),
  },

  session: {
    expiresIn: siteConfig.auth.sessionExpiresIn,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },

  user: {
    additionalFields: {
      role: { type: "string" as const, defaultValue: "user", input: false },
      banned: { type: "boolean" as const, defaultValue: false, input: false },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        console.log(`[Email Mock] Delete account for ${user.email}: ${url}`);
      },
    },
  },

  account: {
    accountLinking: { enabled: true, trustedProviders: ["google", "github"] },
  },

  plugins: [
    nextCookies(),
    ...(siteConfig.auth.providers.magicLink
      ? [
          magicLink({
            sendMagicLink: async ({ email, url }) => {
              console.log(`[Email Mock] Magic link for ${email}: ${url}`);
            },
          }),
        ]
      : []),
  ],

  trustedOrigins: [
    siteConfig.url,
    ...(process.env.NODE_ENV !== "production" ? ["http://localhost:3000"] : []),
  ],

  rateLimit: { enabled: true, window: 60, max: 20, storage: "memory" as const },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
