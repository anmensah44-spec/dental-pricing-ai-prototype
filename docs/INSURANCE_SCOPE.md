# Clarity Dental — Insurance and Benefits Intelligence

Product owner and architecture direction: **Andrews Mensah**. Scope revision: November 18, 2026.

## Product decision
Insurance is a core part of the treatment-to-payment journey. Insured patients review an insurance-backed estimate of their personal responsibility before choosing payment or financing. Patients without insurance use a separate self-pay path. Financing never includes the estimated payer share or contractual write-off.

## Implemented in this release
- Insurance & benefits workspace across care-team, clinical, reviewer, executive and patient navigation; patient access is read-only and patient-scoped in the authenticated backend.
- Per-treatment verification records: payer, masked member suffix, intended service date, source reference, verification actor/time, 24-hour freshness policy, status, network scope and outstanding issues.
- Named-payer sample scenarios for active, inactive and unresolved responses; staff-verified benefit entry with source attestation. Sample responses do not contact insurers.
- Exact-cent single-primary in-network PPO allocation: allowed amount, contractual adjustment, applicable remaining deductible, insurer coverage percentage, remaining annual maximum, estimated payer contribution and patient responsibility.
- Insured quote creation requires the latest matching, resolved, current verification. A caller-supplied snapshot cannot replace server-held evidence. Immutable estimate snapshots retain the source.
- Acceptance, financing submission and funding recheck current evidence. Reverification supersedes the prior source; refresh the estimate when evidence changes.
- Self-pay requires no insurance record. Existing clinical approval, deposit, margin, consent, role and reconciliation controls remain.
- Patient-facing explanation of the benefit calculation and uncertainty; this is a rule-based explanation, not an LLM coverage determination. The learned delivery-cost model continues to inform pricing.

## Calculation
For the supported in-network scenario: allowed = minimum(charge, recorded allowed amount); adjustment = charge − allowed; deductible = minimum(allowed, applicable remaining deductible); insurer = minimum(remaining annual benefit, rounded coverage percentage × (allowed − deductible)); patient = allowed − insurer; remaining patient balance = patient − deposit − subsequent patient payments − funded financing.

Contractual adjustments are never financed or presented as patient debt. Insurer adjudication determines final reimbursement; a verification or pretreatment estimate is not a payment guarantee.

## Integration architecture and next delivery gates
Patient intake → practice backend → dental eligibility connectivity partner → supported payer → normalized source record → extraction/validation → staff exception resolution → financial calculation → patient acceptance → residual financing → claims/remittance reconciliation.

External partner selection is open. DentalXChange eligibility/enhanced eligibility APIs are evaluation candidates. No live Aetna, BCBS or other payer connection is configured. Before activation: execute required contracts/BAAs; obtain credentials; verify plan-level coverage; implement authenticated backend requests, payer/plan IDs and subscriber matching; validate 270/271 mapping; implement timeouts/retries, audit and monitoring; run payer-specific acceptance tests. Credentials must never enter the static client.

Additional delivery scope: benefit-document extraction with source citations; procedure/tooth/date granularity and licensed CDT mappings; network and fee-contract validation; waiting/frequency/replacement/alternate-benefit rules; primary/secondary coordination; DHMO and out-of-network methods; predeterminations/authorizations; claim submission and attachments; claim status; 835/EOB posting, denial workflows and final reconciliation. These remain explicit dependencies, not silently approximated by the current PPO formula.

## Operational controls
The 24-hour TTL is a product policy, not a payer guarantee. Service-date changes require reverification. Multi-visit plans require date/procedure-specific benefits before production use. Remaining annual maximum is an external snapshot: this release does not reserve benefits across multiple treatment plans or know pending claims elsewhere. Incomplete scenarios must be resolved by the care team; no missing values are invented. Public browser mode is for review using sample references; real patient information belongs only in an appropriately secured deployment.

## Acceptance criteria
1. No insured estimate without current matching resolved evidence.
2. Fee = contractual adjustment + insurer contribution + patient responsibility.
3. Remaining patient balance excludes payer share and write-off.
4. Inactive, missing, stale, cross-patient and unresolved records block the insured route.
5. The self-pay route works without verification.
6. Patient roles cannot create or alter verification records.
7. Source changes invalidate old insured acceptance/financing/funding until refreshed.
8. API state persists across restart and changes appear in the audit trail.

## References
- ADA: https://www.ada.org/resources/practice/dental-insurance/eligibility-verification
- ADA coordination: https://www.ada.org/resources/practice/dental-insurance/ada-guidance-on-coordination-of-benefits
- DentalXChange API: https://developer.dentalxchange.com/eligibility-api
- Aetna predeterminations: https://www.aetnadental.com/professionals/claim-submission-guidelines/precertification-predetermination-guidelines.html

## Refreshing accepted estimates
A coordinator or director may supersede an issued estimate after withdrawing active financing. Estimates with recorded payments require reconciliation before replacement. Superseding retains the previous record and clears its acceptance, allowing a new estimate with current insurance evidence and new patient consent. Old estimates cannot be financed. Existing financial records are not silently rewritten.
