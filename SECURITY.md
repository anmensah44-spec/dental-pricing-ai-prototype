# Security and data handling — release 2

Synthetic data only. The application has server-side scrypt password hashing, random hashed session tokens, 8-hour expiry, HttpOnly SameSite=Strict cookies, CSRF and origin checks, role permissions, patient scoping, input/body limits, login rate limiting, prepared SQL statements, CSP and static-file allowlisting. Use COOKIE_SECURE=true behind HTTPS.

The shipped accounts and sample password are public evaluation identities. They do not establish real user identity or clinical authority. Set DEMO_PASSWORD before first database creation for private evaluation; SSO, MFA, invitation/provisioning, password rotation and account recovery are not implemented. No real PHI or financial applications may be entered.

SQLite stores data locally; disk encryption and host security are deployment responsibilities. Audit chaining and append-only triggers do not protect against a privileged database owner. Login attempts are limited in instance memory; this is not a distributed abuse-prevention service. No penetration test or compliance certification is claimed.

Never commit .env files, credentials, runtime databases or real datasets. Report security concerns privately to the repository owner; keep sensitive data out of public issues.
