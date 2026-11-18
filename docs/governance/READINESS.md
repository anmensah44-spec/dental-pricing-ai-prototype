# Governance, vendor readiness and production gaps

Status: synthetic demonstration only. No gate below is approved by publication of this repository.

| Priority | Gap / required evidence | Proposed owner |
|---|---|---|
| Critical | Clinical workflow and authority approval; actual treatment policies | Clinical lead |
| Critical | Finance-approved fees, margin, discount and contract rules | Finance / revenue cycle |
| Critical | Representative licensed data; independent model validation | Data science / model risk |
| Critical | Access control, encryption, consent, retention, audit integrity | Security / privacy |
| Critical | Bank agreements, authorized APIs and lender decision boundary | Legal / lender relationship owner |
| High | EHR, CRM and payer mappings with reconciliation | Integration engineering / BA |
| High | Versioned quote/acceptance state and transaction/idempotency guarantees | Backend engineering |
| High | Monitoring, drift thresholds, rollback and human fallback | MLOps / operations |
| High | Load, accessibility, recovery and threat-model tests | QA / platform engineering |
| High | Customer research and measured pilot business case | Product / finance |

Vendor evaluation must confirm supported use case, API availability, sandbox, decision ownership, data processing terms, sub-processors, model-change notifications, SLAs, incident response, portability, costs and exit strategy. Synchrony and Zest AI names express design intent only. No access or compatibility is assumed.

Geographic expansion requires separate review of data residency, currencies, local contracts, clinical workflows, languages, financing permissions and model representativeness. Do not deploy US assumptions globally without that review.

Risk: a polished demo may be mistaken for a clinical or banking product. Mitigation: synthetic labels, explicit simulator states and contribution disclosure. Risk: synthetic evaluation may be misread as real performance. Mitigation: publish generator and evidence limits. Risk: browser records can be edited or lost. Mitigation: prohibit real data and require a server ledger before operational use.

Escalate any real-data request or proposed live price/credit decision to the designated business, clinical, privacy and lender owners. This register is a planning document, not a compliance certification.
