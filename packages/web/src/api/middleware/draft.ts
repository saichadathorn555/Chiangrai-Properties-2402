import { base } from "../__core/app";
import { auth } from "../auth";
import { ORPCError } from "@orpc/server";
import { COMING_SOON } from "../../site-mode";

/** Don't expose draft listings or paid AI/upload tools while the launch page is public. */
export const draft = base.use(async ({ context, next }) => {
  if (COMING_SOON) {
    const session = await auth.api.getSession({ headers: context.headers });
    if (!session) throw new ORPCError("UNAUTHORIZED");
  }
  return next();
});