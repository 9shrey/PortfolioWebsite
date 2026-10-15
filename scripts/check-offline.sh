#!/usr/bin/env bash
# Build, then fail if any shipped asset references a public CDN — the 3D
# scene must render with zero runtime network fetches (spec §14).
#
# Two known, inert matches are allowed:
#  - drei's Environment preset table (githack HDR URLs). Only fetched when a
#    `preset` prop is passed, which eslint.config bans in app/components/gl.
#  - onnxruntime-web's wasm path (jsdelivr) inside @huggingface/transformers,
#    used by the Jev voice widget's on-device Whisper — not the scene.
set -euo pipefail
cd "$(dirname "$0")/.."
[ "${SKIP_BUILD:-0}" = 1 ] || npx next build >/dev/null
fail=0
while IFS= read -r f; do
  if grep -q 'empty_warehouse_01_1k.hdr' "$f" && ! grep -vE 'drei-assets' <(grep -oE '(jsdelivr|githack|unpkg)[^"`]{0,80}' "$f") | grep -q .; then
    continue # drei preset table only
  fi
  if grep -q 'onnxruntime-web' "$f" && ! grep -vE 'onnxruntime-web' <(grep -oE '(jsdelivr|githack|unpkg)[^"`]{0,80}' "$f") | grep -q .; then
    continue # Jev's whisper runtime only
  fi
  echo "$f:"; grep -oE '.{40}(jsdelivr|githack|unpkg).{40}' "$f" | head -3
  fail=1
done < <(grep -rEl 'jsdelivr|githack|unpkg' .next/static || true)
[ "$fail" = 0 ] && echo "check-offline: OK — no unexpected CDN references in .next/static" || { echo "check-offline: unexpected CDN reference(s) above" >&2; exit 1; }
