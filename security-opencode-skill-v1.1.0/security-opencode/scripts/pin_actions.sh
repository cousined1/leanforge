#!/usr/bin/env bash
# pin_actions.sh
# -----------------------------------------------------------------------------
# Pin every `uses:` in GitHub Actions workflows to a 40-char commit SHA.
#
# Strategy:
#   1. Try `pinact` (preferred — handles `actions/*`, third-party, reusable).
#   2. Fall back to `frizbee` if pinact not present.
#   3. Fall back to a pure-bash + `gh api` resolver if neither is installed.
#
# Usage:
#   bash scripts/pin_actions.sh [workflows_dir]
#       default workflows_dir = .github/workflows
#
#   --dry-run      show changes without writing
#   --skip-policy  skip the .github/security/policy.yml allow-list check
#
# Safety:
#   - Never modifies files on `main`. Creates a branch `security/pin-actions-<TS>`.
#   - Refuses to run if working tree is dirty (use --force-dirty to override).
#   - Always writes a backup tarball to .security-audit/<TS>/workflows.before.tgz
#   - After rewrite, runs `actionlint` and aborts (reverting) on syntax error.
# -----------------------------------------------------------------------------

set -euo pipefail
IFS=$'\n\t'

WORKFLOWS_DIR="${1:-.github/workflows}"
DRY_RUN=false
SKIP_POLICY=false
FORCE_DIRTY=false

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    --skip-policy) SKIP_POLICY=true ;;
    --force-dirty) FORCE_DIRTY=true ;;
  esac
done

TS=$(date -u +%Y%m%dT%H%M%SZ)
OUT=".security-audit/$TS-pin-actions"
mkdir -p "$OUT"
LOG="$OUT/log.txt"

log() { echo "[$(date -u +%H:%M:%S)] $*" | tee -a "$LOG"; }
die() { log "ERROR: $*"; exit 1; }

log "=== pin_actions.sh starting ==="
log "workflows_dir = $WORKFLOWS_DIR"
log "dry_run       = $DRY_RUN"
log "output_dir    = $OUT"

# --- preflight checks -------------------------------------------------------

[[ -d "$WORKFLOWS_DIR" ]] || die "workflows dir not found: $WORKFLOWS_DIR"

if ! command -v git &>/dev/null; then
  die "git is required"
fi

if ! git rev-parse --is-inside-work-tree &>/dev/null; then
  die "not inside a git repository"
fi

# refuse on dirty tree unless forced
if ! $FORCE_DIRTY && ! git diff-index --quiet HEAD --; then
  die "working tree is dirty. Commit or stash first, or pass --force-dirty."
fi

# branch off (unless dry run)
if ! $DRY_RUN; then
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
  NEW_BRANCH="security/pin-actions-$TS"
  if [[ "$CURRENT_BRANCH" == "main" || "$CURRENT_BRANCH" == "master" ]]; then
    log "→ branching off to $NEW_BRANCH (refusing to commit on $CURRENT_BRANCH)"
    git checkout -b "$NEW_BRANCH"
  else
    log "→ already on $CURRENT_BRANCH (not main/master), proceeding on this branch"
  fi
fi

# backup
log "→ backing up workflows to $OUT/workflows.before.tgz"
tar czf "$OUT/workflows.before.tgz" "$WORKFLOWS_DIR"

# --- inventory --------------------------------------------------------------

log "→ inventorying action references"
grep -rhE '^\s*uses:\s+\S+' "$WORKFLOWS_DIR" \
  | sed -E 's/^\s*uses:\s+//' \
  | sort -u > "$OUT/actions-used.txt"
USED_COUNT=$(wc -l < "$OUT/actions-used.txt")

grep -vE '@[a-f0-9]{40}\b' "$OUT/actions-used.txt" > "$OUT/actions-unpinned.txt" || true
UNPINNED_COUNT=$(wc -l < "$OUT/actions-unpinned.txt")

log "  total refs:    $USED_COUNT"
log "  unpinned refs: $UNPINNED_COUNT"

if [[ "$UNPINNED_COUNT" -eq 0 ]]; then
  log "✓ nothing to do — all actions already pinned"
  exit 0
fi

# --- policy allow-list ------------------------------------------------------

POLICY=".github/security/policy.yml"
ALLOW_TAG_FOR_ORGS=()

if ! $SKIP_POLICY && [[ -f "$POLICY" ]]; then
  log "→ reading $POLICY for trusted_action_orgs (major-tag allow-list)"
  # naive YAML parse — works for the simple list shape in the template
  in_block=false
  while IFS= read -r line; do
    if [[ "$line" =~ ^trusted_action_orgs: ]]; then
      in_block=true; continue
    fi
    if $in_block; then
      if [[ "$line" =~ ^[[:space:]]+-[[:space:]]+([a-zA-Z0-9_-]+) ]]; then
        ALLOW_TAG_FOR_ORGS+=("${BASH_REMATCH[1]}")
      elif [[ "$line" =~ ^[a-zA-Z] ]]; then
        in_block=false
      fi
    fi
  done < "$POLICY"
  log "  trusted orgs (major-tag OK): ${ALLOW_TAG_FOR_ORGS[*]:-<none>}"
fi

is_trusted_org() {
  local ref="$1"
  local org="${ref%%/*}"
  for o in "${ALLOW_TAG_FOR_ORGS[@]}"; do
    [[ "$o" == "$org" ]] && return 0
  done
  return 1
}

# --- pick pinner ------------------------------------------------------------

PINNER=""
if command -v pinact &>/dev/null; then
  PINNER="pinact"
elif command -v frizbee &>/dev/null; then
  PINNER="frizbee"
else
  PINNER="bash"
fi

log "→ using pinner: $PINNER"

# --- pinact branch ----------------------------------------------------------

if [[ "$PINNER" == "pinact" ]]; then
  if $DRY_RUN; then
    pinact run --check 2>&1 | tee "$OUT/pinact.out" || true
  else
    pinact run 2>&1 | tee "$OUT/pinact.out"
  fi
fi

# --- frizbee branch ---------------------------------------------------------

if [[ "$PINNER" == "frizbee" ]]; then
  if $DRY_RUN; then
    frizbee actions "$WORKFLOWS_DIR" --dry-run 2>&1 | tee "$OUT/frizbee.out" || true
  else
    frizbee actions "$WORKFLOWS_DIR" 2>&1 | tee "$OUT/frizbee.out"
  fi
fi

# --- bash fallback ----------------------------------------------------------

if [[ "$PINNER" == "bash" ]]; then
  if ! command -v gh &>/dev/null; then
    die "neither pinact nor frizbee installed, and 'gh' CLI not present for fallback. Install one:
  pinact:  go install github.com/suzuki-shunsuke/pinact/cmd/pinact@latest
  frizbee: go install github.com/stacklok/frizbee@latest
  gh:      https://cli.github.com"
  fi

  log "→ bash fallback: resolving each tag via gh api"

  resolve_ref_to_sha() {
    local ref="$1"        # e.g. "actions/checkout@v4"
    local owner_repo="${ref%@*}"
    local rev="${ref#*@}"
    # If already a 40-char SHA, no work
    if [[ "$rev" =~ ^[a-f0-9]{40}$ ]]; then
      echo "$rev"
      return 0
    fi
    # Resolve via gh api
    local sha
    sha=$(gh api "repos/$owner_repo/commits/$rev" --jq '.sha' 2>/dev/null || true)
    if [[ -z "$sha" ]]; then
      # Try as tag
      sha=$(gh api "repos/$owner_repo/git/refs/tags/$rev" --jq '.object.sha' 2>/dev/null || true)
    fi
    [[ -n "$sha" ]] || return 1
    echo "$sha"
  }

  declare -A RESOLVED
  while IFS= read -r ref; do
    [[ -z "$ref" ]] && continue
    if is_trusted_org "$ref"; then
      log "  - skipping (trusted org): $ref"
      continue
    fi
    sha=$(resolve_ref_to_sha "$ref") || { log "  - FAILED to resolve: $ref"; continue; }
    RESOLVED["$ref"]="$sha"
    log "  - $ref → $sha"
  done < "$OUT/actions-unpinned.txt"

  log "→ rewriting workflow files"
  for f in $(find "$WORKFLOWS_DIR" -type f \( -name "*.yml" -o -name "*.yaml" \)); do
    log "  · $f"
    cp "$f" "$f.bak"
    for ref in "${!RESOLVED[@]}"; do
      sha="${RESOLVED[$ref]}"
      tag="${ref#*@}"
      pinned="${ref%@*}@${sha}  # ${tag}"
      # Escape for sed
      esc_ref=$(printf '%s\n' "$ref" | sed 's/[]\/$*.^[]/\\&/g')
      esc_pinned=$(printf '%s\n' "$pinned" | sed 's/[\&/]/\\&/g')
      if $DRY_RUN; then
        grep -nE "uses:\s+${esc_ref}\b" "$f.bak" | tee -a "$OUT/would-change.txt" || true
      else
        sed -i.tmp -E "s|uses:\s+${esc_ref}\b|uses: ${esc_pinned}|g" "$f" && rm -f "$f.tmp"
      fi
    done
    rm -f "$f.bak"
  done
fi

# --- validate with actionlint ----------------------------------------------

if command -v actionlint &>/dev/null; then
  log "→ validating with actionlint"
  if ! actionlint "$WORKFLOWS_DIR" 2>&1 | tee "$OUT/actionlint-post.txt"; then
    log "  ⚠ actionlint reported errors — reverting workflows from backup"
    if ! $DRY_RUN; then
      tar xzf "$OUT/workflows.before.tgz" -C .
      die "actionlint failed after pinning. Workflows restored. See $OUT/actionlint-post.txt"
    fi
  fi
else
  log "  ⚠ actionlint not installed — skipping post-rewrite validation"
fi

# --- diff summary -----------------------------------------------------------

if ! $DRY_RUN; then
  log "→ diff summary"
  git diff --stat "$WORKFLOWS_DIR" | tee "$OUT/diff-stat.txt"
fi

log "=== done ==="
log "next steps:"
log "  1. review the diff:    git diff $WORKFLOWS_DIR"
log "  2. commit:             git add $WORKFLOWS_DIR && git commit -s -m 'security: pin GitHub Actions to commit SHAs'"
log "  3. push & open PR:     git push -u origin HEAD && gh pr create --fill --label security"
log "  4. spot-check a few SHAs against the action repo's release tags"
log ""
log "output: $OUT"
