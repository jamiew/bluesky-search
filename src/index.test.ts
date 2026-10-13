// Live smoke tests: these call the real Bluesky API with the credentials in .env.
import { expect, test } from "bun:test";
import { testClient } from "hono/testing";
import { app } from "./index.ts";

const client = testClient(app);

async function search(query: Record<string, string>) {
  const res = await client.search.$get({ query });
  if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}: ${await res.text()}`);
  return res.json();
}

test("health", async () => {
  expect(await (await client.health.$get()).json()).toEqual({ ok: true });
});

test("default search returns posts in the documented shape", async () => {
  const { posts } = await search({ limit: "3" });
  expect(posts.length).toBeGreaterThan(0);
  expect(posts[0]).toMatchObject({
    uri: expect.stringMatching(/^at:\/\//),
    url: expect.stringMatching(/^https:\/\/bsky\.app\/profile\//),
    text: expect.any(String),
    author: { handle: expect.any(String), displayName: expect.any(String) },
    createdAt: expect.any(String),
    likeCount: expect.any(Number),
  });
});

test("cursor fetches the next page", async () => {
  const first = await search({ sort: "latest", limit: "2" });
  expect(first.cursor).toBeString();
  const second = await search({ sort: "latest", limit: "2", cursor: first.cursor ?? "" });
  expect(second.posts[0]?.uri).not.toBe(first.posts[0]?.uri);
});

test("out-of-range limits are clamped instead of failing", async () => {
  await search({ limit: "-5" });
  const { posts } = await search({ limit: "1000" });
  expect(posts.length).toBeLessThanOrEqual(100);
});

test("bad input from the caller is a 400, not a 500", async () => {
  const res = await client.search.$get({ query: { cursor: "garbage" } });
  expect(res.status).toBe(400);
});
