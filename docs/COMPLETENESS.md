# Completion matrix — release 3.0.0

Reviewed 2026-11-18. Definition of done for this release: a runnable evaluation reference application with durable records, role-separated workflows, ML inference, exact pricing, simulated finance lifecycle, documented operation and executed tests. Integration and deployment stages are recorded in [Project status](PROJECT_STATUS.md).

| Original gap | Current implementation / evidence | Remaining boundary |
|---|---|---|
| Browser-only storage | SQLite WAL; restart and backup recovery tests | Single instance; no HA or multi-region deployment |
| No authentication | Scrypt passwords, server sessions, CSRF and roles | Shared evaluation accounts; no SSO/MFA/account administration |
| Clinical approval checkbox | Clinician-only plan command and active-plan checks | Actual clinical policy and clinical record integration unavailable |
| Two treatment families | 16-family evaluation model and pathway catalog | Visit counts illustrative; no real validated fee data |
| Client-side pricing | Server inference, cent search, input validation | Evaluation policy; no real contracts/adjudication |
| No CRM | Local evaluation CRM with contact consent | No external CRM synchronization |
| Incomplete financing | Consent, pending, offer, acceptance, funding, refund, decline, withdrawal | Local simulator only; lender credentials/contract absent |
| No auditable lifecycle | Transactional entity versions, event chain, duplicate protection | Privileged DB owner can alter data; no external audit anchor |
| No acceptance authority | Server expiry, active-plan and one-accepted-estimate checks | No legally binding e-signature system |
| No financial reconciliation | Deposit/payments/funding/refund ledger invariants | No payment processor or bank settlement |
| No operational package | Health, backup, graceful shutdown, runbook, Docker source | Docker not executed; no hosted Node environment provisioned |
| Incomplete testing | Engine, HTTP integration, negative paths, model reproduction, browser journey | No exhaustive security, accessibility or production load certification |
| 404 repository link | Public GitHub repository verified; main-branch CI passed | Hosted Site uses its existing owner sign-in |
| Editable visual design | Embedded GrapesJS; seven screen layouts, styles, responsive previews and exports | Saved canvas designs are separate from application workflow execution |

## External prerequisites

Aspen Dental system access and permission; authoritative treatment, cost and payer data; Synchrony and Zest AI commercial/technical discovery and sandbox credentials; signed clinical/finance policies; real-data privacy/security/model-risk review; a selected hosting account and budget. None was supplied or independently established by this project.

No live underwriting is performed. No ML score determines a real person's lending eligibility. No real funds move. Unsupported real-world operation remains blocked rather than silently simulated.

Product and architecture direction: **Andrews Mensah**. [Project status](PROJECT_STATUS.md).
