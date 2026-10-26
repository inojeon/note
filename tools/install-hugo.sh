#!/bin/sh
# Install only the pinned standard Hugo binary into this repository.
set -eu
repo=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
version=$(cat "$repo/.hugo-version")
if [ -x "$repo/.tools/hugo" ] && "$repo/.tools/hugo" version | grep -q "v${version}-"; then
  "$repo/.tools/hugo" version
  exit 0
fi
case "$(uname -s)/$(uname -m)" in
  Darwin/*) asset="hugo_${version}_darwin-universal.pkg" ;;
  Linux/x86_64) asset="hugo_${version}_linux-amd64.tar.gz" ;;
  Linux/aarch64|Linux/arm64) asset="hugo_${version}_linux-arm64.tar.gz" ;;
  *) echo '이 스크립트는 macOS와 Linux를 지원합니다. Windows는 README의 공식 바이너리를 사용하세요.' >&2; exit 1 ;;
esac
temp=$(mktemp -d)
trap 'rm -rf "$temp"' EXIT HUP INT TERM
release="https://github.com/gohugoio/hugo/releases/download/v${version}"
curl --fail --location --silent --show-error "$release/$asset" --output "$temp/$asset"
curl --fail --location --silent --show-error "$release/hugo_${version}_checksums.txt" --output "$temp/checksums.txt"
expected=$(awk -v name="$asset" '$2 == name {print $1}' "$temp/checksums.txt")
test -n "$expected"
if command -v shasum >/dev/null 2>&1; then actual=$(shasum -a 256 "$temp/$asset" | awk '{print $1}'); else actual=$(sha256sum "$temp/$asset" | awk '{print $1}'); fi
if [ "$actual" != "$expected" ]; then echo 'Hugo 다운로드 체크섬이 일치하지 않습니다.' >&2; exit 1; fi
mkdir -p "$repo/.tools"
case "$asset" in
  *.pkg)
    pkgutil --expand-full "$temp/$asset" "$temp/unpacked"
    binary=$(find "$temp/unpacked" -type f -name hugo | head -1)
    test -n "$binary"
    cp "$binary" "$repo/.tools/hugo"
    ;;
  *) tar -xzf "$temp/$asset" -C "$temp" hugo; cp "$temp/hugo" "$repo/.tools/hugo" ;;
esac
chmod +x "$repo/.tools/hugo"
"$repo/.tools/hugo" version
