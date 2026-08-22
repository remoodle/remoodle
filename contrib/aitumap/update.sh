#!/usr/bin/env bash
set -euo pipefail

UPSTREAM="https://github.com/Yuujiso/aitumap.git"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$SCRIPT_DIR"

if ! git remote get-url upstream &>/dev/null; then
  git remote add upstream "$UPSTREAM"
fi

git fetch upstream

git merge --allow-unrelated-histories -X theirs upstream/main \
  --no-edit -m "chore(aitumap): sync with upstream"
