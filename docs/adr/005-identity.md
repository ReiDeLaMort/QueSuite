# ADR 005 — real memberships before independent team access

Status: planned; pilot identity deliberately limited.
The current audit actor is pilot-owner. Assigned technician names are display metadata. The owner may demonstrate the workflow, but these labels do not prove who performed a maintenance action.

Before a shared team pilot, adopt managed OpenID Connect sign-in and store users plus organization memberships. Choose a provider with the team's IT requirements. Coordinator permissions govern assignment and closure; technicians start and complete their assigned work; administrators manage membership and configuration. Enforce all permissions on the server and test expired/revoked access.

Direction expanded September 5, 2026: add company-scoped department memberships and explicit task/request responsibilities for QA–Maintenance–Accounting–Parts–Logistics collaboration. Manager, supervisor, lead, and associate are job labels and useful default perspectives; they must not automatically grant record access or approval authority. Scope read, execute, assign, and accept permissions independently, including access to shared summaries versus underlying department notes and financial evidence. People may participate in more than one department. The original pilot permissions above remain a starting proposal, not a hard-coded universal hierarchy. See SHARED-WORK.md for the first proposed handoff.

Cache cleanup on logout/account switch is required. Revocation cannot erase an already-disconnected device immediately; define retention and device expectations before offline rollout.

Contribution direction, September 5, 2026: authorized associates should be able to create operational records and record sources. Reserve no blanket creation privilege for managers solely by job rank. Scope create/edit/review/revert/merge/access-management/spend-authorization separately. Creating a department directory record does not grant membership or administrative control. Authenticated creator, contributors, source provider and reviewer must remain distinguishable; reviewers do not replace author credit. Owners/investors participate only within their granted scope. Identity must precede any independently operated multi-person attribution feature. See [CONTRIBUTIONS.md](../CONTRIBUTIONS.md).
