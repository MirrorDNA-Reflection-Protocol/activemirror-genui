#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-${ACTIVEMIRROR_HEALTH_URL:-http://127.0.0.1:3456}}"
BASE_URL="${BASE_URL%/}"
PROMPT="${ACTIVEMIRROR_HEALTH_PROMPT:-Run the Active Mirror product preview.}"
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
grep -q "Trust by Design" "$TMP_DIR/body" || fail "root did not expose Trust by Design marker"
grep -q "Show" "$TMP_DIR/body" || fail "root did not expose Show the work headline"
grep -q "Bring one AI workflow. Leave with a reviewable workspace" "$TMP_DIR/body" || fail "root did not expose current buyer-facing offer"
grep -q "Get the thing, not a chat transcript" "$TMP_DIR/body" || fail "root did not expose results section"
grep -q "Send data-sharing request to Vendor A" "$TMP_DIR/body" || fail "root did not expose approval gate demo"
grep -q "32-second walkthrough" "$TMP_DIR/body" || fail "root did not expose walkthrough video section"
grep -q "/media/show-the-work.mp4" "$TMP_DIR/body" || fail "root did not reference self-hosted walkthrough video"
grep -q "72-hour proof sprint" "$TMP_DIR/body" || fail "root did not expose proof sprint section"
grep -q "Pick the result you want first" "$TMP_DIR/body" || fail "root did not expose start section"

video_code="$(curl_code GET "$BASE_URL/media/show-the-work.mp4")"
[[ "$video_code" == "200" ]] || fail "walkthrough video returned HTTP $video_code"

mirror_code="$(curl_code GET "$BASE_URL/mirror")"
[[ "$mirror_code" == "200" ]] || fail "mirror route returned HTTP $mirror_code"
grep -q 'data-testid="work-os-stage"' "$TMP_DIR/body" || fail "mirror route did not expose Work OS stage"

for route in trust compare glass intake; do
  route_code="$(curl_code GET "$BASE_URL/$route")"
  [[ "$route_code" == "200" ]] || fail "$route route returned HTTP $route_code"
done

system_code="$(curl_code GET "$BASE_URL/api/mirror/system")"
[[ "$system_code" == "200" ]] || fail "system endpoint returned HTTP $system_code"
grep -q "Active Mirror public system" "$TMP_DIR/body" || fail "system endpoint did not identify Active Mirror"
grep -q "canonical_verifier" "$TMP_DIR/body" || fail "system endpoint did not expose canonical verifier status"

kernel_code="$(curl_code GET "$BASE_URL/api/mirror/kernel")"
[[ "$kernel_code" == "200" ]] || fail "kernel endpoint returned HTTP $kernel_code"
grep -q "MirrorKernel" "$TMP_DIR/body" || fail "kernel endpoint did not identify MirrorKernel"

body_receipt_code="$(curl_code GET "$BASE_URL/api/mirror/body-receipt")"
[[ "$body_receipt_code" == "200" ]] || fail "body receipt endpoint returned HTTP $body_receipt_code"
grep -q "body-receipt" "$TMP_DIR/body" || fail "body receipt endpoint did not expose receipt version"
grep -q "verificationMode" "$TMP_DIR/body" || fail "body receipt endpoint did not expose verification mode"

ratchet_code="$(curl_code GET "$BASE_URL/api/mirror/ratchet")"
[[ "$ratchet_code" == "200" ]] || fail "ratchet endpoint returned HTTP $ratchet_code"
grep -q "mirror-ratchet" "$TMP_DIR/body" || fail "ratchet endpoint did not expose ratchet version"
grep -q "frontierFailureCoverage" "$TMP_DIR/body" || fail "ratchet endpoint did not expose frontier failure coverage"

proof_ledger_code="$(curl_code GET "$BASE_URL/api/mirror/proof-ledger")"
[[ "$proof_ledger_code" == "200" ]] || fail "proof ledger endpoint returned HTTP $proof_ledger_code"
grep -q "proof-ledger" "$TMP_DIR/body" || fail "proof ledger endpoint did not expose ledger version"
grep -q "chainHead" "$TMP_DIR/body" || fail "proof ledger endpoint did not expose chain head"

contracts_code="$(curl_code GET "$BASE_URL/api/mirror/contracts")"
[[ "$contracts_code" == "200" ]] || fail "contracts endpoint returned HTTP $contracts_code"
grep -Eq "novelty-contract-registry|local-operator-contract-registry" "$TMP_DIR/body" || fail "contracts endpoint did not expose registry version"
grep -q "active-mirror-proof-ledger-export.schema.json" "$TMP_DIR/body" || fail "contracts endpoint did not expose proof ledger schema"
grep -q "active-mirror-decision-critique-stream.schema.json" "$TMP_DIR/body" || fail "contracts endpoint did not expose critique stream schema"
grep -q "active-mirror-local-operator-packet.schema.json" "$TMP_DIR/body" || fail "contracts endpoint did not expose local operator schema"

operator_code="$(curl_code GET "$BASE_URL/api/mirror/local-operator")"
[[ "$operator_code" == "200" ]] || fail "local operator endpoint returned HTTP $operator_code"
grep -q "local-operator-compiler" "$TMP_DIR/body" || fail "local operator endpoint did not expose compiler version"
grep -q "private_body_required" "$TMP_DIR/body" || fail "local operator endpoint did not expose private vault boundary"

model_health_code="$(curl_code GET "$BASE_URL/api/mirror/model-health")"
[[ "$model_health_code" == "200" ]] || fail "model health endpoint returned HTTP $model_health_code"
grep -q "active_mirror.model_health.v1" "$TMP_DIR/body" || fail "model health endpoint did not expose schema version"
grep -q "activePublicOrder" "$TMP_DIR/body" || fail "model health endpoint did not expose public route order"
grep -q "sensitiveRoute" "$TMP_DIR/body" || fail "model health endpoint did not expose sensitive route"

critique_code="$(curl_code GET "$BASE_URL/api/mirror/critique")"
[[ "$critique_code" == "200" ]] || fail "critique endpoint returned HTTP $critique_code"
grep -q "decision-critique" "$TMP_DIR/body" || fail "critique endpoint did not expose stream version"
grep -q "systemAdmission" "$TMP_DIR/body" || fail "critique endpoint did not expose system admissions"

revocation_code="$(curl_code GET "$BASE_URL/api/mirror/revocation-cascade")"
[[ "$revocation_code" == "200" ]] || fail "revocation cascade endpoint returned HTTP $revocation_code"
grep -q "revocation-cascade" "$TMP_DIR/body" || fail "revocation endpoint did not expose cascade version"
grep -q "downstreamEffect" "$TMP_DIR/body" || fail "revocation endpoint did not expose downstream effects"

identity_code="$(curl_code GET "$BASE_URL/api/mirror/identity-continuity")"
[[ "$identity_code" == "200" ]] || fail "identity continuity endpoint returned HTTP $identity_code"
grep -q "identity-continuity" "$TMP_DIR/body" || fail "identity endpoint did not expose continuity version"
grep -q "privateUserContinuityScore" "$TMP_DIR/body" || fail "identity endpoint did not expose private measurement boundary"

identity_measure_code="$(curl_code GET "$BASE_URL/api/mirror/identity-continuity/measure")"
[[ "$identity_measure_code" == "200" ]] || fail "identity continuity measure endpoint returned HTTP $identity_measure_code"
grep -q "identity-continuity-measure" "$TMP_DIR/body" || fail "identity measure endpoint did not expose scorer version"
grep -q "signed_model_swap_identity_receipt" "$TMP_DIR/body" || fail "identity measure endpoint did not expose receipt boundary"

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
