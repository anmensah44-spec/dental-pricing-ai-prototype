# Clarity Dental — Role-based UX design review

**Product owner, architecture direction and delivery leadership: Andrews Mensah**

## Design objective

Give executive stakeholders a clear view of delivery and decision ownership, while making daily tasks familiar and efficient for the care team, clinicians, reviewers and patients. The visual system uses midnight navigation, indigo actions, white content surfaces and explicit text labels for status. Color supports meaning; it never carries the meaning alone.

## Role and task model

| Workspace | Primary need | Main actions | Decision authority |
|---|---|---|---|
| Executive / director | Readiness and unresolved decisions | Inspect ownership, exceptions and financial progress; export a leadership brief | Delivery oversight; clinical authority remains with the clinician |
| Nursing & coordination | Keep each patient moving | Prepare records, confirm contact permission, create drafts, schedule visits and coordinate patient decisions | Coordinator permissions; no clinical approval |
| Dentist / clinician | Review appropriate care and complete visits | Open a focused plan, inspect details, approve clinically and complete due appointments | Clinical plan approval and clinical visit completion |
| Pricing & risk reviewer | Resolve exception ownership | Inspect reason codes and model evidence; record a source or policy review disposition | Review routing; cannot turn a blocked price into an issued price |
| Patient | Understand and choose | View own care plans, review itemized estimates and give separate financing consents | Personal treatment and financing decisions |

## Information architecture

Each role starts at its own workspace with relevant metrics and a prioritized worklist. Navigation contains the destinations relevant to that role. Labels use familiar tasks: Patient records, Treatment plans, Approval center, Pricing & estimates and Financing. The patient sees My care, My treatment, My estimates and My financing.

The shared approval center separates clinical review, pricing exceptions, patient decisions and roles/authority. Each item names the next owner. Clinical review links to the full treatment plan before approval. A focused plan can be expanded back to all plans with one control.

## Review hierarchy

Clinical plan → pricing verification → patient estimate acceptance → separate application/offer consent → provider funding event → ongoing care. Executive oversight spans the journey; it is not substituted for clinical or patient authorization. Pricing exceptions remain blocked after a review disposition until a valid subsequent decision is created. The funding adapter currently uses the local sandbox.

## Interaction and usability decisions

- Prioritize actionable tasks over promotional dashboard content.
- Separate All tasks from Needs attention, with visible counts.
- Retain predictable patient, plan, amount, status and next-owner patterns.
- Show true empty states and the next meaningful action rather than invented appointments or operating results.
- Use large labeled controls, keyboard focus, clear headings and consistent status text.
- Use the same pricing logic in the hosted workspace and authenticated Node application. Browser perspective switching supports review; Node authorization remains enforced by the API.
- Preserve separate consent for treatment estimates, financing applications and financing offers.
- Keep executive exports grounded in current records, with versions and named decision owners.

## Editable design deliverables

The GrapesJS studio includes role-specific executive, clinical, nursing and patient canvases, alongside the core application and approval-center layouts. Reviewers can edit text, layers and styles, preview responsive layouts and export design JSON/HTML. Design edits remain separate from application workflow execution.

## Review and acceptance checklist

| Review area | Evidence / acceptance |
|---|---|
| Clinical handoff | A clinician opens one draft, reviews it and records approval; the task clears. Executive approval of clinical care remains rejected. |
| Pricing handoff | A reviewer sees open exceptions; dispositions preserve the blocked route. |
| Patient scope | Patient tasks use only records returned within the patient scope; internal approval and governance routes are absent from patient navigation. |
| Consent freshness | Expired or cancelled treatment estimates do not appear as pending patient consent tasks. |
| Leadership review | Executive brief export contains current counts, clinical handoffs, pricing reasons and owners. |
| Responsive design | Role navigation, worklists and approval cards adapt to narrow screens; the editor provides device previews. |
| Adoption review | Clinical, nursing, patient and executive stakeholders should walk through their own tasks and record feedback before an operational rollout. |

## Approval record

This package is prepared for stakeholder review. Stakeholder names, feedback, decisions, conditions and approval dates should be recorded through the delivery governance process. No stakeholder endorsement is implied by this design document.


## Insurance scope revision — November 18, 2026

Insurance & Benefits Intelligence is part of the core product. Insured estimates now use recorded, current benefit evidence; self-pay remains separate. Contractual adjustments, deductible, annual maximum and insurer contribution determine the patient remainder used for financing. See [insurance scope](INSURANCE_SCOPE.md) for implemented behavior, acceptance criteria and the external payer integration gates. Live payer connectivity is not configured.
