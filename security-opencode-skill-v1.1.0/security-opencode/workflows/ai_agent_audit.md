# Workflow: AI Agent / LLM Audit (AGENT-AUDIT mode)

## When to use
- Codebase has agent/LLM components (LangChain, LangGraph, custom agents,
  MCP servers, tool-calling apps)
- User says "audit my agent", "is my LLM app safe", "review prompt
  handling"
- Triggered automatically when `requirements.txt` mentions `langchain`,
  `anthropic`, `openai`, `llama-index`, `crewai`, `autogen`, etc., AND
  the user is running the REVIEW or AUDIT workflows

## Time budget
30-60 minutes for a typical agent codebase.

## Steps

This workflow walks the 5 phases from `references/ai_agent_security.md`
in order. Each phase has its own audit prompts and findings.

### Phase 1 — Stop the bleeding (10 min)
Goal: confirm no agent can take irreversible action without a human gate.

1. Inventory every tool the agent has access to. Output a table:
   ```
   | tool_name | mutates_state | gated | gate_type | severity |
   ```
2. For each `mutates_state == true`, verify a human-confirmation gate
   exists. Flag missing gates as CRITICAL.
3. Search for dynamic tool registration (eval, exec, dynamic import based
   on LLM output). Flag as CRITICAL.
4. Inspect tool permission scopes. Are keys per-task or god-mode? Flag
   shared god-mode keys as HIGH.

Use the audit prompts from `references/ai_agent_security.md` Phase 1.

### Phase 2 — Prompt injection defense (10 min)
Goal: untrusted inputs cannot override the system policy.

1. Find every place untrusted text is concatenated into a prompt.
2. Check for Unicode tag (U+E0000–U+E007F), zero-width (U+200B–U+200F),
   BIDI (U+202A–U+202E) stripping on inputs.
3. Check retrieved-document delimiters and labels.
4. Check if the agent renders markdown — if so, check image URL
   allow-listing (exfiltration via image markdown).

### Phase 3 — Defense in depth (10 min)
Goal: limit blast radius assuming injection succeeds.

1. SQL/NoSQL/vector-DB writes built from LLM output? Are they
   parameterized via function-calling with typed args, or raw strings?
   Raw → CRITICAL.
2. Memory store: append-only? Hash-chained? Or naive overwrite-on-write?
3. Vector DB namespaces: per-agent? Per-tenant? Or shared?
4. Retrieval confidence thresholds? Quorum for high-stakes decisions?

### Phase 4 — Trust hardening (10 min)
Goal: prevent TOCTOU, double-spends, replay.

1. Token/quota/balance operations — atomic? Or read-then-act with a gap?
2. Idempotency keys on every external write?
3. Replay-safe nonces on inter-agent messages?

### Phase 5 — Observability (10 min)
Goal: provable record of what happened.

1. LLM calls logged with model, prompt hash, output hash, latency, cost?
2. Tool calls logged with args (redacted secrets), result hash, caller,
   gate decision?
3. Logs flow to SIEM (Eddie's Wazuh on `10.0.0.179`)?
4. Anomaly detection on token spend / action rate / retrieval volume?
5. Trace IDs propagate across spans?

### Step 6 — Run the LLM-specific scanners (10 min)

```bash
# Garak — generative LLM probing
garak --model_type openai --model_name gpt-4 --probes promptinject,realtoxicityprompts
# (substitute for the actual model the agent uses; lab environment only)

# promptfoo — eval suite, can be CI-integrated
npx promptfoo init
# edit promptfooconfig.yaml with the agent's prompts, run:
npx promptfoo eval

# VulnHawk — for the application code around the LLM
vulnhawk scan src/

# rebuff — runtime middleware check
# (verifies the agent uses prompt-injection middleware)
grep -rn "rebuff" src/
```

### Step 7 — Render findings
Each phase produces findings rows for `findings.jsonl`. Use these rule
strings:

| Issue | `rule` |
|---|---|
| Tool runs `os.system(llm_output)` | `LLM-CWE-077` / custom |
| No human gate on state-changing tool | `LLM-A05-AGENT-AUTONOMY` |
| Prompt injection no defense | `OWASP-LLM-01` |
| LLM-built SQL | `OWASP-LLM-02` / `CWE-89` |
| Vector DB cross-tenant write | `OWASP-LLM-03` |
| Excessive agency | `OWASP-LLM-08` |
| Insufficient logging | `OWASP A09:2025` |

(OWASP LLM Top 10 has its own numbering. When in doubt, cite both the
OWASP LLM category AND the closest CWE.)

### Step 8 — Compound retro
Write to `learnings.md`:
- Which agents were hardest to gate (legitimate auto-actions vs.
  exfiltration risk)?
- Where did Phase 2 sanitization break legitimate Unicode in retrieved
  content?
- Which observability gaps would have made the next incident easier to
  triage?

## Output (in addition to standard structure)

```
.security-audit/<TS>-agent-audit/
├── findings.jsonl
├── report.md
├── tool-inventory.csv     # the table from Phase 1
├── prompt-injection-tests/
│   ├── garak/
│   └── promptfoo/
├── trace-samples/         # captured LLM traces from observability stack
└── learnings.md
```
