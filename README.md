# Clarity Dental — Working Reference Application

AI-assisted portfolio by **Andrews Mensah**. Release **2.0.0** implements a complete **local synthetic workflow**, from CRM and clinical plan approval through pricing, patient consent, simulated financing, ledger reconciliation and visit completion.

This is an independent reference implementation, not a commissioned Aspen Dental deployment. No live EHR, payer, Synchrony or Zest AI integration or real credit approval exists. The original enterprise vision is larger than this release; [scope and completion matrix](docs/COMPLETENESS.md) states exactly what is implemented and what remains externally blocked.

## Run the working application

Requires **Node.js 24+**. No npm packages, bank credentials or AI API keys are required to run the application.

```bash
git clone https://github.com/anmensah44-spec/dental-pricing-ai-prototype.git
cd dental-pricing-ai-prototype
npm start
```

Open **http://127.0.0.1:4173/**. Choose a role and click **Open sample workspace**. Public synthetic accounts are `coordinator`, `dentist`, `reviewer`, `director`, and `patient`. Default sample password: `Clarity-Demo-2026!`. These shared sample identities are not enterprise identity management. The patient account is scoped to Demo patient 001.

The server creates `data/clarity.sqlite`. Records survive sign-out, browser refresh and server restart. Database files and secrets are ignored by Git. Use fictional data only. A static file server or GitHub Pages alone cannot run this version: it needs its Node backend.

## Complete a journey

1. **Coordinator → Treatment plans:** create a Single crown plan for Demo patient 001.
2. Sign out; **dentist:** clinically approve that draft.
3. **Coordinator → Pricing:** evaluate the approved plan, inspect costs and patient responsibility, record explicit estimate acceptance.
4. Submit separate financing consent. **Director → Financing:** simulate an offer.
5. **Patient:** separately accept the simulated offer. **Director:** simulate funding.
6. **Pricing:** verify unpaid balance is zero; export the decision. A simulated refund restores the outstanding balance; synthetic payments can then settle it.
7. **Treatment plans:** schedule visits. Dentist can complete visits after their scheduled times; all illustrative visits complete the pathway.
8. **Director → AI & audit:** inspect the hash-chain audit evidence.

See [walkthrough](demo/WALKTHROUGH.md) for failure paths and role changes.

## What runs end to end

| Area | Implemented behavior |
|---|---|
| CRM | Synthetic patient references and explicit contact consent |
| Clinical | Draft, clinician approval, scheduling, visit completion and cancellation |
| Coverage | 16 synthetic treatment categories, with illustrative visit counts |
| AI | Server-side ridge cost inference; training/calibration/test artifacts and independent checks |
| Pricing | Cent-level optimizer, movement cap, margin constraint, contract precedence and single discount |
| Consent | Separate estimate, application and simulated offer acceptance |
| Financing | Pending, offered, accepted, funded, declined, withdrawn and refunded states; local simulator |
| Financial ledger | Deposit, subsequent synthetic payments, simulated funding/refund, unpaid balance |
| Review | Infeasible estimates remain blocked; reviewer dispositions cannot issue a quote |
| Integrity | Transactions, idempotency, optimistic versions, patient scope and append-only hash-chain events |
| Operations | Health checks, persisted records, online SQLite backup and recovery checks |

![Working application](demo/screenshots/application-v2.jpg)

## Test and reproduce

```bash
npm test
python3 -m venv .venv
source .venv/bin/activate
pip install -r scripts/requirements.txt
npm run evidence
```

Tests cover happy and rejected paths, exact reconciliation, role and patient access, duplicate commands, stale versions, expiry, simulated funding/refund, visits, audit and restart/backup recovery. Python verifies both the retained v1 model and active 16-family model. All model results are synthetic, not real dental accuracy evidence.

See [validation record](evidence/VALIDATION.md) for executed counts, browser checks and GitHub CI. Container files are supplied as an alternate launch path, but Docker execution is unverified in this workspace.

## Repository access and the 404

This repository was created **private**. GitHub returns 404 to signed-out users or accounts without access. Sign in as **anmensah44-spec** to inspect it. Interviewers need explicit collaborator access or a public release. Repository visibility is separate from application hosting; this URL displays source code, not a running web application.

## Inspect the evidence

- [Completion matrix and external blockers](docs/COMPLETENESS.md)
- [Architecture](docs/architecture/SOLUTION.md) and [implemented API](docs/architecture/API_DESIGN.md)
- [Product charter](docs/product/CHARTER.md), [roadmap](docs/product/STRATEGY_ROADMAP.md), [case study](docs/product/CASE_STUDY.md)
- [Requirements traceability](docs/requirements/TRACEABILITY.md)
- [Model/data card](docs/governance/MODEL_CARD.md), [governance](docs/governance/READINESS.md), [security](SECURITY.md)
- [Operations and backup](docs/OPERATIONS.md), [contribution disclosure](CONTRIBUTIONS.md)

The broader enterprise system still requires real-data rights, vendor agreements/APIs, independently validated models, real clinical/finance policy, organization identity, deployment infrastructure and operational acceptance. Those cannot be completed by changing labels or substituting simulated results.
