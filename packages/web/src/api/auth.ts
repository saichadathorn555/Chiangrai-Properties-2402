import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { APIError } from "better-auth/api";
import { count } from "drizzle-orm";
import { db } from "./database";
import { user } from "./database/auth-schema";

export const auth = betterAuth({
  basePath: "/api/auth",
  baseURL: process.env.WEBSITE_URL,
  database: drizzleAdapter(db, { provider: "sqlite" }),
  emailAndPassword: { enabled: true },
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: (request) => {
    const origin = request?.headers.get("origin");
    return origin ? [origin] : ["*"];
  },
  databaseHooks: {
    user: {
      create: {
        // Only the very first account (the owner) may be created.
        before: async (data) => {
          const [row] = await db.select({ n: count() }).from(user);
          if ((row?.n ?? 0) > 0) {
            throw new APIError("FORBIDDEN", { message: "Registration is closed." });
          }
          return { data };
        },
      },
    },
  },
  plugins: [bearer()],
});
