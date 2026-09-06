# QueSuite CMMS engineering rules

This project proves a maintenance workflow with the owner's team before expanding to a product for multiple companies. Read README.md, docs/PRD.md, docs/ARCHITECTURE.md, docs/adr/, and docs/openapi.json before feature work.

## Boundaries

- app/: routes and screens; route handlers call lib/server; UI must never import db or server modules.
- lib/domain.ts: portable types and domain validation, with no UI, database, or platform imports.
- lib/server/: application operations and HTTP validation. Database access stays here behind the repository boundary.
- db/: schema and runtime binding. drizzle/: generated, append-only applied migrations.
- components/ui/: generated primitives; compose at call sites, preserve accessibility.
- tests/: domain/database tests. docs/: product decisions, API contract, and pilot plan.
- .github/, .vscode/, public/, scripts/ are allowed support directories. Discuss new top-level directories before adding them.

## Scope and correctness

- Build one reviewed workflow at a time. Do not invent CMMS modules, AI features, billing, physics simulation, or ERP integrations.
- Preserve future operations ideas in docs/OPERATIONS-REGISTER.md with stable IDs and separate decision/delivery status. Captured ideas are not implementation authorization. Keep deferred/declined ideas and their reasons; update the selected increment's contract and scope before feature work.
- Keep company ownership on every business record and reference. The fixed pilot organization is not tenant authentication.
- Do not call this pilot multi-user, offline-ready, or production-ready. Consult docs/ROADMAP.md for the gates.
- Server rules own the work-order lifecycle. Never accept a client organization, actor, or role as authoritative.
- Every accepted work-order mutation, audit entry, and idempotency result must commit atomically. A zero-row update must not create a success event.
- Replays must return the original response before checking versions. Reused operation IDs with different data must fail without writes.
- Never resolve conflicts with automatic last-write-wins.
- No hard deletion of maintenance history. Applied migrations and their metadata are immutable.
- Update the API contract and tests with any behavior change.
- Never commit secrets, local databases, build outputs, or dependency directories.

## Collaboration

- Canonical source: https://github.com/ReiDeLaMort/QueSuite. `origin` is GitHub; the original checkout retains `sites` for publishing. Do not confuse a GitHub push with an application deployment.
- Human edits, Codex, and Claude use the same source and lockfile. Give each concurrent editor different files; review the diff before switching tools.
- Do not add a new dependency or service without discussing its purpose with the owner. Existing pinned dependencies may be installed from the lockfile.
- Run pnpm check and pnpm build before a handoff. Explain any check that was not run.
- Prefer small commits and explicit next steps. Do not claim planned capabilities are implemented.
