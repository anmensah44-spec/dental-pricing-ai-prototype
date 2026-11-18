# Requirements and executable evidence

| ID | Requirement / acceptance | Evidence | Status |
|---|---|---|---|
| BR01 | Unapproved treatment cannot receive issued estimate | engine.test.mjs approval test | Implemented |
| BR02 | Stale benefits route review | engine.test.mjs freshness test | Implemented |
| BR03 | Unsupported family or duration routes review | engine tests | Implemented |
| BR04 | Self-pay gross remains within ±5% | engine test and scenario sweep | Implemented |
| BR05 | Risk contribution meets configured 30% floor | scenario sweep | Implemented for self pay |
| BR06 | Deposit + balance equals patient responsibility | reconciliation sweep | Implemented |
| BR07 | Discount applies once; incompatible contract discount withheld | engine tests | Implemented |
| BR08 | Financing fee applies to unpaid balance | engine test | Implemented fictional policy |
| BR09 | Financing cannot imply automatic qualification | state labels and walkthrough | Simulator only |
| BR10 | Saved estimates have expiry and acceptance flow | app.mjs and walkthrough | Browser-only; no server enforcement |
| BR11 | Model is reproducible with held-out evaluation | scripts and evidence | Implemented synthetic only |
| BR12 | Production access, audit, consent and bank integration | readiness register | Not implemented |

User story: as a coordinator, I need a clear review reason when a price is infeasible so that I can escalate without overriding policy. Given a filling with 110 minutes and zero lab cost, when self-pay pricing runs, then INFEASIBLE review is returned.

User story: as finance, I need exact payer/patient/deposit reconciliation. Given issued estimates across supported cases, patient + payer must equal net and deposit + balance must equal patient, with no negative balance.

The two-family demonstration does not cover all treatment types, multi-stage bundles, reversals, appeals, claim adjudication, multi-currency or longitudinal balances. These require separate discovery and acceptance criteria.
