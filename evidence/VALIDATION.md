# Release 3 validation

Reviewed 18 November 2026. The current application suite passes **42 tests with zero failures**. Both model reproduction checks pass. Browser review verified the treatment-plan modal, patient drawer/search, pricing with an exact $50.01 deposit, model evidence, separate offer consent, sandbox funding, editable screen text, layout saves, mobile preview and JSON export.

The redesigned application and visual editor were published as Site version 4. GitHub [release 3 CI](https://github.com/anmensah44-spec/dental-pricing-ai-prototype/actions/runs/44373339188) passed for commit `c4a7c62d1abbd834c2bbb03fd846380f83e864bf`. The final presentation cleanup is validated separately in the final-review record.

See [redesign validation](REDESIGN_VALIDATION.md), [application screenshot](../demo/screenshots/application-v3.jpg) and [editor screenshot](../demo/screenshots/design-studio-v3.jpg).

## Archived release 2 validation

Executed 2026-11-18 on Node 24.22.3. Full machine-readable test output: test-results-v2.xml; record: validation.json.

| Verification | Result |
|---|---|
| Node tests | 36 passed; zero failures |
| Pricing matrices | 128 legacy configurations + 128 active family configurations |
| HTTP integration | Role/record isolation, CSRF/origin/content limits, approval, freshness, versions, duplicate commands, consent, finance/funding/refund/payment, reviews, visits, expiry, cancellation, audit and restart |
| Concurrent retries | 10 simultaneous retries produced exactly one plan and event |
| Backup recovery | Open WAL database backup recovered records; overwrite refused |
| ML reproduction | Both archived data checksums, coefficient fits, held-out error, calibration and baselines passed |
| Actual browser journey | Plan → clinician approval → quote → consent → simulated application → offer → patient offer consent → funding → zero balance |
| Browser evidence | Actual JSON download, reload persistence and audit-chain verification passed |
| GitHub CI | SUCCESS — application and models jobs; run 44364313774 |
| Docker / real integrations / production security, load and clinical acceptance | Not executed or not available |

The local browser test used a $1,800 synthetic crown, $500 estimated payer and $100.01 deposit. Simulated funding was $1,199.99; unpaid balance was $0.00. No bank or patient data was used. API tests complete due appointments using an injected test clock; the browser test did not wait through future appointments.

The old validation-v1.json records the previous release and its successful CI run. It does not certify v2. This record is test evidence, not clinical, legal or executive approval.

[Verified v2 CI run](https://github.com/anmensah44-spec/dental-pricing-ai-prototype/actions/runs/44364313774), tested commit `64d87b60dce028230074151290491226565f27ba`. All 63 published files matched local Git blob hashes before this documentation-only evidence update.
