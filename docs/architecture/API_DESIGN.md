# API and event design — future contract

The static application implements none of these endpoints. This is a discovery baseline, not a deployable integration specification.

| Operation | Inputs | Result / controls |
|---|---|---|
| POST /quotes | Approved plan ID, versioned features, benefits reference, idempotency key | Issued/review result, version IDs, expiry, cent amounts |
| POST /quotes/{id}/acceptances | Quote version, consent reference, idempotency key | Server-verified expiry and immutable acceptance |
| POST /finance-applications | Quote reference, lender-scoped consent, tokenized applicant reference | Pending partner reference; no local approval |
| POST /partner-events | Signed event, partner ID and event ID | Deduplicated, ordered state transition |
| GET /decisions/{id} | Authorized scope | Redacted decision trace |

Use integer minor units and explicit currency. Distinguish validation, stale/conflicting versions, forbidden access, unavailable partner and review outcomes. Authenticate service identities, validate signatures, reject replay, redact logs and keep patient/credit data out of telemetry. Define legal retention, timeout budgets, compensation, status reconciliation and partner contract tests before implementation.
