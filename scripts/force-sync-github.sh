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

PREV_HEAD="$REMOTE_HEAD"

echo "Pushing ${FULL_SHA} -> ${REMOTE}/${BRANCH} ..."
if ! git push --force-with-lease="refs/heads/${BRANCH}" "$REMOTE" "${FULL_SHA}:refs/heads/${BRANCH}"; then
  cat >&2 <<'EOF'

Push rejected. Most likely causes:
  * the remote branch moved since this script read it (--force-with-lease guard) —
    re-run the script to pick up the new state, or
  * branch protection is enabled on GitHub — temporarily allow force pushes, or
  * your credentials lack write access to the repository.
EOF
  exit 1
fi

# ---------------------------------------------------------------------------
# Post-push verification: re-read the remote ref and confirm it is the target.
# ---------------------------------------------------------------------------
echo
echo "Verifying ${REMOTE}/${BRANCH} ..."
VERIFIED_SHA=""
for attempt in 1 2 3 4 5; do
  VERIFIED_SHA="$(git ls-remote "$REMOTE" "refs/heads/${BRANCH}" | awk '{print $1}')"
  [ "$VERIFIED_SHA" = "$FULL_SHA" ] && break
  echo "  attempt ${attempt}/5: remote reports ${VERIFIED_SHA:-<none>}, retrying in 2s ..."
  sleep 2
done

if [ "$VERIFIED_SHA" != "$FULL_SHA" ]; then
  cat >&2 <<EOF

VERIFICATION FAILED.
  expected: $FULL_SHA
  actual  : ${VERIFIED_SHA:-<branch missing>}

The push reported success but ${REMOTE}/${BRANCH} does not point at the target.
Something else moved the branch, or a server-side hook/ruleset rewrote it.
Do NOT re-run blindly — inspect the remote history first.
EOF
  exit 1
fi

echo "VERIFIED: ${REMOTE}/${BRANCH} = ${FULL_SHA}"

# ---------------------------------------------------------------------------
# Diff summary: what this force sync actually changed on the remote.
# ---------------------------------------------------------------------------
echo
echo "=============================== DIFF SUMMARY ==============================="
echo "  ${REMOTE}/${BRANCH}: ${PREV_HEAD} -> ${FULL_SHA}"
echo

if git rev-parse --verify --quiet "${PREV_HEAD}^{commit}" >/dev/null 2>&1; then
  DROPPED="$(git rev-list --count "${PREV_HEAD}" "^${FULL_SHA}")"
  ADDED="$(git rev-list --count "${FULL_SHA}" "^${PREV_HEAD}")"

  echo "Commits removed from the remote (${DROPPED}):"
  if [ "$DROPPED" -gt 0 ]; then
    git log --format='  - %h %s (%an, %ad)' --date=short "${PREV_HEAD}" "^${FULL_SHA}"
  else
    echo "  (none)"
  fi
  echo

  echo "Commits added to the remote (${ADDED}):"
  if [ "$ADDED" -gt 0 ]; then
    git log --format='  + %h %s (%an, %ad)' --date=short "${FULL_SHA}" "^${PREV_HEAD}"
  else
    echo "  (none)"
  fi
  echo

  echo "File changes (${PREV_HEAD} -> ${FULL_SHA}):"
  git diff --stat "${PREV_HEAD}" "${FULL_SHA}" | sed 's/^/  /'
else
  echo "Previous remote head is not available locally, so a commit-level diff"
  echo "cannot be computed. Target commit contents:"
  echo
  git show --stat --format='  %h %s (%an, %ad)%n' --date=short "${FULL_SHA}" | sed 's/^/  /'
fi
echo "============================================================================"

