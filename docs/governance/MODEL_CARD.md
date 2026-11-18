# Active model and data card — synthetic-multifamily-ridge-2

Intended use: a working synthetic reference application, not real clinical, pricing or lending decisions. Features are sixteen treatment intercepts, chair minutes and laboratory cost USD. Active artifact: dist/cost-model.json. The v1 two-family model remains as historical regression evidence.

The generator scripts/train_enterprise.py produces 4,800 independent synthetic rows: 300 per family. Within each family, 180 train, 60 calibrate and 60 test: total 2,880/960/960. A known category-linear formula plus Gaussian noise generates costs. It is not representative patient/practice data. There are no personal, protected-trait or credit features. Chair/lab support spans 15–180 minutes and $0–$1,500; these are simulation boundaries, not clinical norms.

Ridge penalty is 0.01. The empirical higher 90th percentile calibration residual sets a symmetric interval. It is not a guaranteed cost upper bound. Reported held-out MAE is approximately $9.45 and coverage approximately 91.77%, only on this synthetic generator. Family metrics and mean-baseline comparison appear in evidence/multifamily_evaluation.json. scripts/check_enterprise.py independently verifies archived CSV checksum, coefficients, calibration and test error. Linear generation favors ridge and cannot establish real-world superiority.

A real release requires representative licensed cost labels, clinical and financial validation, site/time/patient holdouts, leakage checks, calibrated uncertainty, subgroup/error monitoring and approved rollback criteria. No credit model, LLM, image model or vendor model is called. Exact arithmetic and policy constraints are deterministic parts of the AI-enabled system.
