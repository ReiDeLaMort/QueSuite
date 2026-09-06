# QueSuite — CMMS pilot and shared-work direction

Status: working CMMS milestone 0.2; shared-work direction captured September 5, 2026.
Owner: Manuel / Que Enterprise.
Audience: our maintenance team first, expanding to collaboration with QA, Accounting, Parts, Logistics, and other departments; a product for multiple companies later.

## Problem

Equipment issues and maintenance progress need one reliable place to be recorded and reviewed. Validate that technicians and coordinators can follow a work order without losing its context or updates.

The owner's expanded direction is to coordinate work that crosses department boundaries and help managers, supervisors, leads, and associates understand relevant progress, responsibilities, and instructions. Both operational/shift notes and meter-reading history are requested. CMMS workflows remain a core part of QueSuite. The proposed shared-request model and role-guidance approach are recorded in [SHARED-WORK.md](SHARED-WORK.md); they are not implemented features.

## First complete workflow

Create a site, building, and work area. Register an asset with a unique tag and select its location. Create a work order for it. Assign a technician by name. Start work. Record what was done in a completion note. Review and close the work order. Find the record again after a reload.

Completion records a technician's reported result; closure records the operator's review. This separation preserves a useful acceptance checkpoint.

## Milestone 0.1 scope

Assets, asset service-location snapshots, corrective/preventive/inspection work-order types, priorities, list/search/status filter, strict lifecycle, persistence, audit records, version conflicts, idempotent API commands, engineering documentation, and CI configuration.

The owner operates this pilot during a team demonstration. Names are provisional assignee labels. A preventive work-order type does not generate scheduled maintenance.

## Next team-pilot requirements

Milestone 0.2 adds a three-level location hierarchy and asset location selection. Names are unique within each parent. Existing asset labels and historical work-order service locations remain intact. Location editing, movement, deletion, and conversion of legacy labels are outside this increment.

The next proposed increment is manual asset meters and linked operational notes. A subsequent shared-request walkthrough will connect a QA task to Maintenance execution and explicit QA verification, with revisioned instructions. Accounting can originate requests, own department tasks, and participate in cost review or documentation handoffs when that workflow requires it. Preserve the distinction between completion of a department's work and acceptance of the overall outcome.

Individual sign-in and company/department memberships; action permissions; offline cached work and a durable command outbox; explicit conflict review; recovery and device testing remain required. Job titles and default views do not confer permissions. Complete the access and recovery gates before granting independent team access or relying on disconnected field use.

Parts and Logistics are also explicitly requested participants. Preserve a shared parts catalog linked to assets/equipment, rooms/work areas, and departments. Define suitability, actual installation/use, stocked location, department responsibility, and reservation/delivery as distinct relationships. Product links, dated prices/currency, and supplier sourcing are for later consideration. See the Parts and Logistics section in [SHARED-WORK.md](SHARED-WORK.md); these additions are not implemented and do not replace the next meters/logs increment.

## Not in v1

The owner requested a broad record of future possibilities. [OPERATIONS-REGISTER.md](OPERATIONS-REGISTER.md) preserves these ideas for discovery, including items outside this pilot. Capturing a possibility does not change the implemented scope or commit the team to building it.

Billing, subscription onboarding, purchase-order execution, bookkeeping/payment execution, accounting/ERP integration, inventory valuation, automated PM generation, meter triggers, notifications, attachments, QR scanning, predictive maintenance, AI copilots, or physics simulation. Revisit each only after the core workflow is validated.

A general workflow designer, mandatory approval chain based on management rank, and a full training/certification platform are outside the proposed next increment. Start role learning with clear task purpose, instructions, expected outputs, and escalation guidance.

## Evidence of effectiveness

Use a small agreed set of real maintenance cases in an owner-led walkthrough. Record whether a technician can identify the asset, understand the request, report the result, and hand it to a reviewer without help. Record missing information and workflow friction. Set numerical speed/adoption targets after measuring the current process; do not invent business results from demo data.

Acceptance: no silent overwrites or duplicate accepted commands; saved records survive reload; required fields and transitions are enforced; the team can explain the distinction between completed and closed. Device, role, and offline release gates are tracked separately.
