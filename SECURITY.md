# Security and data handling

Use synthetic scenarios only. Do not enter patient identifiers, financial applications, credentials or clinical records. The application has no authentication or backend. Decisions persist in user-editable localStorage; clearing site data removes them. JSON exports should contain fictional cases only.

No real vendor secrets are required. Never commit .env files, tokens, patient data or downloaded production datasets. Report a suspected issue privately to the repository owner through the GitHub profile contact channel; avoid including sensitive data in public issues.

Production controls are listed in docs/governance/READINESS.md. No penetration test, HIPAA compliance assessment, banking approval or production security sign-off has been completed.
