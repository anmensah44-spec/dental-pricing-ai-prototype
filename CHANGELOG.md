# Insurance scope release — November 18, 2026

Product direction: Andrews Mensah.

- Added Insurance & Benefits Intelligence to the core care-to-payment workflow.
- Replaced the active pricing engine’s fixed payer allowance with recorded benefit evidence and exact-cent PPO allocation.
- Added separate insured and self-pay paths, verification evidence, freshness and changed-source gates.
- Restricted financing to the residual patient balance; added estimate supersession and renewed consent workflow.
- Updated role worklists, patient profiles, decision ownership, leadership export and 16 GrapesJS canvases.
- Added calculation, permission, failure-path, HTTP persistence and financing tests; 55 automated checks pass.
- External payer connectivity, advanced plan rules and claims/remittance expansion are tracked in docs/INSURANCE_SCOPE.md.

# Changelog

## 2.0.0 — 2026-11-18

Replaced the browser-only runtime with a working Node/SQLite synthetic reference application. Added role-separated CRM, clinical approval, scheduling, visits, server pricing, sixteen-family trained model, exact ledger, consent, full local financing simulator through funding/refund, idempotency, version conflicts, persistent audit, restart and backup checks. UI, operations and completion matrix distinguish implemented workflows from external vendor blockers.


## 1.1.0 — 2026-11-18

Prepared the working synthetic prototype for portfolio review. Added product/BA/architecture/governance documentation, contribution disclosure, reproducible dataset and evaluation, meaningful boundary and scenario tests, CI configuration and interviewer walkthrough. Hardened model/deposit validation. Published to the private GitHub repository on 2026-11-18; see the validation record for CI status.

This is an initial curated repository baseline; dates do not imply a historical client delivery.
