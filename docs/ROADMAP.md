# Baby-step roadmap

1. **Foundation 0.1 (this delivery):** PRD, domain boundaries, ADRs, OpenAPI contract, strict TypeScript, lint, repository tests, CI, persistent asset/work-order lifecycle.
2. **Identity and locations:** managed sign-in, organization memberships, role enforcement, hierarchy and active references. Gate: cross-company and per-role tests pass.
3. **Offline proof:** installable app shell, IndexedDB cache/outbox, replay ordering, sync indicators, conflict review. Gate: airplane mode, app restart, lost response, revocation, and concurrent-edit tests pass on target devices.
4. **Team field pilot:** limited equipment set, named users, observed maintenance cases, feedback log, backup/restore rehearsal. Gate: the team verifies workflow effectiveness and no lost changes.
5. **Choose the next CMMS module:** procedures, PM scheduling, or parts based on actual feedback. Agree scope before schema and implementation.
6. **Multiple-company product:** tenant onboarding, operational monitoring, support, migration/restore practices, performance and isolation review. Billing follows demonstrated demand.

Current status: online owner-led prototype. Individual accounts, offline behavior, automatic scheduling, and production operations remain future work.
