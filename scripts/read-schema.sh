#!/usr/bin/env bash
# Phase 2 helper: dump a Base table's fields (+ select options) and a few sample records.
# READ-ONLY. Usage: read-schema.sh <APP_TOKEN> <TABLE_ID> [field1 field2 ...]
set -euo pipefail
export LARK_CLI_NO_PROXY=1
APP="${1:?app_token}"; TBL="${2:?table_id}"; shift 2 || true
CLI=(npx --no-install @larksuite/cli)

echo "── auth ──"
"${CLI[@]}" auth status --jq '{user: .identities.user.userName, ready: .identities.user.available}' 2>/dev/null || true

echo; echo "── fields (type [opts] name) ──"
if ! FIELDS_OUT="$("${CLI[@]}" base +field-list --base-token "$APP" --table-id "$TBL" --as user \
  --jq '.data.fields[] | "\(.type)\t[opts:\(.options|length)]\t\(.name)"' 2>&1)"; then
  echo "!! field-list failed — check APP_TOKEN/TABLE_ID (a share 'shr...' token won't work here) and the auth status above:" >&2
  echo "$FIELDS_OUT" >&2
  exit 1
fi
echo "$FIELDS_OUT" | { grep -v '^{' || true; } | sort

echo; echo "── select field options ──"
"${CLI[@]}" base +field-list --base-token "$APP" --table-id "$TBL" --as user \
  --jq '.data.fields[] | select(.type=="select") | {name, options: (.options|map(.name))}' 2>/dev/null || true

if [ "$#" -gt 0 ]; then
  echo; echo "── sample rows for: $* ──"
  ARGS=(); for f in "$@"; do ARGS+=(--field-id "$f"); done
  "${CLI[@]}" base +record-list --base-token "$APP" --table-id "$TBL" --as user --limit 6 "${ARGS[@]}" --jq '.data.data'
fi
echo; echo "Done. Map these names into datalayer FIELDS (shortest stable prefix when suffixes vary)."
