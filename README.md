# bluesky-search

> **NOTE:** You should also just try calling Bluesky directly. It currently works without logging in:
> `curl 'https://api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=grand+army+plaza&limit=5'`
> This is undocumented and could stop working. `public.api.bsky.app` already returns `403` for search.

Simple API for searching Bluesky posts via the AT Protocol. Defaults to searching for "grand army plaza".

## Setup

```sh
bun install
cp .env.example .env
```

Fill in your `.env`:
- `BSKY_HANDLE` — your Bluesky handle (e.g. `you.bsky.social`)
- `BSKY_APP_PASSWORD` — create one at Bluesky → Settings → Privacy and Security → App Passwords

## Scripts

```sh
bun run dev    # dev server with auto-reload (port 4000)
bun run start  # production server
bun run check  # typecheck
bun run test   # live smoke tests against Bluesky (needs .env, no running server)
```

## API

### `GET /search`

| Param    | Default            | Description                  |
|----------|--------------------|------------------------------|
| `q`      | `grand army plaza` | Search query (Lucene syntax) |
| `sort`   | `top`              | `top` or `latest`            |
| `limit`  | `25`               | Results per page (1–100)     |
| `cursor` |                    | Pagination cursor            |
| `since`  |                    | ISO date, e.g. `2025-01-01`  |
| `until`  |                    | ISO date                     |

Response:

```json
{
  "posts": [
    {
      "uri": "at://did:plc:.../app.bsky.feed.post/...",
      "cid": "...",
      "url": "https://bsky.app/profile/handle/post/rkey",
      "text": "Post content...",
      "author": {
        "handle": "user.bsky.social",
        "displayName": "User Name",
        "avatar": "https://..."
      },
      "createdAt": "2025-03-20T12:00:00.000Z",
      "likeCount": 5,
      "repostCount": 1,
      "replyCount": 2
    }
  ],
  "cursor": "..."
}
```

Use `cursor` from the response to paginate: `/search?q=...&cursor=<cursor>`.

Bad input that Bluesky rejects (such as a malformed `cursor`) returns `400`. Bluesky outages return `502`.

### `GET /health`

Returns `{ "ok": true }`.
