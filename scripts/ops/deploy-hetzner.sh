#!/usr/bin/env bash
set -euo pipefail

HOST="${ACTIVEMIRROR_DEPLOY_HOST:-hetzner}"
APP_NAME="${ACTIVEMIRROR_APP_NAME:-activemirror-genui}"
REMOTE_USER="${ACTIVEMIRROR_REMOTE_USER:-sysadmin}"
REMOTE_ROOT="${ACTIVEMIRROR_REMOTE_ROOT:-/opt/activemirror-genui-releases}"
CURRENT_LINK="${ACTIVEMIRROR_CURRENT_LINK:-/opt/activemirror-genui-current}"
LEGACY_ROOT="${ACTIVEMIRROR_LEGACY_ROOT:-/opt/activemirror-genui}"
PORT="${ACTIVEMIRROR_PORT:-3456}"
CANARY_PORT="${ACTIVEMIRROR_CANARY_PORT:-3457}"
INSTANCES="${ACTIVEMIRROR_INSTANCES:-2}"
REPO_URL="${ACTIVEMIRROR_REPO_URL:-https://github.com/MirrorDNA-Reflection-Protocol/activemirror-genui.git}"
DEFAULT_REF="$(git symbolic-ref --quiet --short HEAD 2>/dev/null || echo main)"
REF="${ACTIVEMIRROR_REF:-$DEFAULT_REF}"

echo "Deploying $APP_NAME from $REPO_URL ref $REF"

# Values are intentionally expanded locally, then passed as a constrained remote environment.
# shellcheck disable=SC2029
ssh "$HOST" \
  "APP_NAME='$APP_NAME' REMOTE_USER='$REMOTE_USER' REMOTE_ROOT='$REMOTE_ROOT' CURRENT_LINK='$CURRENT_LINK' LEGACY_ROOT='$LEGACY_ROOT' PORT='$PORT' CANARY_PORT='$CANARY_PORT' INSTANCES='$INSTANCES' REPO_URL='$REPO_URL' REF='$REF' bash -s" <<'REMOTE'
set -euo pipefail

if [ "$(id -u)" -eq 0 ]; then
  SUDO=()
else
  SUDO=(sudo -n)
fi

root_exec() {
  "${SUDO[@]}" "$@"
}

run_as_app() {
  if [ "$(id -un)" = "$REMOTE_USER" ]; then
    bash -lc "$1"
  elif [ "$(id -u)" -eq 0 ]; then
    runuser -l "$REMOTE_USER" -c "$1"
  else
    sudo -n -u "$REMOTE_USER" bash -lc "$1"
  fi
}

release_id="$(date -u +%Y%m%dT%H%M%SZ)-$(git ls-remote "$REPO_URL" "$REF" | awk '{print substr($1,1,12)}')"
release_dir="$REMOTE_ROOT/$release_id"

root_exec mkdir -p "$REMOTE_ROOT"
root_exec chown "$REMOTE_USER:$REMOTE_USER" "$REMOTE_ROOT"

run_as_app "git clone --depth 1 --branch '$REF' '$REPO_URL' '$release_dir'"

for env_file in .env .env.local; do
  if [ -f "$LEGACY_ROOT/$env_file" ]; then
    root_exec install -m "$(stat -c '%a' "$LEGACY_ROOT/$env_file")" -o "$REMOTE_USER" -g "$REMOTE_USER" "$LEGACY_ROOT/$env_file" "$release_dir/$env_file"
  fi
done

run_as_app "cd '$release_dir' && npm ci"
run_as_app "cd '$release_dir' && npm run build"

if ss -ltn "sport = :$CANARY_PORT" | grep -q LISTEN; then
  for candidate in 3460 3461 3462 3463 3464 3465 3466 3467 3468 3469; do
    if ! ss -ltn "sport = :$candidate" | grep -q LISTEN; then
      CANARY_PORT="$candidate"
      break
    fi
  done
fi

if ss -ltn "sport = :$CANARY_PORT" | grep -q LISTEN; then
  echo "No free canary port found; last checked $CANARY_PORT" >&2
  exit 1
fi

run_as_app "pm2 delete '${APP_NAME}-canary' >/dev/null 2>&1 || true"
run_as_app "cd '$release_dir' && PORT='$CANARY_PORT' NODE_ENV=production pm2 start node_modules/next/dist/bin/next --name '${APP_NAME}-canary' --time -i 1 --max-memory-restart 768M -- start -p '$CANARY_PORT' --hostname 127.0.0.1"
cleanup_canary() {
  run_as_app "pm2 delete '${APP_NAME}-canary' >/dev/null 2>&1 || true"
}
trap cleanup_canary EXIT
sleep 5
run_as_app "cd '$release_dir' && ACTIVEMIRROR_HEALTH_URL='http://127.0.0.1:$CANARY_PORT' bash scripts/ops/healthcheck.sh"
run_as_app "pm2 delete '${APP_NAME}-canary'"
trap - EXIT

root_exec ln -sfn "$release_dir" "$CURRENT_LINK"
root_exec chown -h "$REMOTE_USER:$REMOTE_USER" "$CURRENT_LINK"

run_as_app "pm2 delete '$APP_NAME' >/dev/null 2>&1 || true"
run_as_app "cd '$CURRENT_LINK' && PORT='$PORT' ACTIVEMIRROR_GENUI_INSTANCES='$INSTANCES' ACTIVEMIRROR_GENUI_ROOT='$CURRENT_LINK' pm2 start ecosystem.config.cjs --only '$APP_NAME' --update-env"

sleep 5
run_as_app "cd '$CURRENT_LINK' && ACTIVEMIRROR_HEALTH_URL='http://127.0.0.1:$PORT' bash scripts/ops/healthcheck.sh"
run_as_app "pm2 save"

old_releases="$(find "$REMOTE_ROOT" -mindepth 1 -maxdepth 1 -type d | sort | head -n -5 || true)"
if [ -n "$old_releases" ]; then
  printf '%s\n' "$old_releases" | xargs -r "${SUDO[@]}" rm -rf
fi

echo "DEPLOYED $APP_NAME $release_id"
REMOTE
