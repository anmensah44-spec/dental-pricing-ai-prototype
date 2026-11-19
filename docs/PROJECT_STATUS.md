# Project status

Clarity Dental was created and led by **Andrews Mensah**, AI Product Director and Product Owner. This page records implementation facts in one place.

| Area | Current status |
|---|---|
| Application | Node/SQLite implementation with CRM, clinical plan approval, pricing, consent, visit tracking, audit and financial reconciliation |
| Insurance | Recorded benefit evidence, single-primary in-network PPO allocation, insured/self-pay routes and freshness gates; external payer API activation remains open |
| Data | Generated evaluation fixtures; no patient or practice dataset was used |
| Model | Trained/calibrated/tested on generated records; results describe that dataset |
| Financing | Local sandbox state machine; applications, offers, funding and refunds are simulated |
| External systems | EHR, payer, external CRM, Synchrony and Zest AI connections require authorized partner configuration |
| Deployment | GitHub source is public; server application runs in a Node environment; current hosted studio uses the redesigned browser workspace and embedded GrapesJS editor |
| Validation | 55 passing Node tests and model reproduction checks; see evidence/VALIDATION.md for executed tests and CI; production load, full security and clinical acceptance remain separate validation stages |

Aspen Dental, Synchrony and Zest AI are design references. Commercial relationships, vendor authorization and measured business outcomes are established through their respective delivery processes. No such engagement or outcome is inferred from publication of this repository.

Generated data and sandbox integrations support testing and review. Keep real patient and credit information out of the evaluation environment. Model identifiers, dataset checksums, test records and historical audit entries retain their original values for reproducibility.


## Insurance scope revision — November 18, 2026

Insurance & Benefits Intelligence is part of the core product. Insured estimates now use recorded, current benefit evidence; self-pay remains separate. Contractual adjustments, deductible, annual maximum and insurer contribution determine the patient remainder used for financing. See [insurance scope](INSURANCE_SCOPE.md) for implemented behavior, acceptance criteria and the external payer integration gates. Live payer connectivity is not configured.
