import { AtpAgent } from "@atproto/api";

const agent = new AtpAgent({ service: "https://bsky.social" });
let authenticated = false;

async function ensureAuth() {
  if (authenticated) return;
  const handle = process.env.BSKY_HANDLE;
  const password = process.env.BSKY_APP_PASSWORD;
  if (!handle || !password) {
    throw new Error("BSKY_HANDLE and BSKY_APP_PASSWORD must be set in .env");
  }
  await agent.login({ identifier: handle, password });
  authenticated = true;
}

export interface SearchOpts {
  sort?: "top" | "latest";
  limit?: number;
  cursor?: string;
  since?: string;
  until?: string;
}

export async function searchPosts(query: string, opts: SearchOpts = {}) {
  await ensureAuth();

  const res = await agent.app.bsky.feed.searchPosts({
    q: query,
    sort: opts.sort ?? "top",
    limit: Math.min(opts.limit ?? 25, 100),
    cursor: opts.cursor,
    since: opts.since,
    until: opts.until,
  });

  const posts = res.data.posts.map((post) => {
    const record = post.record as { text?: string; createdAt?: string };
    return {
      uri: post.uri,
      cid: post.cid,
      url: `https://bsky.app/profile/${post.author.handle}/post/${post.uri.split("/").pop()}`,
      text: record.text ?? "",
      author: {
        handle: post.author.handle,
        displayName: post.author.displayName ?? post.author.handle,
        avatar: post.author.avatar,
      },
      createdAt: record.createdAt,
      likeCount: post.likeCount ?? 0,
      repostCount: post.repostCount ?? 0,
      replyCount: post.replyCount ?? 0,
    };
  });

  return { posts, cursor: res.data.cursor };
}
