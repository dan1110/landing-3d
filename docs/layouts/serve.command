#!/bin/zsh
# Double-click to preview the layout mockups. They load real photos, so they need a local server (file:// will not work).
cd "$(dirname "$0")"
( sleep 1; open "http://127.0.0.1:4190/" ) &
python3 -m http.server 4190 --bind 127.0.0.1
