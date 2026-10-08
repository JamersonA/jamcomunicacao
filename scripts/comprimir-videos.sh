#!/usr/bin/env bash
# Gera versões web do acervo: H.264 (lado maior até 1920), AAC, faststart, e poster .jpg.
# Uso: bash scripts/comprimir-videos.sh   (saída em public/media/, fora do git)
# Teto de 24 MiB por arquivo: o Worker do Cloudflare, onde os vídeos ficam, aceita até 25 MiB cada.
set -u
cd "$(dirname "$0")/.."
OUT=public/media
mkdir -p "$OUT/videos" "$OUT/posters"
for src in assets/videos/{portfolio,apresentacoes,sugestoes}/*; do
  name=$(basename "${src%.*}")
  dst="$OUT/videos/$name.mp4"
  [ -s "$dst" ] && continue
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$src")
  ffmpeg -v error -y -i "$src" \
    -vf "scale='if(gt(iw,ih),min(1920,iw),-2)':'if(gt(iw,ih),-2,min(1920,ih))',fps=30" \
    -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -profile:v high \
    -c:a aac -b:a 128k -ac 2 -movflags +faststart "$dst.tmp.mp4" && mv "$dst.tmp.mp4" "$dst"
  t=$(awk -v d="$dur" 'BEGIN{printf "%.2f", d*0.2}')
  ffmpeg -v error -y -ss "$t" -i "$dst" -frames:v 1 -vf "scale='if(gt(iw,ih),1280,720)':-2" -q:v 4 "$OUT/posters/$name.jpg"
  echo "ok $name $(du -h "$dst" | cut -f1)"
done
# O que passar do teto é refeito em duas passadas, com taxa calculada pela duração.
TETO=$((24 * 1048576))
for dst in "$OUT"/videos/*.mp4; do
  tam=$(stat -c %s "$dst")
  [ "$tam" -le "$TETO" ] && continue
  name=$(basename "${dst%.mp4}")
  src=$(ls assets/videos/{portfolio,apresentacoes,sugestoes}/"$name".* 2>/dev/null | head -1)
  [ -z "$src" ] && { echo "sem original: $name"; continue; }
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$src")
  kbps=$(awk -v d="$dur" 'BEGIN{printf "%d", (23 * 8 * 1048576 / d) / 1000 - 128 - 20}')
  vf="scale='if(gt(iw,ih),min(1920,iw),-2)':'if(gt(iw,ih),-2,min(1920,ih))',fps=30"
  log="$OUT/videos/$name-2pass"
  ffmpeg -v error -y -i "$src" -vf "$vf" -c:v libx264 -preset slow -b:v "${kbps}k" -pass 1 -passlogfile "$log" \
    -pix_fmt yuv420p -profile:v high -an -f mp4 /dev/null &&
  ffmpeg -v error -y -i "$src" -vf "$vf" -c:v libx264 -preset slow -b:v "${kbps}k" -pass 2 -passlogfile "$log" \
    -pix_fmt yuv420p -profile:v high -c:a aac -b:a 128k -ac 2 -movflags +faststart "$dst.tmp.mp4" &&
  mv "$dst.tmp.mp4" "$dst"
  rm -f "$log"*
  echo "teto $name ${kbps}k $(du -h "$dst" | cut -f1)"
done
echo FIM
