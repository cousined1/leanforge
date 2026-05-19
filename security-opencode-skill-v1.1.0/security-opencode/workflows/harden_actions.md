# Workflow: Harden GitHub Actions (HARDEN mode)

## When to use
- `.github/workflows/*.yml` is opened, modified, or newly added
- User says "lock down my actions" / "pin my workflows" / "GHA security"
- A repo just got a `pull_request_target` trigger added (review immediately)
- After a public security incident affecting a GitHub Action (e.g.
  `tj-actions/changed-files`, `reviewdog/action-setup`) — sweep all repos

## Time budget
5–15 minutes per repo. The bulk is `zizmor` + `pinact` review time.

## Prerequisites
```bash
# Linux/macOS
pip install zizmor
go install github.com/suzuki-shunsuke/pinact/cmd/pinact@latest
go install github.com/stacklok/frizbee@latest
brew install actionlint  # or scoop install actionlint on Windows

# Verify
zizmor --version
pinact --version
actionlint -version
```

## Steps

### Step 1 — Inventory (1 min)
```bash
cd <repo>
TS=$(date -u +%Y%m%dT%H%M%SZ)
OUT=".security-audit/$TS-harden"
mkdir -p "$OUT"

# List every workflow
find .github/workflows -type f \( -name "*.yml" -o -name "*.yaml" \) | tee "$OUT/workflows.txt"

# List every third-party action reference (uses:)
grep -rhE '^\s*uses:\s+\S+' .github/workflows/ \
  | sed -E 's/^\s*uses:\s+//' \
  | sort -u \
  | tee "$OUT/actions-used.txt"

# Count unpinned (tag-only) references
grep -vE '@[a-f0-9]{40}\b' "$OUT/actions-used.txt" | tee "$OUT/actions-unpinned.txt"
echo "Unpinned action refs: $(wc -l < "$OUT/actions-unpinned.txt")"
```

### Step 2 — Run the trio of scanners (2 min)

```bash
# Zizmor — most comprehensive (template injection, dangerous triggers,
#         unpinned actions, untrusted checkouts)
zizmor --format json .github/workflows/ > "$OUT/zizmor.json" 2>&1 || true

# Actionlint — syntax, runner compatibility, expression safety
actionlint -format '{{json .}}' > "$OUT/actionlint.json" 2>&1 || true

# Poutine — supply-chain & build-pipeline focus (optional, brew-only easy install)
poutine analyze_local . --format json > "$OUT/poutine.json" 2>&1 || true
```

### Step 3 — Manual checklist (5 min)

For **each** workflow file, verify:

#### Permissions
- [ ] Root has `permissions: {}` (deny by default)
- [ ] Each job grants only the permissions it needs
      (`contents: read`, `pull-requests: write`, etc.)
- [ ] No `permissions: write-all` anywhere

#### Triggers
- [ ] No `pull_request_target` — OR if present:
      - [ ] Does NOT check out the PR's head (`actions/checkout` without
        explicit ref is OK; with `ref: ${{ github.event.pull_request.head.sha }}`
        is NOT OK with secrets present)
      - [ ] Does NOT use any secret in the PR-context steps
      - [ ] Has a comment explaining why `pull_request_target` is needed
- [ ] No `issue_comment` triggers that run attacker-controlled code
- [ ] No `workflow_run` triggers that re-execute logic from untrusted PRs
- [ ] `workflow_dispatch` inputs are validated before being interpolated

#### Actions pinning
- [ ] Every `uses:` references a 40-char commit SHA, not a tag/branch.
      Exception: `actions/*` (GitHub-maintained) may use major tags if
      the org explicitly accepts that trust. Tag this exception in
      `.github/security/policy.yml`.
- [ ] Comment next to each pinned SHA shows the version
      (`uses: org/action@a1b2c3d  # v1.2.3`)

#### Template injection
- [ ] No `${{ github.event.* }}` (PR title, issue body, etc.) is
      interpolated directly into a `run:` block. Pass via `env:` and use
      shell variable instead.
- [ ] No `${{ inputs.* }}` interpolated into shell without quoting +
      validation.

#### Secrets
- [ ] No secrets in `env:` at workflow level (job-scope them).
- [ ] No `echo ${{ secrets.X }}` or any secret printed to logs.
- [ ] Production secrets gated behind `environment:` with required
      reviewers.
- [ ] Cloud auth uses OIDC (`id-token: write` + `aws-actions/configure-
      aws-credentials` with `role-to-assume`), not static access keys.

#### Runners
- [ ] If self-hosted: runners are ephemeral (`runs-on: [self-hosted,
      ephemeral]` + autoscaling group destroys after job). No persistent
      runners on public-repo workflows ever.
- [ ] `step-security/harden-runner` action installed with
      `egress-policy: block` and an explicit allow-list.

#### Caching & artifacts
- [ ] Caches are scoped to a key that includes the lock file hash, not
      the branch name alone (cache poisoning prevention).
- [ ] Artifacts uploaded with the minimum scope; sensitive outputs (build
      reports with stack traces) not uploaded as artifacts.

### Step 4 — Pin everything (2 min)

```bash
# Dry-run first
pinact run --check

# Apply
pinact run

# Verify diff
git diff .github/workflows/

# Or use Frizbee
frizbee actions .github/workflows/
```

This rewrites `uses: org/action@v1` → `uses: org/action@<40-char-sha>  # v1`.
Inspect the diff before committing.

### Step 5 — Add the security policy file (1 min)

Drop this in `.github/security/policy.yml` (or update if it exists):

```yaml
# GitHub Actions security policy for this repo.
# Read by reviewers and by `security-opencode` skill.

version: 1

defaults:
  pin_third_party_actions: required        # commit-SHA pin enforced
  pin_first_party_actions: major_tag_ok    # actions/* may use major tags
  allow_pull_request_target: false         # explicit allow-list below
  default_permissions: read_only           # permissions: contents: read

allow_pull_request_target:
  # add workflows here only with a written exception + reviewer approval
  # - path: .github/workflows/labeler.yml
  #   approved_by: security-team
  #   approved_at: 2026-05-14

trusted_action_orgs:
  - actions          # GitHub-maintained
  - github           # GitHub-maintained
  - aws-actions      # AWS-maintained
  - azure            # Azure-maintained
  - google-github-actions
  - hashicorp
  - docker
  - step-security    # for harden-runner

cloud_auth:
  method: oidc       # never static keys
  aws_role_pattern: 'arn:aws:iam::*:role/gha-*'

required_actions:
  - step-security/harden-runner    # on every job
```

### Step 6 — Add (or update) a pre-merge check workflow

Drop `.github/workflows/security-gha-check.yml`:

```yaml
name: GHA Security Check
on:
  pull_request:
    paths:
      - '.github/workflows/**'
      - '.github/security/policy.yml'

permissions: {}

jobs:
  zizmor:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: step-security/harden-runner@<PIN_TO_SHA>
        with:
          egress-policy: block
          allowed-endpoints: >
            api.github.com:443
            github.com:443
            pypi.org:443
            files.pythonhosted.org:443

      - uses: actions/checkout@<PIN_TO_SHA>

      - name: Install zizmor
        run: pipx install zizmor

      - name: Run zizmor
        run: zizmor --format sarif .github/workflows/ > zizmor.sarif

      - uses: github/codeql-action/upload-sarif@<PIN_TO_SHA>
        with:
          sarif_file: zizmor.sarif

  actionlint:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: step-security/harden-runner@<PIN_TO_SHA>
        with:
          egress-policy: audit
      - uses: actions/checkout@<PIN_TO_SHA>
      - uses: reviewdog/action-actionlint@<PIN_TO_SHA>
        with:
          reporter: github-pr-review
          fail_level: error
```

> The `<PIN_TO_SHA>` placeholders should be resolved by running
> `scripts/pin_actions.sh` on this file after dropping it.

### Step 7 — Render findings (1 min)

Convert scanner output to `findings.jsonl`:

```bash
python3 - <<'PY' "$OUT"
import json, sys, pathlib, datetime
out = pathlib.Path(sys.argv[1])
findings = []

# Zizmor → findings
zz = out / "zizmor.json"
if zz.exists():
    data = json.loads(zz.read_text() or "[]")
    for i, r in enumerate(data if isinstance(data, list) else data.get("findings", [])):
        findings.append({
            "id": f"GHA-{i:04d}",
            "severity": r.get("severity", "medium").lower(),
            "confidence": 90,  # zizmor is high-signal
            "title": r.get("ident", r.get("title", "GHA finding")),
            "rule": f"zizmor:{r.get('ident','unknown')}",
            "file": r.get("locations", [{}])[0].get("path", ""),
            "line": r.get("locations", [{}])[0].get("start_line", 0),
            "snippet": r.get("locations", [{}])[0].get("snippet", ""),
            "explanation": r.get("desc", ""),
            "fix": r.get("remediation", "see zizmor docs"),
            "references": [f"https://woodruffw.github.io/zizmor/audits/#{r.get('ident','')}"],
            "tool": "zizmor",
            "detected_at": datetime.datetime.utcnow().isoformat() + "Z",
        })

# Write JSONL
(out / "findings.jsonl").write_text(
    "\n".join(json.dumps(f) for f in findings) + "\n"
)
print(f"Wrote {len(findings)} findings to {out}/findings.jsonl")
PY
```

### Step 8 — Verify nothing broke (2 min)

```bash
# Re-run actionlint on the rewritten workflows
actionlint .github/workflows/

# Trigger a test PR with a no-op change to confirm the new check passes
git checkout -b security/harden-gha-$(date +%Y%m%d)
git add .github/
git commit -s -m "security: harden GitHub Actions (pin SHAs, deny perms, harden-runner)"
git push -u origin HEAD
gh pr create --fill --label security
```

### Step 9 — Compound retro (1 min)

Append to `learnings.md`:
- Which actions were hardest to pin (rapid release cadence, frequent
  SHA churn)?
- Which workflows needed `pull_request_target` and why?
- Any allow-listed exceptions to document for the next pass?

## Severity rubric (GHA-specific)

| Severity | Examples |
|---|---|
| **CRITICAL** | `pull_request_target` + checkout of PR head + secrets in env |
| **CRITICAL** | Template injection of `${{ github.event.* }}` into `run:` |
| **CRITICAL** | Secret echoed to logs |
| **HIGH** | Unpinned third-party action (tag-only) |
| **HIGH** | Persistent self-hosted runner reachable from public PRs |
| **HIGH** | Static cloud credentials in secrets (instead of OIDC) |
| **MEDIUM** | Missing `permissions:` (defaults to write-all) |
| **MEDIUM** | Cache key not scoped to lockfile hash |
| **LOW** | Missing harden-runner |
| **LOW** | No security-gha-check workflow |

## Refuse list

- Do **not** auto-merge the hardening PR. Human review required.
- Do **not** rewrite a workflow's logic in the same PR as the pinning
  change. Pin first, refactor in a follow-up — keeps the diff reviewable.
- Do **not** include base64-encoded artifacts in the audit output
  directory — those can contain secrets surfaced from logs.
