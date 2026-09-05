# Baby-step roadmap

1. **Foundation 0.1 (complete):** PRD, domain boundaries, ADRs, OpenAPI contract, strict TypeScript, lint, repository tests, CI, persistent asset/work-order lifecycle.
2. **Locations 0.2 (this delivery):** site → building → work area, asset location selection, same-company references, safe upgrade of existing records. Location editing and legacy conversion remain future work.
3. **Identity:** managed sign-in, organization memberships, role enforcement, active references. Gate: cross-company and per-role tests pass before independent team access.
4. **Offline proof:** installable app shell, IndexedDB cache/outbox, replay ordering, sync indicators, conflict review. Gate: airplane mode, app restart, lost response, revocation, and concurrent-edit tests pass on target devices.
5. **Team field pilot:** limited equipment set, named users, observed maintenance cases, feedback log, backup/restore rehearsal. Gate: the team verifies workflow effectiveness and no lost changes.
6. **Choose the next CMMS module:** procedures, PM scheduling, or parts based on actual feedback. Agree scope before schema and implementation.
7. **Multiple-company product:** tenant onboarding, operational monitoring, support, migration/restore practices, performance and isolation review. Billing follows demonstrated demand.

Current status: online owner-led prototype. Individual accounts, offline behavior, automatic scheduling, and production operations remain future work.

Domain registration, social handles, and public launch work are deferred at the owner's direction. They are not prerequisites for building or validating the app.
