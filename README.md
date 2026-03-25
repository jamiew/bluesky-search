# bluesky-search

Simple API for searching Bluesky posts. Defaults to searching for "grand army plaza".

## Setup

```sh
bun install
cp .env.example .env
# fill in BSKY_HANDLE and BSKY_APP_PASSWORD
```

Create an App Password at: Bluesky → Settings → Privacy and Security → App Passwords

## Scripts

```sh
bun run dev    # dev server with auto-reload (port 4000)
bun run start  # production server
bun run check  # typecheck
bun run test   # curl-based smoke tests (server must be running)
```

## API

### `GET /search`

| Param    | Default              | Description                  |
|----------|----------------------|------------------------------|
| `q`      | `grand army plaza`   | Search query (Lucene syntax) |
| `sort`   | `top`                | `top` or `latest`            |
| `limit`  | `25`                 | Results per page (max 100)   |
| `cursor` |                      | Pagination cursor            |
| `since`  |                      | ISO date, e.g. `2025-01-01`  |
| `until`  |                      | ISO date                     |

### `GET /health`

Returns `{ "ok": true }`.
