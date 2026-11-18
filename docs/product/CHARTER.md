> Release 2 update: working server-backed synthetic implementation now covers 16 treatment families, CRM, clinical approval, persistent audit, consent, simulated financing settlement and visit tracking. Earlier two-family statements below describe the initial release only. See docs/COMPLETENESS.md for current implementation and external blockers. No real client deployment or business outcomes are claimed.

# Product charter and business case

Owner: Andrews Mensah. Status: independent prototype; baseline 2026-11-18.

## Problem and intended users

Dental estimates combine treatment costs, approved care plans, price constraints, benefits and patient payment choices. The hypothesis is that transparent estimates and exception routing can reduce pricing rework while preserving clinical and financial authority. Intended users are treatment coordinators, finance reviewers and product/clinical governance teams.

## Measurable objectives

Prototype gates: reproducible model artifact; correct cent arithmetic; no issued self-pay estimate violating configured movement/margin limits; clear blocked routes; finance outcomes visibly simulated. Production hypotheses: lower median estimate preparation time, fewer manual corrections, better patient comprehension and stable contribution margins. These require measured baseline and controlled pilot; no savings or conversion lift has been demonstrated.

## Release boundary

Executable scope is two fictional treatment families, one synthetic benefits policy and one simulated financing journey. Enterprise requirements span CRM/EHR ingestion, real contract versions, longitudinal plans, multi-office access, vendor adapters and monitoring. Clinical treatment selection, live underwriting, disbursement and real patient data are excluded from this release.

## Business case method

Establish estimates/month, current handling minutes, loaded labor rate, rework cost, infrastructure cost, licensing, integration effort and support cost with accountable owners. Annual labor opportunity = eligible volume × minutes saved ÷ 60 × loaded hourly cost. Net value subtracts implementation and recurring costs and includes an uncertainty range. Do not treat an estimate as booked savings or combine increased collections with the same revenue twice.

A pilot must compare eligible offices/cohorts, track case mix and seasonal changes, and measure safety/error rates alongside commercial outcomes. Finance owns value validation; clinical leadership owns appropriateness. The product sponsor recommends go/no-go after independent evidence review.

## Acceptance and accountability

Technical lead owns reproducibility and system integrity; finance owns signed policy; clinical lead owns treatment approval process; data science owns model validity; security/privacy own real-data readiness; lender owns lending decisions. These are proposed accountable roles, not assigned personnel. Open commercial assumptions include vendor rights, APIs, pricing and underwriting responsibilities. Deployment beyond synthetic use is gated by the readiness register.
