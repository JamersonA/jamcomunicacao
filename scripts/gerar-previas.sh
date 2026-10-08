#!/usr/bin/env bash
# Prévias mudas e curtas do acervo (vão no git e no deploy): o mural se mexe mesmo antes do serviço de vídeo.
# Peça: 5 s a partir de 20% do vídeo, lado menor 360, sem áudio. Showreel: 14 s em 720p.
# Uso: bash scripts/gerar-previas.sh   (lê public/media/videos, gerado por comprimir-videos.sh)
set -u
cd "$(dirname "$0")/.."
OUT=public/previas
mkdir -p "$OUT"
for src in public/media/videos/*.mp4; do
  name=$(basename "${src%.*}")
  dst="$OUT/$name.mp4"
  [ -s "$dst" ] && continue
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$src")
  t=$(awk -v d="$dur" 'BEGIN{printf "%.2f", d*0.2}')
  ffmpeg -v error -y -ss "$t" -t 5 -i "$src" -an \
    -vf "scale='if(gt(iw,ih),-2,360)':'if(gt(iw,ih),360,-2)',fps=24" \
    -c:v libx264 -preset slow -crf 31 -pix_fmt yuv420p -profile:v main -movflags +faststart "$dst"
done
reel=public/media/videos/jam-portfolio-compilado-horizontal.mp4
[ -s "$OUT/showreel.mp4" ] || ffmpeg -v error -y -ss 3 -t 14 -i "$reel" -an \
  -vf "scale=-2:720,fps=30" -c:v libx264 -preset slow -crf 27 -pix_fmt yuv420p -movflags +faststart "$OUT/showreel.mp4"
[ -s "$OUT/showreel.jpg" ] || ffmpeg -v error -y -ss 3 -i "$reel" -frames:v 1 -vf "scale=-2:720" -q:v 4 "$OUT/showreel.jpg"
du -sh "$OUT"
