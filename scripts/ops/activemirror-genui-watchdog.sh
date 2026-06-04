#!/usr/bin/env bash
set -u

APP_NAME="${ACTIVEMIRROR_APP_NAME:-activemirror-genui}"
APP_USER="${ACTIVEMIRROR_APP_USER:-sysadmin}"
APP_ROOT="${ACTIVEMIRROR_APP_ROOT:-/opt/activemirror-genui-current}"
APP_PORT="${ACTIVEMIRROR_APP_PORT:-3456}"
CADDY_CONFIG="${ACTIVEMIRROR_CADDY_CONFIG:-/etc/caddy/Caddyfile}"
RECEIPT="${ACTIVEMIRROR_WATCHDOG_RECEIPT:-/var/log/activemirror-genui-watchdog.jsonl}"
HEALTH_URL="http://127.0.0.1:${APP_PORT}"
ISSUES=()
ACTIONS=()
STATUS="ok"

record_issue() {
  ISSUES+=("$1")
  STATUS="repair_attempted"
}

record_action() {
  ACTIONS+=("$1")
}

as_app_user() {
  runuser -l "$APP_USER" -c "$1"
}

pm2_online() {
  as_app_user '/usr/bin/pm2 jlist' 2>/dev/null | APP_NAME="$APP_NAME" /usr/bin/python3 -c '
import json, sys
import os
target = os.environ["APP_NAME"]
try:
    rows = json.load(sys.stdin)
except Exception:
    sys.exit(1)
for row in rows:
    if row.get("name") == target and row.get("pm2_env", {}).get("status") == "online":
        sys.exit(0)
sys.exit(1)
'
}

start_or_reload_pm2_app() {
  record_action "pm2_start_or_reload_${APP_NAME}"
  if [ -f "$APP_ROOT/ecosystem.config.cjs" ]; then
    as_app_user "cd '$APP_ROOT' && PORT='$APP_PORT' ACTIVEMIRROR_GENUI_ROOT='$APP_ROOT' /usr/bin/pm2 startOrReload ecosystem.config.cjs --only '$APP_NAME' --update-env" >/dev/null 2>&1 || true
  else
    as_app_user "/usr/bin/pm2 restart '$APP_NAME' --update-env || /usr/bin/pm2 resurrect" >/dev/null 2>&1 || true
  fi
}

run_healthcheck() {
  if [ -x "$APP_ROOT/scripts/ops/healthcheck.sh" ]; then
    as_app_user "cd '$APP_ROOT' && ACTIVEMIRROR_HEALTH_URL='$HEALTH_URL' bash scripts/ops/healthcheck.sh" >/dev/null 2>&1
  else
    curl -fsS --max-time 5 "$HEALTH_URL/" >/dev/null
  fi
}

validate_caddy_config() {
  local log_path="$1"
  caddy validate --config "$CADDY_CONFIG" >"$log_path" 2>&1
}

repair_stock_caddy_config() {
  local log_path="$1"
  if ! grep -Eq "http\\.encoders\\.br|unrecognized directive: rate_limit" "$log_path"; then
    return 1
  fi

  record_action "backup_caddyfile_before_stock_binary_sanitize"
  cp "$CADDY_CONFIG" "${CADDY_CONFIG}.watchdog-bak-$(date -u +%Y%m%dT%H%M%SZ)" || return 1

  record_action "sanitize_caddyfile_for_stock_binary"
  /usr/bin/python3 - "$CADDY_CONFIG" <<'PY'
import sys
from pathlib import Path

path = Path(sys.argv[1])
lines = path.read_text(encoding="utf-8").splitlines(keepends=True)
out = []
i = 0
while i < len(lines):
    line = lines[i]
    stripped = line.lstrip()
    if stripped.startswith("rate_limit") and stripped.rstrip().endswith("{"):
        depth = line.count("{") - line.count("}")
        i += 1
        while i < len(lines) and depth > 0:
            depth += lines[i].count("{") - lines[i].count("}")
            i += 1
        continue
    line = line.replace("encode br zstd gzip", "encode zstd gzip")
    line = line.replace("encode zstd br gzip", "encode zstd gzip")
    line = line.replace("encode br gzip", "encode gzip")
    out.append(line)
    i += 1
path.write_text("".join(out), encoding="utf-8")
PY
}

ensure_caddy_config_valid() {
  local log_path
  log_path="$(mktemp)"
  if validate_caddy_config "$log_path"; then
    rm -f "$log_path"
    return 0
  fi

  record_issue "caddy_config_invalid"
  if repair_stock_caddy_config "$log_path"; then
    if validate_caddy_config "$log_path"; then
      record_action "caddy_config_repaired"
      rm -f "$log_path"
      return 0
    fi
  fi

  record_issue "caddy_config_unrepaired"
  rm -f "$log_path"
  return 1
}

restart_caddy_if_config_valid() {
  local action="$1"
  if ensure_caddy_config_valid; then
    record_action "$action"
    systemctl restart caddy >/dev/null 2>&1 || true
    sleep 2
  fi
}

if ! pm2_online; then
  record_issue "pm2_${APP_NAME}_not_online"
  start_or_reload_pm2_app
  sleep 3
fi

if ! run_healthcheck; then
  record_issue "local_nextjs_${APP_PORT}_unhealthy"
  start_or_reload_pm2_app
  sleep 5
fi

if ! systemctl is-active --quiet caddy; then
  record_issue "caddy_inactive"
  restart_caddy_if_config_valid "restart_caddy"
fi

if ! curl -fsS --max-time 8 --resolve genui.activemirror.ai:443:127.0.0.1 -k https://genui.activemirror.ai/ >/dev/null; then
  record_issue "local_caddy_genui_https_unhealthy"
  restart_caddy_if_config_valid "restart_caddy_after_https_probe"
fi

check_tunnel_ready() {
  local service="$1"
  local port="$2"
  local body
  if ! systemctl is-active --quiet "$service"; then
    record_issue "${service}_inactive"
    record_action "restart_${service}"
    systemctl restart "$service" >/dev/null 2>&1 || true
    sleep 3
  fi
  body="$(curl -fsS --max-time 5 "http://127.0.0.1:${port}/ready" 2>/dev/null || true)"
  if ! READY_BODY="$body" /usr/bin/python3 - <<'PY'
import json, os, sys
try:
    data = json.loads(os.environ.get("READY_BODY", ""))
except Exception:
    sys.exit(1)
sys.exit(0 if data.get("status") == 200 and int(data.get("readyConnections", 0)) >= 2 else 1)
PY
  then
    record_issue "${service}_not_ready"
    record_action "restart_${service}_not_ready"
    systemctl restart "$service" >/dev/null 2>&1 || true
    sleep 3
  fi
}

check_tunnel_ready "cloudflared-activemirror-genui.service" "20248"
check_tunnel_ready "cloudflared-lexedge-backup.service" "20249"

if ! pm2_online || ! run_healthcheck; then
  STATUS="degraded"
fi

/usr/bin/python3 - "$RECEIPT" "$STATUS" "${ISSUES[*]-}" "${ACTIONS[*]-}" <<'PY'
import json, sys
from datetime import datetime, timezone

path, status, issues, actions = sys.argv[1:5]
payload = {
    "ts": datetime.now(timezone.utc).isoformat(),
    "service": "activemirror-genui-watchdog",
    "status": status,
    "issues": [x for x in issues.split() if x],
    "actions": [x for x in actions.split() if x],
}
with open(path, "a", encoding="utf-8") as f:
    f.write(json.dumps(payload, sort_keys=True) + "\n")
print(json.dumps(payload, sort_keys=True))
PY
