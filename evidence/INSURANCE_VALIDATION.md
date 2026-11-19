# Insurance scope validation

Product owner and delivery direction: Andrews Mensah. Verification period: November 18–19, 2026.

`npm test`: **55 passed, 0 failed**. JUnit output: `test-results-insurance.xml`.

New checks cover exact contractual adjustments, deductible application, annual maximum exhaustion, percentage rounding, source attestation, malformed inputs, missing/inactive/incomplete/stale coverage, cross-patient matching, source replacement, role restrictions, patient-only visibility, insured/self-pay routes, residual financing and HTTP source-to-quote-to-finance behavior. Existing clinical approval, audit, restart persistence, consent, idempotency and financial reconciliation checks continue to pass.

Browser walkthrough: recorded a sample verification, routed to the correct insurance-backed estimate, checked the itemized patient balance and inspected the refreshed GrapesJS editor screen list. Updated editable canvases include insurance, insured estimate and self-pay estimate, plus the existing role workspaces.

The recorded verification pathways run locally using sample responses or staff-entered source evidence. No real payer endpoint, actual eligibility result, document-extraction model or claims adjudication was tested. Provider-specific integration acceptance remains a delivery gate. Full details: ../docs/INSURANCE_SCOPE.md.
