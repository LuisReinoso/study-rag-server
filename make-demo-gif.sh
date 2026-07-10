#!/usr/bin/env bash
# Convierte una grabación (peek/ffmpeg: .gif/.mp4/.webm) en un demo.gif CUADRADO y
# optimizado para el README. Recorta al centro al lado más corto y escala.
# Uso: ./make-demo-gif.sh <input> [size=480] [fps=12]
set -euo pipefail
IN="${1:?uso: make-demo-gif.sh <input> [size] [fps]}"
SIZE="${2:-480}"; FPS="${3:-12}"; OUT="demo.gif"
PAL="$(mktemp --suffix=.png)"
VF="crop='min(iw,ih)':'min(iw,ih)',scale=${SIZE}:${SIZE}:flags=lanczos,fps=${FPS}"
ffmpeg -y -i "$IN" -vf "${VF},palettegen=max_colors=128" "$PAL" >/dev/null 2>&1
ffmpeg -y -i "$IN" -i "$PAL" -lavfi "${VF} [x]; [x][1:v] paletteuse=dither=bayer" "$OUT" >/dev/null 2>&1
rm -f "$PAL"
echo "generado $OUT (${SIZE}x${SIZE}, $(du -h "$OUT" | cut -f1))"
