import { AtpAgent, AppBskyFeedPost, AtUri } from "@atproto/api";

const agent = new AtpAgent({ service: "https://bsky.social" });
let authPromise: Promise<void> | null = null;

function ensureAuth(): Promise<void> {
  if (agent.hasSession) return Promise.resolve();
  if (authPromise) return authPromise;
  authPromise = (async () => {
    const handle = process.env.BSKY_HANDLE;
    const password = process.env.BSKY_APP_PASSWORD;
    if (!handle || !password) {
      throw new Error("BSKY_HANDLE and BSKY_APP_PASSWORD must be set in .env");
    }
    await agent.login({ identifier: handle, password });
  })().catch((err) => {
    authPromise = null;
    throw err;
  });
  return authPromise;
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

  const res = await agent.app.bsky.feed.searchPosts({ q: query, ...opts });

  const posts = res.data.posts.map((post) => {
    const record = AppBskyFeedPost.isRecord(post.record) ? post.record : undefined;
    const rkey = new AtUri(post.uri).rkey;
    return {
      uri: post.uri,
      cid: post.cid,
      url: `https://bsky.app/profile/${post.author.handle}/post/${rkey}`,
      text: record?.text ?? "",
      author: {
        handle: post.author.handle,
        displayName: post.author.displayName ?? post.author.handle,
        avatar: post.author.avatar,
      },
      createdAt: record?.createdAt ?? post.indexedAt,
      likeCount: post.likeCount ?? 0,
      repostCount: post.repostCount ?? 0,
      replyCount: post.replyCount ?? 0,
    };
  });

  return { posts, cursor: res.data.cursor };
}
