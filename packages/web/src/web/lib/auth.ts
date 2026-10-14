import { createAuthClient } from "better-auth/react";

const TOKEN_KEY = "cr_admin_token";
export const getToken = () => localStorage.getItem(TOKEN_KEY) ?? "";

export const authClient = createAuthClient({
  baseURL: window.location.origin,
  basePath: "/api/auth",
  fetchOptions: {
    auth: { type: "Bearer", token: () => getToken() },
    onSuccess: (ctx) => {
      const token = ctx.response.headers.get("set-auth-token");
      if (token) localStorage.setItem(TOKEN_KEY, token);
    },
  },
});

export async function signOut() {
  await authClient.signOut();
  localStorage.removeItem(TOKEN_KEY);
}
