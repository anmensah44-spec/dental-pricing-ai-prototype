# Implemented API — release 2

All successful operations return JSON. Commands require an authenticated HttpOnly session cookie, X-CSRF-Token, application/json and an Idempotency-Key of 8–100 word/hyphen characters. Login issues the session and CSRF token. Mutating entity commands require current `version`; quote creation requires `planVersion`.

| Method / path | Purpose / role |
|---|---|
| GET /healthz | Public health, DB and audit integrity status |
| POST /api/login; POST /api/logout | Session creation/revocation |
| GET /api/session; GET /api/catalog | Current identity; synthetic catalog/policy/model |
| GET /api/workspace | Scoped patients/plans/quotes/finance/payments |
| POST /api/patients | Synthetic CRM creation; coordinator/admin |
| POST /api/patients/{id}/consent | Explicit contact consent; scoped patient/coordinator/admin |
| POST /api/plans | Draft plan creation; coordinator/admin/clinician |
| POST /api/plans/{id}/approve | Clinical approval; clinician only |
| POST /api/plans/{id}/schedule | Future appointment; clinician/coordinator/admin |
| POST /api/plans/{id}/complete-visit | Complete a due visit; clinician only |
| POST /api/plans/{id}/cancel | Cancel after financing resolved |
| POST /api/quotes | Server-priced estimate; coordinator/admin |
| POST /api/quotes/{id}/accept | Separate consent; patient/coordinator |
| POST /api/quotes/{id}/review | Blocked-estimate disposition; reviewer |
| POST /api/quotes/{id}/payment | Synthetic payment within balance; coordinator/admin |
| POST /api/quotes/{id}/finance | Separate consent; patient/coordinator |
| POST /api/finance/{id}/provider-event | Simulated offer/decline/fund/refund; admin |
| POST /api/finance/{id}/accept-offer | Separate simulated offer consent; patient/coordinator |
| POST /api/finance/{id}/withdraw | Withdraw active unfunded application; patient/coordinator |
| GET /api/quotes/{id}/export | Scoped decision and quote event evidence |
| GET /api/audit | Chain verification and most recent 500 events; admin/reviewer |

Errors: 400 invalid input, 401 no valid session, 403 role/CSRF/origin, 404 unavailable/scoped-out record, 409 stale/duplicate conflict or invalid state, 413 oversized body, 415 content type, 429 sign-in rate limit. Money is safe integer USD cents. Source files and HTTP integration tests define exact request/response structures and examples.

No real lender endpoints, asynchronous partner callbacks or external eligibility API are implemented. There is no advertised production API stability guarantee.
