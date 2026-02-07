#!/bin/bash
# Build novels manifest.json from _data/ directory
# Usage: ./scripts/build-novels-manifest.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(dirname "$SCRIPT_DIR")"
BLOG_ROOT="$WORKSPACE_ROOT/eastsea-blog"
DATA_DIR="$BLOG_ROOT/novels/_data"
OUTPUT_FILE="$BLOG_ROOT/novels/manifest.json"

echo "🔍 Scanning $DATA_DIR for episodes..."

if [ ! -d "$DATA_DIR" ]; then
    echo "❌ Error: Data directory not found: $DATA_DIR"
    exit 1
fi

# Function to get novel metadata
get_novel_metadata() {
    local slug="$1"
    local field="$2"
    
    case "$slug" in
        "내성좌가전여친이다")
            case "$field" in
                "title") echo "내 성좌가 전여친이다" ;;
                "author") echo "박도윤" ;;
                "genre") echo '["헌터","코미디"]' ;;
            esac
            ;;
        "금융의게임")
            case "$field" in
                "title") echo "금융의 게임" ;;
                "author") echo "김서현" ;;
                "genre") echo '["금융","AI"]' ;;
            esac
            ;;
        "던전에서나만편의점")
            case "$field" in
                "title") echo "던전에서 나만 편의점 합니다" ;;
                "author") echo "박도윤" ;;
                "genre") echo '["던전","경영"]' ;;
            esac
            ;;
        "F급짐꾼이랭킹1위")
            case "$field" in
                "title") echo "F급 짐꾼이 랭킹 1위의 스승님" ;;
                "author") echo "박도윤" ;;
                "genre") echo '["헌터","성장"]' ;;
            esac
            ;;
    esac
}

# Collect all unique series slugs
all_slugs=()
for file in "$DATA_DIR"/*.md; do
    [ -e "$file" ] || continue
    filename=$(basename "$file" .md)
    slug="${filename%-*}"
    
    # Check if slug already in array
    found=false
    for existing in "${all_slugs[@]:-}"; do
        if [ "$existing" = "$slug" ]; then
            found=true
            break
        fi
    done
    
    if [ "$found" = false ]; then
        all_slugs+=("$slug")
    fi
done

# Start JSON output
echo "{" > "$OUTPUT_FILE"
echo '  "novels": [' >> "$OUTPUT_FILE"

first_novel=true

for slug in "${all_slugs[@]}"; do
    title=$(get_novel_metadata "$slug" "title")
    author=$(get_novel_metadata "$slug" "author")
    genres=$(get_novel_metadata "$slug" "genre")
    
    # Skip if no metadata found
    [ -z "$title" ] && continue
    
    # Find all episodes for this series
    episodes=()
    
    for file in "$DATA_DIR"/${slug}-*.md; do
        [ -e "$file" ] || continue
        
        # Extract episode number from filename
        filename=$(basename "$file" .md)
        episode_num="${filename##*-}"
        
        # Extract date from frontmatter
        date=$(grep -m1 '^date:' "$file" | sed 's/date: *//;s/ .*//')
        
        if [ -n "$episode_num" ] && [ -n "$date" ]; then
            episodes+=("$episode_num:$date")
        fi
    done
    
    # Skip if no episodes found
    [ ${#episodes[@]} -eq 0 ] && continue
    
    # Sort episodes
    IFS=$'\n' sorted_episodes=($(sort -t: -k1 -n <<<"${episodes[*]}"))
    unset IFS
    
    total_episodes=${#sorted_episodes[@]}
    last_idx=$((total_episodes - 1))
    latest_date=$(echo "${sorted_episodes[$last_idx]}" | cut -d: -f2)
    
    # Add comma separator
    if [ "$first_novel" = false ]; then
        echo "    ," >> "$OUTPUT_FILE"
    fi
    first_novel=false
    
    # Write novel entry
    echo "    {" >> "$OUTPUT_FILE"
    echo "      \"slug\": \"$slug\"," >> "$OUTPUT_FILE"
    echo "      \"title\": \"$title\"," >> "$OUTPUT_FILE"
    echo "      \"author\": \"$author\"," >> "$OUTPUT_FILE"
    echo "      \"genre\": $genres," >> "$OUTPUT_FILE"
    echo "      \"episodes\": [" >> "$OUTPUT_FILE"
    
    # Write episodes
    first_ep=true
    for ep_data in "${sorted_episodes[@]}"; do
        ep_num=$(echo "$ep_data" | cut -d: -f1)
        ep_date=$(echo "$ep_data" | cut -d: -f2)
        
        if [ "$first_ep" = false ]; then
            echo "," >> "$OUTPUT_FILE"
        fi
        first_ep=false
        
        echo -n "        {\"num\": \"$ep_num\", \"date\": \"$ep_date\"}" >> "$OUTPUT_FILE"
    done
    
    echo "" >> "$OUTPUT_FILE"
    echo "      ]," >> "$OUTPUT_FILE"
    echo "      \"totalEpisodes\": $total_episodes," >> "$OUTPUT_FILE"
    echo "      \"latestDate\": \"$latest_date\"" >> "$OUTPUT_FILE"
    echo -n "    }" >> "$OUTPUT_FILE"
done

echo "" >> "$OUTPUT_FILE"
echo "  ]" >> "$OUTPUT_FILE"
echo "}" >> "$OUTPUT_FILE"

echo "✅ Manifest generated: $OUTPUT_FILE"
echo "📊 Summary:"
jq -r '.novels[] | "  - \(.title): \(.totalEpisodes)화 (최신: \(.latestDate))"' "$OUTPUT_FILE"
