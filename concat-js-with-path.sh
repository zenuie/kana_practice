# filename: concat-js-with-path.sh
# 功能：只處理專案根目錄下的 js 資料夾，把其中所有 .js 合併到 output.txt
# 排除：任何路徑或檔名包含 "bootstrap." 的檔案（例如 bootstrap.js、bootstrap.min.js、bootstrap.*）
# 用法：在專案根目錄執行 -> bash concat-js-with-path.sh

#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(pwd)"
JS_DIR="${ROOT_DIR}/js"
OUTPUT_FILE="${ROOT_DIR}/output.txt"

# 檢查 js 資料夾是否存在
if [[ ! -d "$JS_DIR" ]]; then
  echo "找不到 js 資料夾：$JS_DIR"
  echo "請確認你的專案根目錄下有 js 資料夾後再執行。"
  exit 1
fi

# 計算相對路徑（優先用 python3，無則用純 bash 退路）
relpath() {
  local target="$1"
  if command -v python3 >/dev/null 2>&1; then
    python3 - "$ROOT_DIR" "$target" <<'PY'
import os, sys
root, target = sys.argv[1], sys.argv[2]
print(os.path.relpath(target, root))
PY
  else
    local from="$ROOT_DIR"
    local to="$target"
    from="$(cd "$from" && pwd)"
    to="$(cd "$to" && pwd)"
    IFS='/' read -r -a FROM_ARR <<< "${from#/}"
    IFS='/' read -r -a TO_ARR   <<< "${to#/}"
    local i=0
    while [[ $i -lt ${#FROM_ARR[@]} && $i -lt ${#TO_ARR[@]} && "${FROM_ARR[$i]}" == "${TO_ARR[$i]}" ]]; do
      ((i++))
    done
    local up=$(( ${#FROM_ARR[@]} - i ))
    local rel=""
    for ((j=0; j<up; j++)); do rel+="../"; done
    for ((j=i; j<${#TO_ARR[@]}; j++)); do
      rel+="${TO_ARR[$j]}"
      if [[ $j -lt $(( ${#TO_ARR[@]} - 1 )) ]]; then rel+="/"; fi
    done
    [[ -z "$rel" ]] && rel="."
    printf "%s\n" "$rel"
  fi
}

# 先清空/建立輸出檔
: > "$OUTPUT_FILE"

# 掃描 js 資料夾中的 .js 檔，排除任何包含 "bootstrap." 的檔案或路徑
# 說明：
# - -path "*bootstrap.*" 會排除所有路徑中含有 bootstrap. 的檔案（含檔名）
# - 如果你也要排除資料夾名稱包含 bootstrap，可再加 -path "*bootstrap*"
find "$JS_DIR" \
  -type f -name "*.js" \
  ! -path "*bootstrap.*" \
  -print0 | while IFS= read -r -d '' file; do
    dirpath="$(dirname "$file")"
    rel_dir="$(relpath "$dirpath")"

    {
      echo "// ${rel_dir}"
      cat "$file"
      echo
      echo "/* =============================== */"
      echo
    } >> "$OUTPUT_FILE"
  done

echo "已產生輸出檔案：$OUTPUT_FILE"
