# IaC, Container, & Supply-Chain Security

Covers Docker, Compose, Kubernetes/Helm, Terraform/OpenTofu, CloudFormation,
Ansible, and SBOM generation. Aligned with Eddie's homelab surface
(Coolify on Ubuntu VM via TrueNAS SCALE, OPNsense + Caddy reverse proxy,
n8n on `10.0.0.237:30109`, Pi-hole on `10.0.0.77`, Wazuh on `10.0.0.179`).

---

## 1. Decision tree

```
What's in front of you?
├── A Dockerfile / docker-compose.yml      → §2 Containers
├── A Helm chart / k8s manifests           → §3 Kubernetes
├── Terraform / OpenTofu / Pulumi          → §4 IaC (HCL/general)
├── CloudFormation / SAM                   → §5 AWS-native IaC
├── Ansible playbook                       → §6 Config management
├── A registry image (no source)           → §2.4 Image-only audit
└── A package manifest (package.json, etc) → §7 SCA + SBOM
```

---

## 2. Containers

### 2.1 Dockerfile review checklist (manual + automated)

- [ ] Base image is **pinned to digest** (`FROM debian:bookworm-slim@sha256:...`),
      not a tag. Tags are mutable.
- [ ] Base image is **minimal** (distroless, alpine, slim, scratch, chainguard).
      `FROM ubuntu:latest` for a Go binary → reject.
- [ ] `USER` directive sets a **non-root** UID before any `CMD`/`ENTRYPOINT`.
      No `USER root` at the end of the file.
- [ ] No secrets in `ENV` or `ARG`. No `RUN echo $SECRET`. Use BuildKit
      mounts: `RUN --mount=type=secret,id=mykey ...`.
- [ ] Multi-stage build: build artifacts and toolchain do **not** ship in the
      runtime image.
- [ ] `HEALTHCHECK` defined (resilience, but also signals expected ports).
- [ ] `COPY` (not `ADD`) for local files. `ADD` only for remote tarballs with
      checksum verification, ideally not at all.
- [ ] No `curl ... | sh` patterns. Pin URLs and verify checksums.
- [ ] No `apt-get upgrade` (drift between builds). Pin package versions.
- [ ] `.dockerignore` excludes `.git`, `.env`, `node_modules`, build caches,
      test fixtures, and any secret-bearing files.
- [ ] No `--privileged`, no `--cap-add ALL` in compose files.
- [ ] Read-only root filesystem (`read_only: true` in compose, or
      `--read-only` at runtime) where possible.
- [ ] Resource limits set (`mem_limit`, `cpus`) to bound DoS impact.

### 2.2 Run Trivy

```bash
# Build, then scan the local image
docker build -t myapp:audit .
trivy image --severity HIGH,CRITICAL --format json -o trivy.json myapp:audit

# Scan a remote image without pulling first (Trivy handles the pull)
trivy image --severity HIGH,CRITICAL ghcr.io/yourorg/app:1.2.3

# Scan a Dockerfile + filesystem context (no build needed)
trivy fs --scanners vuln,misconfig,secret --severity HIGH,CRITICAL .

# Just the Dockerfile misconfigurations
trivy config Dockerfile
```

**Triage rule:** anything from a base image with a published patched version
is auto-HIGH. The fix is `docker pull` + rebuild, not a code change.

### 2.3 Run Hadolint (Dockerfile linter)

```bash
hadolint Dockerfile --format json > hadolint.json
```
Use alongside Trivy — Hadolint catches style/best-practice issues (DL3008,
DL3015, DL3018) that Trivy misses.

### 2.4 Image-only audit (no source available)

```bash
# Inventory layers + commands
docker history --no-trunc --format json IMAGE > history.json

# Extract to FS for inspection
trivy image --download-db-only
trivy image --format spdx-json -o sbom.spdx.json IMAGE
grype sbom:sbom.spdx.json

# Look for secrets in layers
docker save IMAGE -o image.tar
mkdir img && tar -xf image.tar -C img/
gitleaks dir img/ --report-path leaks.json
```

### 2.5 Eddie's Coolify-specific notes
- Coolify-deployed apps land on Talisha. Verify the build runs in a Coolify
  build container, not on the host — host build → host secrets exposure.
- Caddy reverse-proxies. If Caddy terminates TLS, the upstream Coolify
  container should bind to `127.0.0.1` only, not `0.0.0.0`.
- Check Coolify's `docker-compose.yml` for `network_mode: host` — common
  footgun. Reject.

---

## 3. Kubernetes

### 3.1 Manifest checklist

- [ ] No container runs as root (`runAsNonRoot: true`,
      `runAsUser: <non-zero>`).
- [ ] `readOnlyRootFilesystem: true` on the container's securityContext.
- [ ] `allowPrivilegeEscalation: false`.
- [ ] `capabilities: { drop: ["ALL"] }`. Add back only what's needed.
- [ ] No `hostPath` mounts unless explicitly required (and then `readOnly`).
- [ ] No `hostNetwork`, `hostPID`, `hostIPC`.
- [ ] Resource `requests` and `limits` set on every container.
- [ ] `livenessProbe` and `readinessProbe` present.
- [ ] Pod Security Standard label on namespace:
      `pod-security.kubernetes.io/enforce: restricted`.
- [ ] NetworkPolicy default-denies ingress + egress at namespace level.
      Specific NetworkPolicies open only required flows.
- [ ] Secrets via CSI driver or external-secrets-operator + sealed-secrets,
      never plain `Secret` YAML committed to git.
- [ ] ServiceAccount per workload (not default). RBAC scoped to minimum.
      No cluster-admin bindings to workloads.
- [ ] Images pinned to digest in manifest:
      `image: registry.example.com/app@sha256:abc...`
- [ ] `imagePullPolicy: Always` when using mutable tags (transitional);
      `IfNotPresent` once pinned to digest.

### 3.2 Tools to run

```bash
# kubesec — manifest scoring
kubesec scan deployment.yaml

# Trivy — k8s misconfig + image scan
trivy k8s --report summary cluster
trivy config deployment.yaml

# Checkov — broadest policy library
checkov -d ./k8s/ --framework kubernetes -o json

# kube-bench — CIS Kubernetes Benchmark on the cluster itself
kube-bench run --targets master,node

# polaris — best-practices audit, includes a dashboard
polaris audit --audit-path ./k8s/ --format json

# kyverno / OPA Gatekeeper — policy-as-code enforcement
# (cluster-side, not scan-time)
```

### 3.3 Helm-specific

```bash
# Render then scan
helm template release ./chart -f values.yaml > rendered.yaml
checkov -f rendered.yaml --framework kubernetes
trivy config rendered.yaml

# Audit chart dependencies for known vulns
helm dep update ./chart
```

Watch for: `values.yaml` defaults that downgrade security (e.g.
`securityContext: {}` instead of restricted).

---

## 4. Terraform / OpenTofu

### 4.1 Run order (cheap → expensive)

```bash
# 1. Format + validate (free)
terraform fmt -recursive -check
terraform validate

# 2. TFSec — fast, opinionated
tfsec . --format json --out tfsec.json

# 3. Checkov — broadest, slower
checkov -d . --framework terraform -o json --output-file-path checkov.json

# 4. Trivy — also does Terraform now
trivy config --severity HIGH,CRITICAL .

# 5. terrascan — alternative engine, sometimes catches what others miss
terrascan scan -i terraform -d . -o json > terrascan.json

# 6. Infracost (cost, not security, but useful) — flag if a single
#    apply doubles spend, that's often a misconfig signal
```

### 4.2 Critical checks (run these even without tooling)

- [ ] No `*.tfstate` in git. State is plaintext with secrets.
- [ ] State backend is **remote** (S3+DynamoDB, Terraform Cloud, GCS, etc),
      with **encryption at rest** and **versioning** enabled.
- [ ] No hardcoded credentials. `aws_access_key_id`, `password` in
      `*.tf`/`*.tfvars` → CRITICAL.
- [ ] Provider versions pinned (`required_providers { aws = "~> 5.0" }`),
      not floating.
- [ ] No `0.0.0.0/0` ingress on SSH (22), RDP (3389), database ports (5432,
      3306, 27017, 6379), or internal admin UIs (8080, 8443, 9200, etc).
- [ ] S3 buckets: public access **blocked at account + bucket level**,
      encryption enabled, versioning enabled, MFA-delete on prod buckets,
      logging to a separate logs bucket.
- [ ] IAM: no wildcard actions on wildcard resources (`Action: "*",
      Resource: "*"`). Use AWS-managed policies sparingly.
- [ ] KMS keys have rotation enabled, are scoped to a workload, and have a
      DENY-by-default key policy + grant statements.
- [ ] CloudTrail / Cloud Audit Logs enabled in every region, log-file
      validation on, log bucket immutable.
- [ ] All databases encrypted at rest, encrypted in transit, backups
      enabled, deletion protection on.
- [ ] No `prevent_destroy = false` on stateful resources without sign-off.

### 4.3 `*.tfvars` and secret handling

- Use SOPS + age, or HashiCorp Vault dynamic secrets, or AWS Secrets Manager
  with `data` blocks. Never commit plaintext vars files.
- `.gitignore` includes `*.tfvars` and `*.tfvars.json` unless explicitly
  whitelisted (e.g. `example.tfvars`).

---

## 5. CloudFormation / SAM

```bash
# cfn-lint — syntax + AWS-resource validation
cfn-lint template.yaml

# cfn-nag — security-focused
cfn_nag_scan --input-path template.yaml --output-format json

# Checkov — also handles CFN
checkov -f template.yaml --framework cloudformation -o json

# KICS — handles SAM/CFN/Serverless
kics scan -p . --type CloudFormation -o results/
```

Same hardening checklist as Terraform §4.2 — the controls are identical, the
syntax differs.

---

## 6. Ansible

```bash
ansible-lint playbook.yml
checkov -f playbook.yml --framework ansible
```

Key things to flag:
- [ ] `become: yes` everywhere without justification → least-privilege violation
- [ ] `shell:` / `command:` with templated user input → command injection
- [ ] `no_log: false` on tasks that handle secrets → secret leakage in logs
- [ ] `validate_certs: no` / `verify: no` → TLS bypass
- [ ] Plaintext passwords in vars files → use ansible-vault or external secrets

---

## 7. SCA & SBOM

### 7.1 Generate SBOMs

```bash
# Syft — most formats
syft dir:. -o cyclonedx-json=sbom.cdx.json
syft dir:. -o spdx-json=sbom.spdx.json
syft IMAGE -o cyclonedx-json=image-sbom.cdx.json

# Trivy
trivy sbom --format cyclonedx -o sbom.cdx.json dir:.

# cdxgen — best for multi-language monorepos
npx @cyclonedx/cdxgen -o sbom.cdx.json
```

### 7.2 Cross-reference SBOM against CVEs

```bash
# Grype reads SBOM directly
grype sbom:sbom.cdx.json --output json > vulns.json

# OSV-Scanner — Google's, queries OSV.dev (covers more ecosystems than NVD)
osv-scanner --sbom=sbom.cdx.json --format=json --output=osv.json

# Trivy can do it too
trivy sbom sbom.cdx.json --severity HIGH,CRITICAL
```

### 7.3 Direct dependency audits (per-ecosystem)

| Ecosystem | Command |
|---|---|
| npm | `npm audit --json` or `pnpm audit --json` |
| pip | `pip-audit --format json` or `safety check --json` |
| Go | `govulncheck -json ./...` |
| Cargo | `cargo audit --json` |
| Maven | `mvn org.owasp:dependency-check-maven:check` |
| Gradle | `gradle dependencyCheckAnalyze` |
| Composer | `composer audit --format=json` |
| Gemfile | `bundle audit check --update` |
| NuGet | `dotnet list package --vulnerable --include-transitive` |

### 7.4 Renovate / Dependabot configuration

Minimum-viable `renovate.json`:
```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:recommended", ":semanticCommits", "security:openssf-scorecard"],
  "vulnerabilityAlerts": { "enabled": true, "labels": ["security"] },
  "osvVulnerabilityAlerts": true,
  "lockFileMaintenance": { "enabled": true, "schedule": ["before 4am on monday"] },
  "packageRules": [
    {
      "matchUpdateTypes": ["patch"],
      "automerge": true,
      "automergeType": "branch"
    },
    {
      "matchUpdateTypes": ["major"],
      "dependencyDashboardApproval": true
    }
  ]
}
```

---

## 8. Reporting glue

When this skill finishes scanning IaC/containers, the findings flow into the
standard `findings.jsonl` contract from `SKILL.md §7`. Use these `rule`
strings:

| Issue | Rule string |
|---|---|
| Unpinned base image | `CIS-Docker-4.1` |
| Container as root | `CIS-K8s-5.2.5` / `CWE-250` |
| Public S3 bucket | `AWS-S3-001` / `CIS-AWS-2.1.5` |
| Open 0.0.0.0/0 SSH | `CIS-AWS-5.2` / `CWE-284` |
| Hardcoded secret in IaC | `CWE-798` / `OWASP A07:2025` |
| Missing SBOM | `NIST-SSDF-PS.3.2` |
| Unpinned dependency | `CWE-1357` / `OWASP A06:2025` |
| Container CVE (HIGH+) | The CVE ID directly, e.g. `CVE-2024-12345` |

---

## 9. Quick-paste audit prompt

> "Audit the IaC and container surface of this repo. Run Trivy, Checkov,
> tfsec, and Hadolint as applicable. Generate a CycloneDX SBOM with Syft.
> Cross-reference the SBOM against Grype and OSV-Scanner. Apply the
> hardening checklist in `references/iac_container_security.md`. Surface
> only findings with confidence ≥ 80. Output to `findings.jsonl` and a
> rendered `report.md`. Flag any public-network exposure (0.0.0.0/0,
> public S3, unauthenticated admin UIs) as CRITICAL regardless of CVE
> severity."
