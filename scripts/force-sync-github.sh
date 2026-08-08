#!/usr/bin/env bash
#
# Authorized "force sync": overwrite the GitHub branch history with the
# history that exists in this checkout.
#
# This is deliberately a manual, local-only operation. It requires you to
# re-type the exact target commit hash as confirmation, so it can never run
# by accident (or be triggered automatically by CI or an agent).
#
# Usage:
#   scripts/force-sync-github.sh <target-commit-sha> [branch] [remote]
#
# Examples:
#   scripts/force-sync-github.sh 454e974
#   scripts/force-sync-github.sh 454e974c248421303e59ed672f8aa21bb02d654a main github
#
# Defaults: branch=main, remote=github
#   git remote add github https://github.com/<owner>/<repo>.git
#
set -euo pipefail

TARGET="${1:-}"
BRANCH="${2:-main}"
REMOTE="${3:-github}"

die() { echo "error: $*" >&2; exit 1; }

[ -n "$TARGET" ] || die "missing target commit sha. Usage: scripts/force-sync-github.sh <sha> [branch] [remote]"

git rev-parse --git-dir >/dev/null 2>&1 || die "not inside a git repository"
git remote get-url "$REMOTE" >/dev/null 2>&1 \
  || die "remote '$REMOTE' not configured. Add it with: git remote add $REMOTE https://github.com/<owner>/<repo>.git"

# Resolve and validate the target locally — never push a commit we don't have.
FULL_SHA="$(git rev-parse --verify "${TARGET}^{commit}" 2>/dev/null)" \
  || die "commit '$TARGET' does not exist in this checkout"

REMOTE_URL="$(git remote get-url "$REMOTE")"
REMOTE_HEAD="$(git ls-remote "$REMOTE" "refs/heads/$BRANCH" | awk '{print $1}')"
REMOTE_HEAD="${REMOTE_HEAD:-<branch does not exist yet>}"

cat <<EOF

  FORCE SYNC — this rewrites remote history and is not reversible.

  remote          : $REMOTE ($REMOTE_URL)
  branch          : $BRANCH
  remote is now at: $REMOTE_HEAD
  will be set to  : $FULL_SHA
                    $(git log -1 --format='%s (%an, %ad)' --date=short "$FULL_SHA")

  Any commits on '$REMOTE/$BRANCH' that are not ancestors of the target
  will be discarded. Make sure nobody else is working off that branch.

EOF

printf 'Re-type the full target commit hash to confirm: '
read -r CONFIRM
[ "$CONFIRM" = "$FULL_SHA" ] || die "confirmation did not match the target commit ($FULL_SHA). Aborted, nothing was pushed."

echo "Pushing ${FULL_SHA} -> ${REMOTE}/${BRANCH} ..."
if git push --force-with-lease="refs/heads/${BRANCH}" "$REMOTE" "${FULL_SHA}:refs/heads/${BRANCH}"; then
  echo "Done. ${REMOTE}/${BRANCH} is now at ${FULL_SHA}."
else
  cat >&2 <<'EOF'

Push rejected. Most likely causes:
  * the remote branch moved since this script read it (--force-with-lease guard) —
    re-run the script to pick up the new state, or
  * branch protection is enabled on GitHub — temporarily allow force pushes, or
  * your credentials lack write access to the repository.
EOF
  exit 1
fi
