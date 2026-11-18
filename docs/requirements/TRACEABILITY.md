# Requirements and executed evidence — release 2

| ID | Acceptance | Evidence |
|---|---|---|
| BR01 | Clinician approval required and coordinator cannot self-approve | HTTP clinical approval tests |
| BR02 | Stale source assertion and stale entity versions block commands | HTTP freshness/version tests |
| BR03 | Sixteen family models and configured support | Family pricing sweep + model reproduction |
| BR04 | Self-pay cent values remain in ±5% band | Pricing sweeps |
| BR05 | Issued self-pay estimate satisfies 30% risk contribution | Pricing sweeps |
| BR06 | Deposit, payment and funding balances reconcile | HTTP funded/refund/payment journeys |
| BR07 | Single discount; fixed contract precedence | Engine and family sweeps |
| BR08 | Finance expense applies to unpaid initial balance | Legacy engine controls and server estimator |
| BR09 | Separate consent, pending states and ordered simulator events | HTTP finance journey and browser role walkthrough |
| BR10 | Expiry, accepted-plan lock and one acceptance per plan | HTTP acceptance/lifecycle tests |
| BR11 | Repeatable ML with archived data and held-out evaluation | Both Python check scripts |
| BR12 | Server role/patient scope, CSRF, origin and protected files | HTTP access and isolation tests |
| BR13 | Records survive restart and backup recovery | SQLite restart and online backup tests |
| BR14 | Scheduling and clinician-only due-visit completion | HTTP visit journey |
| BR15 | Review dispositions preserve blocked route | HTTP review tests |
| BR16 | Live lender/clinical/vendor systems | Not connected; external blocker matrix |

Source tests define exact scenarios and expected results. This is not a signed client acceptance matrix. Clinical sequences, real benefits/adjudication, multi-organization separation and production operational targets remain outside implemented validation.
