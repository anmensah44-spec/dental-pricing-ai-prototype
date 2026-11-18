# Model and data card

Model: synthetic-ridge-1. Intended use: illustrate cost-estimation inference in a portfolio demo, not clinical decision-making or real pricing.

Features: intercept, crown indicator, chair minutes, lab cost USD. Target: synthetic treatment cost USD. Generation uses NumPy seed 42, 1,400 independent rows, a known linear relationship plus Gaussian noise. Train/calibration/test splits are 900/250/250. Split assignment follows generated row order; it is not a temporal or patient-level split. Data contain no real patient, protected-trait, credit or geographic information.

Ridge penalty is 0.01 on non-intercept coefficients. Calibration uses the higher empirical 90th percentile absolute residual, producing a symmetric interval. This is an illustrative calibrated residual interval, not a finite-sample coverage guarantee or a guaranteed bound on actual costs. The optimizer uses the upper endpoint as a risk estimate; actual costs may exceed it.

The evaluation report compares held-out error against a training-mean baseline and reports family-level errors and coverage. It measures performance only on the same synthetic generator. Linear structure favors ridge; these results cannot establish superiority on real dental data. No hyperparameter search, subgroup fairness validation, site holdout, temporal holdout, causal validation or clinical review was conducted.

The dataset CSV and checksum make generation inspectable. No fitted preprocessing is required. A real model needs licensed representative cost data, label definition, leakage checks, missingness/outlier policy, site/time holdouts, baseline comparisons, calibrated uncertainty and agreed error/coverage thresholds by use case. Train/test separation, approvals and artifact signatures must be enforced in a production registry.

LLM/RAG capabilities and image models are future options only. No LLM is invoked by this application. No credit model is trained and no applicant eligibility decision is made.
