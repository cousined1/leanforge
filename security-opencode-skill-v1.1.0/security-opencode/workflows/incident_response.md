# Workflow: Incident Response (INCIDENT mode)

## When to use
- Active or suspected breach
- Leaked credentials (API key in public repo, password dump observed)
- Compromised dependency (e.g. malicious package pulled into build)
- Suspicious agent behavior (an LLM agent took an unexpected action)
- The user says "we got hacked", "I think we're breached", "is this a
  fake email from us"

## Priorities (in order)
1. **Contain** — stop the bleeding
2. **Eradicate** — remove attacker access
3. **Recover** — restore service safely
4. **Learn** — post-mortem, prevent recurrence

DO NOT spend time on detailed forensics before containment is solid.

## Step 0 — Stabilize (immediate)

Before any tool calls, the user is panicking. One short reply:
- Acknowledge
- Ask three things if not already known:
  1. What happened / what evidence triggered the suspicion?
  2. What systems are affected (best guess)?
  3. What's the time-since-detection?
- Recommend they preserve evidence: don't reboot affected hosts, don't
  wipe logs, take snapshots if possible

## Step 1 — Contain (first 60 min)

### Leaked credential
- [ ] Revoke the exposed credential immediately (don't wait to find every
      copy first)
- [ ] Rotate all related credentials (the leaked key was almost certainly
      pair with others on the same machine/repo)
- [ ] Check usage logs: when was the key last used, from what IPs, what
      actions? Flag anything that doesn't match Eddie's known IPs
- [ ] If in public git history: revoke + rewrite history (`git filter-repo`)
      + force-push BUT remember the value is already cached on GitHub /
      mirrors / clones. Treat it as forever-leaked.

### Compromised dependency
- [ ] Pin to a known-clean version immediately (rollback)
- [ ] Rebuild every affected service from scratch with the clean version
- [ ] Scan all dev machines that ever ran `npm install` / `pip install`
      with the bad version — assume any post-install hook ran
- [ ] Rotate every credential the bad package could have seen (env vars
      at build time, anything in the home directory of the install user)

### Compromised host / container
- [ ] Isolate from network (security group rule, firewall block, k8s
      NetworkPolicy)
- [ ] Snapshot disk + memory before terminating
- [ ] Terminate; rebuild from known-good image

### Compromised agent / LLM
- [ ] Disable the agent's tool access (kill the agent process AND revoke
      its tool credentials)
- [ ] Inventory all actions taken by the agent in the suspected timeframe
      (see `references/ai_agent_security.md` Phase 5 observability)
- [ ] Reverse mutations where possible (DB transaction rollbacks, email
      withdrawals, refunds)

## Step 2 — Eradicate (1-24 hours)

- [ ] Determine root cause (which credential, which package, which input,
      which agent decision)
- [ ] Find all artifacts: backdoors, persistence mechanisms, scheduled
      tasks the attacker left behind
- [ ] Walk every place the attacker could have moved laterally
- [ ] Search SIEM (Wazuh on `10.0.0.179` in Eddie's stack) for IOCs back
      to detection time — and 30 days before, in case detection was slow
- [ ] Force-rotate every credential, key, token in the blast radius

## Step 3 — Recover (24-72 hours)

- [ ] Restore services from known-clean state (verify backup integrity
      before restore — backups can be compromised too)
- [ ] Bring up monitoring before bringing up production
- [ ] Re-deploy with hardening fixes applied
- [ ] Verify normal traffic patterns
- [ ] Lift containment in stages, not all at once

## Step 4 — Communicate

Per regulatory and contract obligations:
- [ ] Customers (if data was affected — GDPR 72hr, CCPA reasonable
      timeframe, sectoral rules)
- [ ] Internal stakeholders (leadership, legal, support)
- [ ] Authorities (if required — payment card breach, healthcare,
      critical infrastructure)
- [ ] Public statement (only after legal review)
- [ ] Cyber insurance carrier (call them early, before remediation, to
      preserve coverage)

## Step 5 — Post-mortem (within 14 days)

Write a blameless post-mortem covering:
- Timeline (detection → containment → eradication → recovery)
- Root cause
- What worked in the response
- What didn't work
- Action items (specific, owner, deadline)
- Detection improvements (would the SIEM catch this faster next time?)
- Prevention improvements (would the secure-coding checklist catch the
  root cause next time?)

Feed lessons back into:
- `learnings.md` for future audit runs
- The relevant checklist in this skill (`checklists/secure_code_review.md`,
  `checklists/owasp_top10_2025.md`, etc.)
- Eddie's `Security_skill.md v2.0` if the lesson is governance-level

## Hard rules during incident

- **Never** assume the attacker is out. Even after eradication, monitor
  for re-entry for at least 30 days.
- **Never** pay a ransom without legal counsel and (when applicable) law
  enforcement involvement.
- **Never** publicly comment before legal review.
- **Never** delete evidence — even if it's embarrassing.
- **Never** skip the post-mortem because "we're too busy". The cost of
  the next incident dwarfs the cost of the retro.

## Telegram / Eddie's stack

For Eddie specifically: BoardMeeting group on Telegram (`-5030461334`)
via `@JavonteWindows11_bot` is the incident channel. Wazuh alerts route
there. Open the incident ticket there first, then escalate to relevant
humans by phone/SMS.

## Output

```
.security-audit/<TS>-incident/
├── timeline.md                 # what happened when
├── findings.jsonl              # IOCs, root cause, action items
├── containment-log.md          # every action taken during response
├── communications-sent.md      # who was notified when (with copies)
├── post-mortem.md
└── learnings.md
```

> The `containment-log.md` and `communications-sent.md` are forensic
> records; keep them tamper-evident (commit to a separate audit repo,
> or ship to immutable storage).
