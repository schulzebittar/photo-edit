#!/bin/bash

cd "$(dirname "$0")/.."

echo "[" > images.json
first_set=true

for dir in img/comparison-sets/*/; do
  dir=${dir%/}
  set_id=$(basename "$dir")
  
  if [ "$first_set" = true ]; then
    first_set=false
  else
    echo "," >> images.json
  fi

  cat <<EOF >> images.json
  {
    "id": "$set_id",
    "title": "Campaign Sample $set_id",
    "photographer": "Photographer Name",
    "client": "Gas Bijoux",
    "images": [
EOF

  first_img=true
  for before_file in "$dir"/*_before.jpg; do
    [ -e "$before_file" ] || continue
    
    filename=$(basename "$before_file")
    img_id="${filename%_before.jpg}"

    if [ "$first_img" = true ]; then
      first_img=false
    else
      echo "," >> images.json
    fi

    cat <<EOF >> images.json
      {
        "id": "$img_id",
        "before": "img/comparison-sets/$set_id/${img_id}_before.jpg",
        "after": "img/comparison-sets/$set_id/${img_id}_after.jpg"
      }
EOF
  done

  echo "    ]" >> images.json
  echo "  }" >> images.json
done

echo "]" >> images.json