# SAST Tools — Deep Dive

Companion to `tool_matrix.md`. Use this when you need concrete invocation
recipes, rule-tuning guidance, and known gotchas per tool.

---

## Semgrep — the workhorse

### Install
```bash
pip install --user semgrep
# or via Homebrew / Scoop
```

### Quick runs
```bash
# Auto-config — uses Semgrep's curated rulesets for detected languages
semgrep --config auto --json -o sg.json .

# Specific rulepacks
semgrep --config p/security-audit --config p/owasp-top-ten --config p/r2c-ci .

# Just one language
semgrep --config p/python --config p/django .

# CI mode (only changed files vs baseline)
semgrep ci --baseline-ref origin/main

# SARIF output for GitHub code scanning
semgrep --config auto --sarif -o sg.sarif .
```

### Tuning
- Add `.semgrepignore` to skip vendor, fixtures, generated code.
- Write custom rules in `.semgrep/<name>.yml` — Semgrep's pattern syntax
  is close to the target-language syntax with `$X`, `$Y` metavariables.
- Use `--severity ERROR` to drop info/warning noise during triage.

### Known gotchas
- FastAPI dependency-injection patterns trip several SQL-injection rules
  (the `Depends()` arg is a function, not a query). Add to ignore list.
- React's `dangerouslySetInnerHTML` will always flag — confirm the source
  is server-controlled trusted HTML before suppressing.

---

## Bandit (Python)

```bash
pip install bandit[toml]
bandit -r src/ -f json -o bandit.json
# Skip tests
bandit -r src/ -x src/tests --severity-level medium
# Read config from pyproject.toml [tool.bandit]
bandit -c pyproject.toml -r src/
```

Key rules:
- **B101** `assert` used (stripped in optimized bytecode — don't gate
  security checks on it)
- **B105/B106** hardcoded password
- **B201** Flask `debug=True`
- **B301–B307** `pickle.loads`, `marshal`, `shelve`, `eval`, `exec`, etc.
- **B501** `requests` with `verify=False`
- **B602–B605** `subprocess` with `shell=True`
- **B703** Django `mark_safe` on user input

Suppress per-line with `# nosec B###` plus a comment explaining why.

---

## ESLint security plugins (JS/TS)

```bash
npm i -D eslint eslint-plugin-security eslint-plugin-no-unsanitized
# For TS:
npm i -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

Minimal `.eslintrc.json`:
```json
{
  "plugins": ["security", "no-unsanitized"],
  "extends": [
    "eslint:recommended",
    "plugin:security/recommended-legacy",
    "plugin:no-unsanitized/DOM"
  ],
  "rules": {
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-new-func": "error"
  }
}
```

For Node-specific:
```bash
npm i -g njsscan
njsscan --json-output njs.json src/
```

---

## gosec (Go)

```bash
go install github.com/securego/gosec/v2/cmd/gosec@latest
gosec -fmt=sarif -out=gosec.sarif ./...
# Exclude tests + vendored
gosec -exclude-dir=vendor -exclude-dir=mocks ./...
# Only HIGH severity
gosec -severity=high ./...
```

Pair with `govulncheck` for known CVEs in dependencies:
```bash
go install golang.org/x/vuln/cmd/govulncheck@latest
govulncheck -json ./... > vuln.json
```

---

## Brakeman (Ruby on Rails)

```bash
gem install brakeman
brakeman -A --no-pager -o brakeman.json -f json
```

Brakeman is Rails-aware — it understands `params`, `ActiveRecord`, ERB
templates, route mapping. False positives are rare; treat findings as
real.

---

## SpotBugs + Find Security Bugs (Java)

```bash
# Maven
mvn com.github.spotbugs:spotbugs-maven-plugin:check \
    -Dspotbugs.plugins=com.h3xstream.findsecbugs:findsecbugs-plugin:1.13.0

# Gradle
./gradlew spotbugsMain spotbugsTest
```

Configure in `pom.xml` / `build.gradle`. Output: `spotbugsXml.xml` →
convert to SARIF with `spotbugs-sarif`.

---

## PHP — PHPStan + Psalm + Progpilot

```bash
composer require --dev phpstan/phpstan vimeo/psalm designsecurity/progpilot
vendor/bin/phpstan analyse src --level=max
vendor/bin/psalm --taint-analysis
vendor/bin/progpilot src/
```

Psalm's taint-analysis mode is the closest PHP has to deep dataflow; use
it alongside Progpilot's security ruleset.

---

## Custom Semgrep rules — quick examples

### Catch tool calls that use raw LLM output
`.semgrep/agent-state-mutations.yml`:
```yaml
rules:
  - id: llm-output-to-shell
    message: LLM output passed to shell — command injection risk
    severity: ERROR
    languages: [python]
    pattern-either:
      - pattern: subprocess.$F($X, ..., shell=True)
      - pattern: os.system($X)
      - pattern: os.popen($X)
    pattern-where:
      - pattern: $X = $LLM.$Y(...)
        where:
          - metavariable-pattern:
              metavariable: $LLM
              patterns:
                - pattern-either:
                    - pattern: openai
                    - pattern: anthropic
                    - pattern: $CLIENT
                    - pattern: llm
```

### Catch missing auth middleware on FastAPI routes
```yaml
rules:
  - id: fastapi-unauthenticated-route
    message: FastAPI route lacks authentication dependency
    severity: WARNING
    languages: [python]
    pattern: |
      @$ROUTER.$METHOD(...)
      def $FN(...):
        ...
    pattern-not: |
      @$ROUTER.$METHOD(...)
      def $FN(..., $USER = Depends($AUTH), ...):
        ...
    metavariable-regex:
      $METHOD: ^(get|post|put|delete|patch)$
```

---

## Triage rubric for SAST output

Apply in order:
1. Confidence < 80 → log only, do not surface
2. In test/fixture code → log only
3. In vendored / generated code → log only
4. Already suppressed with documented `# nosec` / `// eslint-disable` →
   verify justification still applies; if yes, log only; if no, surface
5. Everything else → surface, severity per tool

Roll up by CWE / OWASP category so the same root-cause issue across 10
files doesn't look like 10 separate findings.
