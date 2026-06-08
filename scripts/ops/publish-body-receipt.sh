#!/usr/bin/env bash
set -euo pipefail

RECEIPT_FILE="${1:-${MIRROR_BODY_RECEIPT_FILE:-}}"
TARGET_URL="${MIRROR_BODY_RECEIPT_URL:-https://activemirror.ai/api/mirror/body-receipt}"
TOKEN="${MIRROR_BODY_RECEIPT_TOKEN:-${MIRROR_BODY_SYNC_TOKEN:-}}"

fail() {
  echo "FAIL $*" >&2
  exit 1
}

[[ -n "$RECEIPT_FILE" ]] || fail "usage: MIRROR_BODY_RECEIPT_TOKEN=... $0 /path/to/public-safe-receipt.json"
[[ -f "$RECEIPT_FILE" ]] || fail "receipt file not found"
[[ -n "$TOKEN" ]] || fail "MIRROR_BODY_RECEIPT_TOKEN or MIRROR_BODY_SYNC_TOKEN is required"

response_file="$(mktemp)"
trap 'rm -f "$response_file"' EXIT

code="$(
  curl -sS \
    --max-time "${MIRROR_BODY_RECEIPT_TIMEOUT:-25}" \
    -o "$response_file" \
    -w "%{http_code}" \
    -X POST "$TARGET_URL" \
    -H "authorization: Bearer $TOKEN" \
    -H "content-type: application/json" \
    --data-binary "@$RECEIPT_FILE"
)"

if [[ "$code" != "200" ]]; then
  cat "$response_file" >&2
  fail "body receipt publish returned HTTP $code"
fi

cat "$response_file"
