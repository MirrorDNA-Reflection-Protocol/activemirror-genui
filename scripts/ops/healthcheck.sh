#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-${ACTIVEMIRROR_HEALTH_URL:-http://127.0.0.1:3456}}"
BASE_URL="${BASE_URL%/}"
PROMPT="${ACTIVEMIRROR_HEALTH_PROMPT:-Run the official Active Mirror demo.}"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

fail() {
  echo "FAIL $*" >&2
  exit 1
}

curl_code() {
  local method="$1"
  local url="$2"
  shift 2
  curl -sS --max-time "${ACTIVEMIRROR_HEALTH_TIMEOUT:-25}" \
    -o "$TMP_DIR/body" \
    -w "%{http_code}" \
    -X "$method" "$url" "$@"
}

root_code="$(curl_code GET "$BASE_URL/")"
[[ "$root_code" == "200" ]] || fail "root returned HTTP $root_code"

system_code="$(curl_code GET "$BASE_URL/api/mirror/system")"
[[ "$system_code" == "200" ]] || fail "system endpoint returned HTTP $system_code"
grep -q "Active Mirror public GenUI" "$TMP_DIR/body" || fail "system endpoint did not identify Active Mirror"

query_code="$(curl_code POST "$BASE_URL/api/mirror/query" \
  -H "content-type: application/json" \
  --data "{\"messages\":[{\"role\":\"user\",\"content\":\"$PROMPT\"}]}")"
[[ "$query_code" == "410" ]] || fail "legacy query endpoint returned HTTP $query_code instead of 410"

stream_code="$(curl_code POST "$BASE_URL/api/mirror/stream" \
  -H "content-type: application/json" \
  --data "{\"messages\":[{\"role\":\"user\",\"content\":\"$PROMPT\"}]}")"
[[ "$stream_code" == "200" ]] || fail "stream endpoint returned HTTP $stream_code"
grep -Eq '"envelope":"(surfaceUpdate|beginRendering|dataModelUpdate)"' "$TMP_DIR/body" || fail "stream endpoint did not emit generated workspace envelopes"

echo "OK $BASE_URL root=200 system=200 query=410 stream=200"
