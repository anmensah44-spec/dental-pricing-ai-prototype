# Validation record

Executed on 2026-11-18 against this portfolio source, not a production system.

| Check | Result |
|---|---|
| npm test | 15 passed; 0 failed |
| Scenario sweep | 128 combinations across families, duration, benefits, loyalty, financing and deposits |
| Model reproduction | Archived data checksum, coefficients and held-out MAE verified |
| Synthetic baseline comparison | Ridge held-out MAE below training-mean baseline |
| Markdown local links | All referenced local files resolved |
| GitHub Actions | Run #2: SUCCESS — pricing and model jobs passed at commit 6a852a9. Run #1 detected CSV newline mismatch; fixed before successful rerun. |
| Current UI regression | Not re-executed this release; UI unchanged from earlier preview |
| Real integration / load / security / clinical / lender acceptance | Not implemented or validated |

See validation.json for runtime and timestamp; evaluation.json for synthetic metrics. The screenshot is from an earlier preview, not proof of this release's automated UI tests. This record is not stakeholder sign-off.

[Verified GitHub Actions run #2](https://github.com/anmensah44-spec/dental-pricing-ai-prototype/actions/runs/44359556265). Subsequent changes to this record and README are documentation-only.
