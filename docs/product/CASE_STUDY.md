> Release 2 update: working server-backed synthetic implementation now covers 16 treatment families, CRM, clinical approval, persistent audit, consent, simulated financing settlement and visit tracking. Earlier two-family statements below describe the initial release only. See docs/COMPLETENESS.md for current implementation and external blockers. No real client deployment or business outcomes are claimed.

# Leadership case study: Clarity Dental Pricing AI

## Challenge

Design a credible dental pricing platform connecting clinical approval, estimated costs, financial controls, patient communication and financing. The product discussion referenced Aspen Dental and potential Synchrony/Zest AI involvement; no relationship or integration was verified or implemented.

## Product decisions

The owner prioritized AI at the center of pricing. The implementation translates that intent into a trained cost model feeding constrained optimization, with integer financial calculations and explicit review routes. This makes learned uncertainty visible without delegating exact money arithmetic or clinical authority to a language model.

The first release narrows broad enterprise ambitions to two fictional families so that actual working behavior can be inspected. The financing journey is a simulator because real lender decision authority, contracts, API access and underwriting prerequisites are absent.

## Evidence produced

Runnable application, model training script, held-out synthetic evaluation, control tests, architecture and requirements mapping. Evaluation and validation files carry executed results. GitHub workflow configuration is provided but is not proof that CI has run.

## Outcomes and limits

A functional synthetic prototype and a documented enterprise implementation path exist. No production deployment, patient benefit, revenue lift, cost saving, fair-lending validation or operational adoption is claimed. The next business milestone is discovery and an approved shadow-pilot plan with representative data and accountable clinical/finance owners.

## Interview discussion

Explain why scope was reduced, how price caps constrain the optimizer, how uncertainty changes margin feasibility, why bank underwriting stays with the lender, and what evidence would justify a production pilot. See CONTRIBUTIONS.md for AI assistance and ownership boundaries.
