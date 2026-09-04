import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";
import { siteConfig } from "@/user-control/site-config";

// baseURL is intentionally omitted — Better Auth's client defaults to
// window.location.origin, which is correct for this same-origin app and
// avoids an entire class of bugs where auth silently fails on every method
// because a fragile env-derived value pointed at the wrong origin.
export const authClient = createAuthClient({
  plugins: siteConfig.auth.providers.magicLink ? [magicLinkClient()] : [],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
