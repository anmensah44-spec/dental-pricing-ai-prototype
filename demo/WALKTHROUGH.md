# Working application walkthrough

Start with Node 24+ and npm start; open http://127.0.0.1:4173/. Choose a role and Open sample workspace. Use only fictional records. The sample patient account maps to Demo patient 001.

1. Coordinator creates a Single crown plan for Demo patient 001. A draft cannot be quoted. Coordinator cannot clinically approve it.
2. Sign out; dentist approves. The plan now appears in coordinator's pricing options.
3. Coordinator selects current synthetic benefits, $100.01 deposit, fixed payer and financing expense. Evaluate: $1,800 net, $500 estimated payer, $1,300 patient responsibility and $1,199.99 remaining balance. Inspect model and policy versions.
4. Record estimate consent; separately consent to simulated financing. Financing begins PENDING.
5. Director simulates offer. Patient separately accepts it. Director simulates funding. Pricing shows $1,199.99 simulated funding and zero unpaid balance.
6. Director can simulate refund. A synthetic coordinator payment then reconciles the restored balance. No real funds move.
7. Coordinator schedules the plan's illustrative visits. Dentist can complete a visit only after its scheduled time; all planned visits complete the pathway. Automated tests advance a test clock to verify completion without waiting.
8. Director or reviewer verifies audit; export a quote's decision evidence. Refresh and restart the server: records remain.

Negative paths: use a high-cost EXAM configuration to trigger review; reviewer disposition cannot issue it. Mark benefits stale. Retry a stale version through API tests. Patient sees only their own records. Active financing must be withdrawn or refunded before plan cancellation.

Browser verification is recorded in evidence/VALIDATION.md. Tests also cover decline, withdrawal, expiry, duplicate requests and restart/backup recovery. Screenshots reflect actual local synthetic execution. The older overview.jpg and legacy-browser-app.mjs are historical artifacts and are not the active application.
