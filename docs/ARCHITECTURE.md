# Prototype architecture

The static browser interface calls pure pricing functions in an ES module. A generated model artifact contains fitted ridge-regression coefficients and a residual-calibration interval. The pricing engine enumerates permitted fees in cents, preserves fixed payer-contract fees, evaluates applicable margin constraints, and chooses the closest permitted result to the reference using deterministic ties.

Money is integer cents. Percentage calculations use integer basis points and BigInt half-up rounding. Insurer estimates, patient responsibility, deposit, remaining balance and assumed merchant expense are separate values. Merchant expense applies only to the remaining balance when the financing-expense scenario is selected.

The bank sandbox accepts only a simulated consented action, then stays pending until the presenter explicitly selects a simulated source response. It does not infer underwriting eligibility from medical or financial information. Patient acceptance does not imply lender offer acceptance or settlement.

## Production work not implemented

Replace localStorage with authenticated server-side command handling, scoped authorization, immutable estimate versions, a transactional decision/evidence/outbox store, source-specific adapters and reconciliation. Add tested idempotency, role separation, policy publication, operational monitoring, security threat assessment and recovery controls. Train and independently validate models on authorized, reconciled data with point-in-time features and mature cost labels. Confirm all source and lender contracts before integration. Approve clinical and financial policy before patient use.

The demo fee domain, cost formula and model metrics are synthetic presentation choices. They are not Aspen policy or actual bank terms. The prior architecture documents specify a broader system; this prototype is a bounded demonstration, not evidence that that enterprise system has shipped.
