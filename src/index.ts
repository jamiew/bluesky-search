import { XRPCError } from "@atproto/api";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { searchPosts } from "./bsky.ts";

export const app = new Hono()
  .use("*", cors())
  .get("/health", (c) => c.json({ ok: true }))
  .get("/search", async (c) => {
    const q = c.req.query("q")?.trim() || "grand army plaza";
    const sort = c.req.query("sort") === "latest" ? "latest" : "top";
    const limit = Math.min(Math.max(Number(c.req.query("limit")) || 25, 1), 100);
    const cursor = c.req.query("cursor");
    const since = c.req.query("since");
    const until = c.req.query("until");

    try {
      const results = await searchPosts(q, { sort, limit, cursor, since, until });
      return c.json(results, 200);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Search failed:", message);
      // Bluesky rejected our input (bad cursor, date, etc.) vs. Bluesky itself failing.
      const status = err instanceof XRPCError ? (err.status === 400 ? 400 : 502) : 500;
      return c.json({ error: message }, status);
    }
  });

const port = Number(process.env.PORT) || 4000;
if (import.meta.main) console.log(`Listening on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
