# Vulnerable Training Environments

Spin these up locally before pointing offensive tools at any system. If
a user asks for help with an attack technique, the polite redirect is to
one of these.

---

## 1. Web app targets

### OWASP Juice Shop
Modern Node.js single-page-app full of OWASP Top 10 bugs. Best starter.
```bash
docker run --rm -p 3000:3000 bkimminich/juice-shop
# → http://localhost:3000
```

### DVWA (Damn Vulnerable Web Application)
Classic PHP, lets you toggle difficulty (low/medium/high/impossible).
```bash
docker run --rm -p 8080:80 vulnerables/web-dvwa
```

### bWAPP
PHP, 100+ vulnerabilities. Good for exhaustive practice.
```bash
docker run --rm -p 8080:80 raesene/bwapp
```

### WebGoat
Java-based, lesson-driven OWASP training.
```bash
docker run --rm -p 8080:8080 -p 9090:9090 webgoat/webgoat
```

### Mutillidae II
PHP, hint-driven progression for beginners.

---

## 2. API & microservice targets

### vAPI
Vulnerable API for OAuth, JWT, mass-assignment, IDOR practice.
```bash
git clone https://github.com/roottusk/vapi
cd vapi && docker compose up
```

### crAPI (OWASP Completely Ridiculous API)
Modern stack (React + Node + Postgres + MongoDB). Best for API Top 10
practice.
```bash
git clone https://github.com/OWASP/crAPI
cd crAPI/deploy/docker && docker compose pull && docker compose up -d
```

### DVGA (Damn Vulnerable GraphQL Application)
For GraphQL-specific issues: introspection, batching, depth attacks.

---

## 3. Cloud security labs

### CloudGoat (AWS)
Terraform-deployed AWS scenarios; you root the cloud, not the host.
```bash
pip install cloudgoat
cloudgoat config aws-region us-east-1
cloudgoat create iam_privesc_by_rollback
```

### TerraGoat (Bridgecrew)
Intentionally misconfigured Terraform for Checkov / TFSec practice.

### CdkGoat
Same as TerraGoat but in AWS CDK (TypeScript).

### SadCloud
Multi-cloud misconfig lab (AWS + Azure + GCP).

---

## 4. Container & k8s labs

### Kubernetes Goat
Multi-scenario vulnerable cluster.
```bash
git clone https://github.com/madhuakula/kubernetes-goat
cd kubernetes-goat && bash setup-kubernetes-goat.sh
```

### Bust-a-Kube
Compromised k8s cluster CTF — get root from a pod.

---

## 5. AI / LLM labs

### Gandalf (Lakera)
Hosted: https://gandalf.lakera.ai/ — prompt injection levels 1–7.

### DoubleSpeak (Lakera)
Hosted prompt-injection CTF with multi-turn agents.

### damn-vulnerable-LLM-agent
Local Docker image with a deliberately exposed tool surface; practice the
5-phase framework in `ai_agent_security.md`.

### MITRE Caldera (with Atomic Red Team)
Adversary emulation for endpoint detection — not LLM-specific but useful
for testing the agent observability stack.

---

## 6. Recon / network targets

### Metasploitable 2 & 3
Deliberately vulnerable Linux/Windows VMs for nmap + Metasploit practice.
```bash
docker run --rm -p 21:21 -p 22:22 -p 80:80 -p 445:445 \
  tleemcjr/metasploitable2
```

### HackTheBox / TryHackMe
Hosted CTF platforms — convenient when you don't want a local lab. Free
tiers exist; paid tiers unlock more boxes.

---

## 7. CTF formats

- **Wargames** — OverTheWire (Bandit, Natas, Leviathan): SSH/Linux/web basics
- **Boot2Root** — VulnHub (download VMs, root them)
- **Jeopardy CTFs** — picoCTF (year-round), DEF CON CTF qualifiers
- **A/D CTFs** — Attack/Defense format, run your own infra while attacking
  others. iCTF, Faust CTF, RuCTF.

---

## 8. Eddie's recommended path

For getting from "I know what these vulns are" to "I can find them in code":

1. **OWASP Juice Shop** — work through the scoreboard
2. **crAPI** — API Top 10 hands-on
3. **CloudGoat** `iam_privesc_*` scenarios — match against your daily
   Terraform reviews
4. **Kubernetes Goat** — match against your Coolify/Talisha k8s surface
5. **damn-vulnerable-LLM-agent** — match against your OpenClaw + MCP
   skill audits

Each pairs with one of the references in this skill — practice the
attack, then look at how the defender's tooling (`references/sast_tools.md`,
`references/dast_pentesting.md`, etc.) would have caught it.
