# NIST CSF 2.0 — Mapping & Audit Checklist

NIST Cybersecurity Framework 2.0 (released Feb 2024) is organized into six
**Functions**: **GOVERN, IDENTIFY, PROTECT, DETECT, RESPOND, RECOVER**.
The GOVERN function is new in 2.0 compared to 1.1.

Use this file to map findings to CSF Categories and Subcategories, for
compliance reporting alongside the OWASP and CMMC layers in
`Security_skill.md v2.0`.

For each finding, set the `rule` field in `findings.jsonl` to
`NIST CSF <FUNCTION>.<CATEGORY>-<SUBCATEGORY>` (e.g.
`NIST CSF PR.DS-02`).

---

## GV — GOVERN (new in 2.0)

Establishes and monitors the organization's cybersecurity risk-management
strategy, expectations, and policy.

### GV.OC — Organizational Context
- [ ] **GV.OC-01** Org mission understood, informs cybersecurity strategy
- [ ] **GV.OC-02** Internal/external stakeholders identified
- [ ] **GV.OC-03** Legal/regulatory requirements understood and managed
- [ ] **GV.OC-04** Critical objectives, capabilities, services
      understood and communicated
- [ ] **GV.OC-05** Outcomes/dependencies on suppliers understood

### GV.RM — Risk Management Strategy
- [ ] **GV.RM-01** Risk management objectives established
- [ ] **GV.RM-02** Risk appetite/tolerance statements approved
- [ ] **GV.RM-03** Cybersecurity risk integrated into enterprise risk

### GV.RR — Roles, Responsibilities, Authorities
- [ ] **GV.RR-01** Leadership accountable for cyber risk
- [ ] **GV.RR-02** Roles/responsibilities for cybersecurity established
- [ ] **GV.RR-03** Adequate resources allocated commensurate with risk

### GV.PO — Policy
- [ ] **GV.PO-01** Policy established, communicated, enforced
- [ ] **GV.PO-02** Policy reviewed, updated, communicated

### GV.OV — Oversight
- [ ] **GV.OV-01** Risk-management strategy reviewed
- [ ] **GV.OV-02** Performance evaluated

### GV.SC — Cybersecurity Supply Chain Risk Management
- [ ] **GV.SC-01** SCRM program established
- [ ] **GV.SC-02** Roles/responsibilities for SCRM established
- [ ] **GV.SC-03** SCRM integrated into broader risk management
- [ ] **GV.SC-04** Suppliers known, prioritized by criticality
- [ ] **GV.SC-05** Requirements for managing SCRM established
- [ ] **GV.SC-06** Due diligence performed on suppliers
- [ ] **GV.SC-07** Risks of suppliers, products, services understood
- [ ] **GV.SC-08** Relevant suppliers included in incident planning
- [ ] **GV.SC-09** SC security practices integrated across the lifecycle
- [ ] **GV.SC-10** SCRM plan includes provisions for termination

> *This is the function where Eddie's `Security_skill.md v2.0` overlays
> the CMMC 2.0 and Zero Trust frameworks. Keep that doc as the
> authoritative source for governance-level deliverables; this file is
> for technical audit mapping.*

---

## ID — IDENTIFY

Develop an understanding of cybersecurity risk to systems, people,
assets, data, and capabilities.

### ID.AM — Asset Management
- [ ] **ID.AM-01** Hardware inventoried
- [ ] **ID.AM-02** Software/services inventoried
- [ ] **ID.AM-03** Network communications/data flows mapped
- [ ] **ID.AM-04** External services catalogued
- [ ] **ID.AM-05** Assets prioritized by criticality
- [ ] **ID.AM-07** Data inventoried by sensitivity
- [ ] **ID.AM-08** Systems/HW/SW/services managed throughout lifecycle

### ID.RA — Risk Assessment
- [ ] **ID.RA-01** Vulnerabilities in assets identified, recorded,
      prioritized, evaluated
- [ ] **ID.RA-02** Cyber threat intel received from sharing forums
- [ ] **ID.RA-03** Internal/external threats identified, recorded
- [ ] **ID.RA-04** Potential impacts/likelihoods of threats identified
- [ ] **ID.RA-05** Threats, vulnerabilities, likelihoods, impacts used
      to determine risk
- [ ] **ID.RA-06** Risk responses chosen, prioritized, planned, tracked
- [ ] **ID.RA-07** Changes/exceptions managed, recorded, reviewed
- [ ] **ID.RA-08** Vulnerability disclosure process established
- [ ] **ID.RA-09** Authenticity/integrity of HW/SW assessed before use
- [ ] **ID.RA-10** Critical suppliers assessed prior to acquisition

### ID.IM — Improvement
- [ ] **ID.IM-01** Improvements identified from evaluations
- [ ] **ID.IM-02** Improvements identified from tests/exercises
- [ ] **ID.IM-03** Improvements identified from operations
- [ ] **ID.IM-04** Incident response plans/playbooks established/improved

---

## PR — PROTECT

Develop and implement appropriate safeguards.

### PR.AA — Identity Management, Authentication, Access Control
- [ ] **PR.AA-01** Identities and credentials managed for users, services, hardware
- [ ] **PR.AA-02** Identities proofed and bound to credentials
- [ ] **PR.AA-03** Users, services, hardware authenticated
- [ ] **PR.AA-04** Identity assertions protected, conveyed, verified
- [ ] **PR.AA-05** Access permissions/entitlements/authorizations defined,
      managed, enforced (least privilege, separation of duties)
- [ ] **PR.AA-06** Physical access to assets managed/monitored

### PR.AT — Awareness and Training
- [ ] **PR.AT-01** Personnel provided awareness training
- [ ] **PR.AT-02** Specialized roles trained on specialized topics

### PR.DS — Data Security
- [ ] **PR.DS-01** Data-at-rest confidentiality/integrity protected
- [ ] **PR.DS-02** Data-in-transit confidentiality/integrity protected
- [ ] **PR.DS-10** Data-in-use confidentiality/integrity protected
- [ ] **PR.DS-11** Data backed up, secured, tested

### PR.PS — Platform Security
- [ ] **PR.PS-01** Config baselines established/applied (hardening)
- [ ] **PR.PS-02** Software maintained, replaced, removed (patching)
- [ ] **PR.PS-03** Hardware maintained, replaced, removed
- [ ] **PR.PS-04** Log records generated/available for monitoring
- [ ] **PR.PS-05** Installation/execution of unauthorized software prevented
- [ ] **PR.PS-06** Secure SW development practices integrated (SSDF)

### PR.IR — Technology Infrastructure Resilience
- [ ] **PR.IR-01** Networks/environments protected from unauthorized
      logical access/usage
- [ ] **PR.IR-02** Tech assets protected from environmental threats
- [ ] **PR.IR-03** Resilience mechanisms implemented for normal/adverse
      situations
- [ ] **PR.IR-04** Adequate resource capacity to ensure availability

---

## DE — DETECT

Develop and implement appropriate activities to identify cybersecurity
events.

### DE.CM — Continuous Monitoring
- [ ] **DE.CM-01** Networks/network services monitored
- [ ] **DE.CM-02** Physical environment monitored
- [ ] **DE.CM-03** Personnel activity/tech usage monitored
- [ ] **DE.CM-06** External service-provider activity monitored
- [ ] **DE.CM-09** Computing HW/SW, runtime environments monitored

### DE.AE — Adverse Event Analysis
- [ ] **DE.AE-02** Potentially adverse events analyzed to characterize
      activities
- [ ] **DE.AE-03** Information correlated from multiple sources
- [ ] **DE.AE-04** Estimated impact and scope of adverse events
- [ ] **DE.AE-06** Information on adverse events provided to authorized
      staff/tools
- [ ] **DE.AE-07** Cyber threat intel/other contextual info integrated
      into analysis
- [ ] **DE.AE-08** Incidents declared when adverse events meet criteria

> In Eddie's stack: DE.CM-01/09 = Wazuh on `10.0.0.179` + OpenSearch;
> DE.AE-06/08 = Telegram alerts to BoardMeeting group via
> `@JavonteWindows11_bot`.

---

## RS — RESPOND

### RS.MA — Incident Management
- [ ] **RS.MA-01** IR plan executed during/after incident
- [ ] **RS.MA-02** Incident reports triaged and validated
- [ ] **RS.MA-03** Incidents categorized and prioritized
- [ ] **RS.MA-04** Incidents escalated/elevated as needed
- [ ] **RS.MA-05** Criteria for initiating incident recovery applied

### RS.AN — Incident Analysis
- [ ] **RS.AN-03** Analysis performed to determine what occurred + cause
- [ ] **RS.AN-06** Actions performed during investigation recorded;
      records preserved
- [ ] **RS.AN-07** Incident data/metadata collected; integrity preserved
- [ ] **RS.AN-08** Incident magnitude estimated/validated

### RS.CO — Incident Response Reporting and Communication
- [ ] **RS.CO-02** Internal/external stakeholders notified
- [ ] **RS.CO-03** Information shared with designated stakeholders

### RS.MI — Incident Mitigation
- [ ] **RS.MI-01** Incidents contained
- [ ] **RS.MI-02** Incidents eradicated

---

## RC — RECOVER

### RC.RP — Incident Recovery Plan Execution
- [ ] **RC.RP-01** Recovery portion of IR plan executed once initiated
- [ ] **RC.RP-02** Recovery actions selected, scoped, prioritized, performed
- [ ] **RC.RP-03** Integrity of backups/restoration assets verified
      before restoration
- [ ] **RC.RP-04** Critical mission functions/cybersecurity risk
      considered to establish post-incident operational norms
- [ ] **RC.RP-05** Integrity of restored assets verified, systems/services
      restored, normal operating status confirmed
- [ ] **RC.RP-06** End of incident recovery declared; documentation
      completed

### RC.CO — Incident Recovery Communication
- [ ] **RC.CO-03** Recovery activities/progress communicated to
      designated internal/external stakeholders
- [ ] **RC.CO-04** Public updates issued using approved methods/messaging

---

## Quick-paste audit prompt

> "Audit this organization/repo against NIST CSF 2.0. For each function
> (GV, ID, PR, DE, RS, RC), score each subcategory as Partial/Risk-Informed/
> Repeatable/Adaptive (CSF tiers) or simply Pass/Fail for binary checks.
> Map technical findings to CSF subcategories via the `rule` field
> (`NIST CSF PR.DS-02` etc.). Cross-reference with Eddie's
> Security_skill.md v2.0 for governance-level controls."

## Tier scoring shortcut

When scoring an entire org/repo:
- **Tier 1 — Partial**: ad-hoc, reactive
- **Tier 2 — Risk Informed**: management-approved but not org-wide
- **Tier 3 — Repeatable**: formally adopted, regularly updated, org-wide
- **Tier 4 — Adaptive**: continuously improving, predictive, lessons fed
  back into strategy

Most small teams realistically sit between Tier 1 and Tier 2. Tier 3 is
the goal for production-grade SaaS; Tier 4 is enterprise/regulated.
