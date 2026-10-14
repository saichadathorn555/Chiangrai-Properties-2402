import type { RouterClient } from "@orpc/server";
import { createApp } from "./__core/app";
import { ping } from "./routes/ping";
import { listings } from "./routes/listings";
import { inquiries } from "./routes/inquiries";
import { upload } from "./routes/upload";
import { mockup } from "./routes/mockup";
import { setup } from "./routes/setup";
import { auth } from "./auth";
import { newsletter } from "./routes/newsletter";
import { advisors } from "./routes/advisors";

export const router = {
  ping,
  listings,
  inquiries,
  upload,
  mockup,
  setup,
  newsletter,
  advisors,
};

export type AppRouter = typeof router;
export type AppRouterClient = RouterClient<AppRouter>;

const app = createApp(router);
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

export default app;
