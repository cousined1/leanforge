# CI Integration — Quality Gate Enforcement
## GODMYTHOS v10 System Component

> Automated enforcement of Hard Rules in build pipelines.
> These gates prevent design rot, security drift, quality regression, and
> stale knowledge.

Platform-agnostic: Claude Code, Codex, OpenCode, Kilo Code, Antigravity.
Gate logic runs in CI (GitHub Actions / n8n / equivalents); agent platforms
all consume the same artifacts (`docs/knowledge/`, `graphify-out/`,
`CONTEXT.md`, `docs/adr/`).

---

## Gate Architecture

```
trigger → graphify-rebuild → lint → compile → test → security-audit
           │                  │        │        │          │
           │                  │        │        │          └─ BLOCK if HIGH/CRITICAL CVE
           │                  │        │        └─ BLOCK if any test fails or horizontal slice
           │                  │        └─ BLOCK if compiler error
           │                  └─ WARN (tracked, non-blocking)
           └─ WARN if graph stale + arch change
              [design-score] → compound-check → deploy
                  │                 │
                  │                 └─ WARN if missing
                  └─ BLOCK if < B (UI PRs only)
```

---

## Gate Definitions

### Gate 1: Compiler Clean (Hard Rule #2)

| Stack | Command | Blocking |
|-------|---------|----------|
| TypeScript | `tsc --noEmit` | Yes — zero errors |
| Rust | `cargo check` | Yes — zero errors |
| Go | `go build ./...` | Yes — zero errors |
| Python | `mypy --strict` or `py_compile` | Yes — zero errors |

Warnings are tracked in CI output but do not block. Error count must be zero.

### Gate 2: Test Pass (Hard Rule #3)

| Check | Blocking |
|-------|----------|
| All tests pass | Yes |
| No flaky tests (re-run failures once) | Yes — flaky = bug |
| Coverage delta ≥ 0% | WARN (blocks after 24h) |
| New code has tests | WARN (blocks on LARGE scope) |

**Flaky test protocol:** If a test fails on first run but passes on retry,
it is marked as flaky. Flaky tests must be fixed or quarantined within 48 hours.
A quarantined test is explicitly documented in `docs/knowledge/` as a constraint.

### Gate 3: Security Gate (Hard Rule #7)

| Tool | Scope | Blocking |
|------|-------|----------|
| `npm audit` | Node.js deps | BLOCK on HIGH/CRITICAL |
| `pip-audit` | Python deps | BLOCK on HIGH/CRITICAL |
| `govulncheck` | Go deps | BLOCK on HIGH/CRITICAL |
| `cargo audit` | Rust deps | BLOCK on HIGH/CRITICAL |
| Manual OSS gate | New deps only | BLOCK on BLOCK verdict, WARN on WARN |

**New dependency added?** Trigger full OSS gate:
1. Check CVE databases (NVD, GitHub Security Advisories)
2. Check last publish date (> 12 months = WARN)
3. Check maintainer activity (0 commits in 6 months = WARN)
4. Check download anomalies (sudden spike without release = WARN)
5. Verdict: PASS / WARN / BLOCK

### Gate 4: Design Quality (Hard Rule #10, UI PRs only)

| Check | Threshold | Blocking |
|-------|-----------|----------|
| `designlang score` overall grade | ≥ B | Yes |
| Any category grade | ≥ C (D or F = blocker) | Yes |
| Score delta vs previous | Flag regression > 1 grade | WARN |

**Trigger condition:** Only runs on PRs that modify files in `src/components/`,
`src/app/`, `src/pages/`, `styles/`, `design/`, or any `.css`/`.scss`/`.tsx` file.

**Bypass:** Explicit `[skip-design-gate]` in commit message with documented justification.

### Gate 5: Compound Artifact (Hard Rule #11)

| Check | Blocking |
|-------|----------|
| `docs/knowledge/*.md` file added or modified | WARN |
| WARN persists > 24h without compound artifact | BLOCK |

### Gate 6: Knowledge Graph Fresh (Hard Rule #14, v10)

| Check | Blocking |
|-------|----------|
| `graphify-out/` exists in repo | (only run gate if true) |
| Graph stale by ≤ 1 commit on merge | Yes |
| Architectural-touch PR cites a god node | WARN |
| Stale graph + architectural change | WARN → BLOCK (24h) |

**Architectural-touch detection:** PR diff modifies a file that appears as
a god node in `GRAPH_REPORT.md` (top-degree concept) or sits in a community
that the PR description doesn't reference.

**Setup:** `graphify hook install` keeps the graph fresh automatically on
every commit. Gate 6 verifies the hook output exists and is fresh.

**Bypass:** Explicit `[skip-graph-gate]` in commit message with documented
reason — typically only valid when the change is doc-only and the LLM
re-extraction was deferred.

### Gate 7: Vertical-slice discipline (Hard Rule #17, v10)

| Check | Blocking |
|-------|----------|
| PR contains tests but zero implementation diff (RED-only) | Yes (wait for GREEN) |
| PR contains implementation but zero tests added | Yes (write the test) |
| PR labeled `wip` and ≥ 24h old | WARN |

**Detection heuristic:** ratio of test-file changes to non-test-file changes.
A PR that's 100% one or the other is a horizontal slice. Exceptions:
documentation-only PRs, dependency-bump PRs, scaffolding PRs (must be
labeled `scaffold`).

---

## GitHub Actions Template

```yaml
name: GODMYTHOS v10 Quality Gates
on: [push, pull_request]

jobs:
  quality-gates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2  # needed for graph staleness check

      - name: Gate 6 (pre) — Refresh knowledge graph
        if: hashFiles('graphify-out/graph.json') != ''
        run: |
          pip install graphifyy
          graphify . --update --no-viz
          # Verify graph is no more than 1 commit stale
          git diff --quiet HEAD~1 graphify-out/graph.json || echo "Graph rebuilt"

      - name: Gate 1 — Compile
        run: |
          npx tsc --noEmit

      - name: Gate 2 — Test
        run: |
          npm test -- --coverage

      - name: Gate 3 — Security
        run: |
          npm audit --audit-level=high

      - name: Gate 4 — Design Score (UI PRs only)
        if: contains(github.event.pull_request.labels.*.name, 'ui')
        run: |
          npx designlang score $DEPLOY_URL

      - name: Gate 5 — Compound Check
        run: |
          git diff --name-only ${{ github.event.before }}..HEAD | \
            grep -q "docs/knowledge/" || \
            echo "::warning::No compound artifact found"

      - name: Gate 7 — Vertical slice check
        run: |
          # Count test vs non-test file changes
          TEST_CHANGES=$(git diff --name-only ${{ github.event.before }}..HEAD | grep -E '\.(spec|test)\.[jt]sx?$' | wc -l)
          NONTEST_CHANGES=$(git diff --name-only ${{ github.event.before }}..HEAD | grep -vE '\.(spec|test)\.[jt]sx?$|\.md$' | wc -l)
          if [ "$TEST_CHANGES" -gt 0 ] && [ "$NONTEST_CHANGES" -eq 0 ]; then
            echo "::error::Horizontal slice detected (tests only, no impl). Hard Rule #17."
            exit 1
          fi
```

---

## n8n Pipeline Template

For self-hosted CI:

```
Schedule/Webhook trigger
  → SSH: git pull && npm ci
  → SSH: graphify . --update --no-viz (refresh graph if exists, Gate 6)
  → SSH: npx tsc --noEmit (Gate 1)
  → IF error → notification → STOP
  → SSH: npm test (Gate 2)
  → IF failure → notification → STOP
  → SSH: npm audit --audit-level=high (Gate 3)
  → IF high/critical → notification → STOP
  → SSH: npx designlang score <url> (Gate 4, conditional)
  → IF grade < B → notification → STOP
  → SSH: ls docs/knowledge/*.md (Gate 5)
  → IF empty → warning notification (continues)
  → SSH: vertical slice check (Gate 7)
  → IF horizontal-only → notification → STOP
  → SSH: deploy command
  → notification: "✓ deployed | gates passed | grade: {X} | god nodes touched: {N}"
```

---

## Fail Conditions Summary

| Condition | Verdict | Action |
|-----------|---------|--------|
| Compiler error | BLOCK | Fix before merge |
| Test failure | BLOCK | Fix or quarantine |
| Security HIGH/CRITICAL | BLOCK | Patch or remove dep |
| Design grade < B | BLOCK | Fix design system issues |
| Design category D or F | BLOCK | Fix that category specifically |
| No compound artifact | WARN → BLOCK (24h) | Write at least one learning |
| Coverage regression | WARN | Add tests |
| Flaky test detected | WARN → BLOCK (48h) | Fix or quarantine with doc |
| New dep without OSS gate | WARN | Run the gate |
| Stale graph + arch change | WARN → BLOCK (24h) | `graphify . --update` |
| Horizontal-slice PR | BLOCK | Add the missing half (test or impl) |
| Architectural-touch PR no god-node citation | WARN | Cite the god node in PR description |

---

## Override Protocol

Gates can be bypassed with explicit documentation:

1. Commit message must include `[gate-override: {gate-name}]`
2. PR description must include justification
3. Override is logged in `docs/knowledge/override-{date}-{gate}.md`
4. Override must be reviewed by a human (not auto-merged)

"The CI is being annoying" is not a justification. State what the gate caught,
why it's a false positive or acceptable risk, and when it will be resolved.
