# QueSuite CMMS — first pilot PRD

Status: initial working baseline, September 5, 2026.
Owner: Manuel / Que Enterprise.
Audience: our maintenance team first; a product for multiple companies later.

## Problem

Equipment issues and maintenance progress need one reliable place to be recorded and reviewed. Validate that technicians and coordinators can follow a work order without losing its context or updates.

## First complete workflow

Register an asset with a unique tag and location label. Create a work order for it. Assign a technician by name. Start work. Record what was done in a completion note. Review and close the work order. Find the record again after a reload.

Completion records a technician's reported result; closure records the operator's review. This separation preserves a useful acceptance checkpoint.

## Milestone 0.1 scope

Assets, asset service-location snapshots, corrective/preventive/inspection work-order types, priorities, list/search/status filter, strict lifecycle, persistence, audit records, version conflicts, idempotent API commands, engineering documentation, and CI configuration.

The owner operates this pilot during a team demonstration. Names are provisional assignee labels. A preventive work-order type does not generate scheduled maintenance.

## Next team-pilot requirements

Individual sign-in and organization memberships; technician/coordinator permissions; hierarchical locations; offline cached work orders and a durable command outbox; explicit conflict review; recovery and device testing. Complete these before relying on disconnected field use or granting independent team access.

## Not in v1

Billing, subscription onboarding, purchasing, accounting/ERP integration, inventory valuation, automated PM generation, meter triggers, notifications, attachments, QR scanning, predictive maintenance, AI copilots, or physics simulation. Revisit each only after the core workflow is validated.

## Evidence of effectiveness

Use a small agreed set of real maintenance cases in an owner-led walkthrough. Record whether a technician can identify the asset, understand the request, report the result, and hand it to a reviewer without help. Record missing information and workflow friction. Set numerical speed/adoption targets after measuring the current process; do not invent business results from demo data.

Acceptance: no silent overwrites or duplicate accepted commands; saved records survive reload; required fields and transitions are enforced; the team can explain the distinction between completed and closed. Device, role, and offline release gates are tracked separately.
