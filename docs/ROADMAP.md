# Baby-step roadmap

Broader operational capabilities are preserved in [OPERATIONS-REGISTER.md](OPERATIONS-REGISTER.md). They start as Captured / Not scheduled. Use pilot evidence to select the next increment; keep deferred or declined ideas with a reason so they remain discoverable.

1. **Foundation 0.1 (complete):** PRD, domain boundaries, ADRs, OpenAPI contract, strict TypeScript, lint, repository tests, CI, persistent asset/work-order lifecycle.
2. **Locations and linked navigation 0.2 (implemented):** site → building → work area, asset location selection, record details, scoped references, and safe upgrade of existing records. Browser/device walkthrough, location editing, and legacy conversion remain future work.
3. **Manual meters and operational logs (proposed next):** both reading history and shift/maintenance notes, linked to assets and work orders. Validate units, provenance, corrections, and retries in the owner-led pilot. Automatic PM triggers remain later.
4. **One departmental handoff (proposed):** a shared request with QA, Maintenance, and Accounting as participating departments; linked maintenance execution, explicit verification, and revisioned instructions/role guidance. Accounting can originate work or own a cost/documentation review task when required; it is not a universal approval gate. Use [SHARED-WORK.md](SHARED-WORK.md) for the working example. Agree the example, API contract, and additive schema before implementation.
5. **Identity and department access:** managed sign-in, company/department memberships, action permissions, and active references. Gate: cross-company, cross-department, and permitted/denied action tests pass before separate people operate the workflow. Job titles are not permission rules.
6. **Offline proof:** installable app shell, IndexedDB cache/outbox, replay ordering, sync indicators, conflict review; extend the same rules to readings and notes. Gate: airplane mode, app restart, lost response, revocation, and concurrent-edit tests pass on target devices.
7. **Team field pilot:** limited equipment set, named users, observed departmental handoffs, feedback log, backup/restore rehearsal. Gate: the team verifies workflow effectiveness and no lost changes.
8. **One PM rule, then other modules:** connect a time/usage rule to the proven meter history and work-order flow; verify duplicate prevention and explicit acceptance. Select later CMMS modules from actual feedback.
9. **Multiple-company product:** tenant onboarding, operational monitoring, support, migration/restore practices, performance and isolation review. Billing follows demonstrated demand.

Current status: online owner-led prototype. Individual accounts, offline behavior, automatic scheduling, and production operations remain future work.

Domain registration, social handles, and public launch work are deferred at the owner's direction. They are not prerequisites for building or validating the app.
