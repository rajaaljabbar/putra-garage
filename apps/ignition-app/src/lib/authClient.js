import { createAuthClient } from "better-auth/react";

// In production (Vercel), auth is on the same domain; in dev, use localhost
const baseURL = import.meta.env.PROD ? window.location.origin : "http://localhost:5000";

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: "include",
  },
  providers: ["google"],
});
