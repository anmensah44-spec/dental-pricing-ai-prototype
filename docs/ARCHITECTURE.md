# Architecture entry point

The release includes an authenticated Node/SQLite application and a hosted browser studio using shared pricing code. The server-backed implementation is described in [solution architecture](architecture/SOLUTION.md). The original browser-only application is historical code under demo/legacy-browser-app.mjs and is not the active runtime. See [completion matrix](COMPLETENESS.md) for remaining real-world boundaries.

Product and architecture direction: **Andrews Mensah**. [Project status](PROJECT_STATUS.md).


## Insurance scope revision — November 18, 2026

Insurance & Benefits Intelligence is part of the core product. Insured estimates now use recorded, current benefit evidence; self-pay remains separate. Contractual adjustments, deductible, annual maximum and insurer contribution determine the patient remainder used for financing. See [insurance scope](INSURANCE_SCOPE.md) for implemented behavior, acceptance criteria and the external payer integration gates. Live payer connectivity is not configured.
