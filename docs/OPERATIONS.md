# Operation and recovery

## Local operation

Install Node 24+, clone the repository and run npm start. No npm dependencies are required. Stop with Ctrl+C. Configuration can be supplied in process environment or a local ignored .env copied from .env.example. Database initialization creates five shared evaluation accounts. DEMO_PASSWORD applies only to initial account creation; changing it later does not rotate stored passwords. Production identity administration is not implemented.

Default listen address is 127.0.0.1:4173. Keep evaluation evaluation private. HTTPS reverse proxies need PUBLIC_ORIGIN and COOKIE_SECURE=true. An upstream access gate is required for hosted evaluation with shared demonstration identities. APP_MODE accepts only evaluation mode; changing a flag does not authorize real patient use.

GET /healthz reports database access and audit verification. On database/audit errors stop changes, preserve the database, inspect the last valid backup and rerun application tests. Do not repair evidence by deleting audit rows.

## Backup and restore

With the source database available, create a new destination:

```bash
node scripts/backup.mjs data/clarity.sqlite /absolute/private/backup.sqlite
```

The helper uses SQLite VACUUM INTO and PRAGMA integrity_check, checks destination nonexistence and restricts backup permissions. Protect backups as carefully as the application database. Tests exercise an open WAL database and recovery into a separate file.

For restore, stop the server; keep the current database and its WAL/SHM files together in a recovery directory. Start a separate instance pointing DB_PATH at the verified backup copy and a different PORT. Inspect /healthz and the UI before replacing any primary data. Never copy a live SQLite main file alone while writes may be in WAL. This repository does not automate destructive restores.

## Container source

Dockerfile and compose.yaml bind the application to localhost and persist a named data volume. Run `docker compose up --build` in an environment with Docker. The container path is not executed in this workspace, and no successful container deployment is claimed.

No externally hosted Node service has been provisioned by this release. GitHub source publication does not host the application. The earlier private static Site remains an older version and cannot run this Node backend unchanged.

Product and architecture direction: **Andrews Mensah**. [Project status](PROJECT_STATUS.md).
