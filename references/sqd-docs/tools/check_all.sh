#!/usr/bin/env bash
# Every check for docs/, in the order CI runs them. Run after tools/build_all.sh:
#   tools/check_all.sh                 # everything
#   tools/check_all.sh --no-browser    # unit, structure, freshness, data and fake-DOM checks
#   tools/check_all.sh --browser-only  # only the Playwright checks
# Browser checks need PLAYWRIGHT_MODULE and CHROMIUM_PATH (see CLAUDE.md).
set -euo pipefail
cd "$(dirname "$0")/.."
quick=1 browser=1
for arg in "$@"; do
  case "$arg" in
    --no-browser) browser=0 ;;
    --browser-only) quick=0 ;;
    *) echo "unknown option: $arg" >&2; exit 2 ;;
  esac
done
grouped=0
step() {  # GitHub Actions folds each step into a log group
  if [ -n "${GITHUB_ACTIONS:-}" ]; then
    [ "$grouped" = 1 ] && echo "::endgroup::"
    echo "::group::$*"; grouped=1
  else
    printf '\n== %s\n' "$*"
  fi
}

# Each check runs as its own command so that set -e stops on the first failure.
if [ "$quick" = 1 ]; then
  step "unit tests"
  python3 -m unittest discover -s tools -p 'test_*.py'
  step "note structure"
  python3 tools/check_note_structure.py > /dev/null
  echo "OK   note catalog, chapters, links, 2,200-character budget"
  step "progress codec"
  node tools/test_progress.cjs
  step "hub freshness"
  python3 tools/build_hub.py --check
  step "calculation data"
  python3 tools/check_bo_h2_data.py
  python3 tools/check_vqe_h2_data.py
  step "fake DOM"
  for mode in "" --narrow; do
    out=$(node tools/check_html.js $mode) || { printf '%s\n' "$out" | grep -v '^OK'; exit 1; }
    echo "OK   every page in docs/ ${mode:+(narrow)}"
  done
fi
if [ "$browser" = 1 ]; then
  : "${PLAYWRIGHT_MODULE:?set PLAYWRIGHT_MODULE (see CLAUDE.md)}"
  for check in tools/check_*.cjs; do
    step "$(basename "$check")"
    # One retry absorbs timing flakes, but the first failure is printed and flagged so that
    # flaky checks get fixed instead of hidden. A second failure fails the run.
    if ! first=$(node "$check" 2>&1); then
      printf '%s\n' "$first" | tail -n 20
      if [ -n "${GITHUB_ACTIONS:-}" ]; then echo "::warning::flaky $(basename "$check"), retrying"; else echo "FLAKY $(basename "$check"), retrying"; fi
      node "$check"
    fi
    echo "OK"
  done
fi
[ "$grouped" = 1 ] && echo "::endgroup::"
printf '\nALL CHECKS PASSED\n'
