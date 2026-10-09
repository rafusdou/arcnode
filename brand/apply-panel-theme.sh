#!/bin/bash
# Applies the Changuihost branding to the Pterodactyl panel. Run inside WSL:
#   sudo bash brand/apply-panel-theme.sh
#
# - The panel's accent color ("primary") is Tailwind's blue, hardcoded in ~80
#   places across its compiled JS/CSS, so a stylesheet can't reach all of it.
#   This rewrites those values to Changuihost yellow, shade by shade, and makes
#   the text on primary buttons dark (it's near-white, unreadable on yellow).
# - Puts our logo and favicons in place.
#
# Rerun it after updating the panel image: asset file names change with every
# panel version, and the themed copy is mounted over the originals.
set -euo pipefail

BRAND_DIR="$(cd "$(dirname "$0")" && pwd)"
PANEL_DIR=/srv/pterodactyl/panel
IMAGE=ghcr.io/pterodactyl/panel:latest
LOGO="$BRAND_DIR/changuihost-logo.svg"

TMP=$(mktemp -d)
docker run --rm --entrypoint tar "$IMAGE" -C /app/public -c assets | tar -x -C "$TMP"

find "$TMP/assets" -type f \( -name '*.js' -o -name '*.css' \) -exec sed -i \
  -e 's/239, 246, 255/30, 21, 3/g' \
  -e 's/191, 219, 254/251, 230, 178/g' \
  -e 's/147, 197, 253/248, 214, 132/g' \
  -e 's/96, 165, 250/245, 197, 90/g' \
  -e 's/59, 130, 246/242, 179, 61/g' \
  -e 's/37, 99, 235/217, 154, 34/g' \
  -e 's/29, 78, 216/179, 124, 18/g' \
  -e 's/30, 64, 175/138, 95, 13/g' \
  -e 's/#2563eb/#d99a22/gI' \
  {} +

cp "$LOGO" "$TMP/assets/svgs/pterodactyl.svg"
rm -rf "$PANEL_DIR/assets-themed"
mv "$TMP/assets" "$PANEL_DIR/assets-themed"
chmod -R a+rX "$PANEL_DIR/assets-themed"
rm -rf "$TMP"

F="$PANEL_DIR/favicons"
for s in 16 32 96; do
  rsvg-convert -w "$s" -h "$s" "$LOGO" -o "$F/favicon-${s}x${s}.png"
done
rsvg-convert -w 48 -h 48 "$LOGO" -o /tmp/changuihost-fav48.png
convert "$F/favicon-16x16.png" "$F/favicon-32x32.png" /tmp/changuihost-fav48.png "$F/favicon.ico"
# iOS home screen icons need a solid background.
rsvg-convert -w 140 -h 140 "$LOGO" -o /tmp/changuihost-apple.png
convert -size 180x180 xc:'#111110' /tmp/changuihost-apple.png -gravity center -composite "$F/apple-touch-icon.png"
# Safari pinned tabs only use the shape.
sed -e 's/fill="#[0-9A-Fa-f]\{6\}"/fill="#000"/g' -e 's/stroke="#5A3D00"/stroke="#fff"/' "$LOGO" > "$F/safari-pinned-tab.svg"
rm -f /tmp/changuihost-fav48.png /tmp/changuihost-apple.png

left=$(grep -rl '59, 130, 246' "$PANEL_DIR/assets-themed" | wc -l || true)
echo "Listo. Archivos que todavía tienen el azul original: $left (tiene que ser 0)"
