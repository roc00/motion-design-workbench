#!/bin/bash
# usage: extract.sh "<video file>" [sample_interval_sec] [scene_threshold]
set -e
VID="$1"; INT="${2:-1.5}"; THR="${3:-0.25}"
SRC="/Users/penn/Desktop/Dev/0915宣传视频测试材料/风格参考"
OUT="/Users/penn/Desktop/Dev/动效框架指南/analysis/contact-sheets"
slug=$(basename "$VID" | sed 's/\.[^.]*$//' | tr ' /' '__' | tr -cd '[:alnum:]_.一-龥～！，「」·@-')
dir="$OUT/$slug"; mkdir -p "$dir/frames"
if [ ! -f "$dir/done.sheets" ]; then
  DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$SRC/$VID")
  echo "$DUR" > "$dir/duration.txt"
  ffmpeg -nostdin -v info -i "$SRC/$VID" -filter:v "select='gt(scene,$THR)',showinfo" -an -f null - 2> "$dir/cuts.raw" || true
  grep -o 'pts_time:[0-9.]*' "$dir/cuts.raw" | sed 's/pts_time://' > "$dir/cuts.txt"; rm -f "$dir/cuts.raw"
  ffmpeg -nostdin -v error -i "$SRC/$VID" -vf "fps=1/$INT,scale=320:-2:flags=lanczos" -an -vsync 0 -q:v 4 "$dir/frames/f_%04d.jpg"
  # labeled sheets, 5 cols x 8 rows = 40 per sheet
  files=("$dir"/frames/f_*.jpg); n=40; total=${#files[@]}; sheets=$(( (total+n-1)/n ))
  for ((s=0; s<sheets; s++)); do
    args=(); for ((j=s*n; j<(s+1)*n && j<total; j++)); do
      sec=$(awk "BEGIN{printf \"%.1f\", $j*$INT}")
      args+=(-label "$sec s" "${files[$j]}")
    done
    magick montage "${args[@]}" -tile 5x8 -geometry 320x180+3+22 -background black -fill '#ffd23a' -pointsize 22 -set font "/System/Library/Fonts/Supplemental/Arial.ttf" "$dir/sheet_$(printf %02d $((s+1))).jpg"
  done
  rm -rf "$dir/frames"; touch "$dir/done.sheets"
fi
echo "=== $slug | dur $(cat "$dir/duration.txt")s | cuts $(wc -l < "$dir/cuts.txt" | tr -d ' ') | sheets $(ls "$dir"/sheet_*.jpg 2>/dev/null | wc -l | tr -d ' ') ==="
