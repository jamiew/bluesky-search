#!/usr/bin/env bash
set -euo pipefail

BASE="http://localhost:4000"

echo "=== Health check ==="
curl -sf "$BASE/health" | jq .
echo

echo "=== Default search (grand army plaza, top) ==="
res=$(curl -sf "$BASE/search")
echo "$res" | jq '{count: (.posts | length), cursor: .cursor}'
echo "$res" | jq '.posts[0] | {text, author: .author.handle, url, likeCount, createdAt}'
echo

echo "=== Latest, limit 3 ==="
res=$(curl -sf "$BASE/search?q=grand+army+plaza&sort=latest&limit=3")
echo "$res" | jq '.posts | length'
echo "$res" | jq '.posts[] | {text: .text[0:80], author: .author.handle, createdAt}'
echo

echo "=== Validate shape ==="
curl -sf "$BASE/search?limit=1" | jq -e '
  .posts[0]
  | has("uri", "cid", "url", "text", "author", "createdAt", "likeCount", "repostCount", "replyCount")
' > /dev/null && echo "PASS: post shape valid" || echo "FAIL: unexpected post shape"

curl -sf "$BASE/search?limit=1" | jq -e '
  .posts[0].author
  | has("handle", "displayName", "avatar")
' > /dev/null && echo "PASS: author shape valid" || echo "FAIL: unexpected author shape"

echo
echo "Done."
