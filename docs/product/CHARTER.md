# Product charter and business case

**Product owner and AI Product Director: Andrews Mensah**

## Vision

Create a unified dental care-to-cost platform that connects treatment plans, transparent estimates, patient choice, CRM and financing workflows. Andrews established the vision, scope, requirements and architecture direction and directed delivery of the integrated application.

## Users and value

Treatment coordinators prepare and explain estimates; clinicians control treatment approval and visit completion; patients manage acceptance and separate financing consent; finance and reviewers inspect constraints, exceptions and reconciled balances.

The value hypothesis is reduced estimate preparation and rework, more understandable patient costs and consistent financial controls. The product measures operational results alongside safety and reconciliation indicators.

## Delivered application

Sixteen treatment families; CRM and consent; clinical plan approval and visit tracking; server-side ML cost estimation; constrained cent-level pricing; exact payer/patient/deposit arithmetic; versioned acceptance; financing lifecycle; payment and funding reconciliation; persistent database; scoped roles; audit and recovery tooling.

## Business case

Baseline estimates per month, handling time, rework, loaded labor rates, model/data costs, infrastructure, integration and support costs. Calculate annual handling opportunity as eligible volume × minutes saved ÷ 60 × loaded hourly cost, then subtract implementation and recurring costs. Finance validates benefits through a controlled pilot, accounting for case mix and seasonality.

## Product accountability

Andrews directs vision, scope, priorities and acceptance expectations. Clinical leadership owns treatment policy; finance owns fee/discount/contract policy; data science owns model evidence; engineering owns reliability; security and privacy own deployment controls. The release evidence connects requirements to executed tests.

Current data and integration details: [Project status](../PROJECT_STATUS.md).
