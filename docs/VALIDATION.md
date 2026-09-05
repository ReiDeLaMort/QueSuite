# Validation record

Milestone 0.2, September 5, 2026.

- Lint, strict TypeScript, all 16 repository tests, and the production Worker build passed.
- Migration tests started with the original populated schema and verified asset labels, work-order service locations, audit JSON, and original command replay after the additive upgrade.
- Location tests cover hierarchy rules, normalized duplicate names, original-result retries, company-scoped reads and foreign keys, maximum path length, and atomic asset/association rollback.
- Local D1 HTTP checks passed for site/building/area creation, simultaneous duplicate location requests (one success and one conflict), invalid parents, structured asset selection, legacy labels, work-order location snapshots, and the full existing lifecycle/concurrency flow.
- The local startup conflict caused by duplicate `nodejs_compat` configuration was fixed by giving the migration-only Wrangler file an explicit name. The renamed migration command and local server startup were verified.
- A separate read-only code review found no blocking defects. Browser interactions, responsive layouts, keyboard behavior, and physical-device testing remain unverified. Location edits, moves, deletion, and legacy conversion are not included.

Milestone 0.1, September 5, 2026.

- Lint and strict TypeScript checks passed.
- Seven repository tests passed against the actual SQL and generated schema in isolated SQLite databases.
- Live local D1 HTTP checks passed: asset creation, work-order creation, full lifecycle, original-result retry, persisted snapshot, and two simultaneous updates producing one success and one conflict.
- Production Worker build passed. Browser/device testing has not been performed.
- The local HTTP smoke script leaves clearly labeled synthetic QA records in the local database. These are not deployed to hosted D1.
- Generated Shadcn components and the generated mobile hook are excluded from lint because the untouched catalog has incompatible lint findings. They remain included in TypeScript/build checks. Product code is linted.
- An optional feature-detected WebMCP filter tool is included. No supported WebMCP execution context was available for validation; it is unverified and is not required for the app.

Client review addressed request identity on edited retries, stale refresh ordering, and preserving submitted transition text in visible in-memory drafts. Drafts do not survive a page reload; offline persistence is a later milestone.

Private access is enforced by the hosting perimeter. Application memberships, role isolation, full offline recovery, browser interaction/accessibility checks, backups, and performance testing remain release gates in the roadmap.
