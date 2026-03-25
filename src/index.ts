import { Hono } from "hono";
import { cors } from "hono/cors";
import { searchPosts } from "./bsky.ts";

const app = new Hono();

app.use("*", cors());

app.get("/health", (c) => c.json({ ok: true }));

app.get("/search", async (c) => {
  const q = c.req.query("q") ?? "grand army plaza";
  const sort = c.req.query("sort") === "latest" ? "latest" : "top";
  const limit = Math.min(Number(c.req.query("limit")) || 25, 100);
  const cursor = c.req.query("cursor");
  const since = c.req.query("since");
  const until = c.req.query("until");

  try {
    const results = await searchPosts(q, { sort, limit, cursor, since, until });
    return c.json(results);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Search failed:", message);
    return c.json({ error: message }, 500);
  }
});

const port = Number(process.env.PORT) || 4000;
console.log(`Listening on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
