# QueSuite — operations capability register

Created September 5, 2026, at the owner's request to preserve ideas for tracking and logging organizational operations.

This is a living discovery register. The capabilities below are proposals for consideration, not implemented features or a promise to build every module. The existing [roadmap](ROADMAP.md) remains the delivery sequence; [SHARED-WORK.md](SHARED-WORK.md) describes the proposed departmental workflow including QA, Maintenance, Accounting, Parts, and Logistics.

## Current baseline

- Implemented: asset/location records, maintenance work orders, linked navigation, completion notes, and system audit events. Browser and device validation remains incomplete; see [VALIDATION.md](VALIDATION.md).
- Confirmed product direction, still to implement: both manual meter histories and operational/shift notes; shared departmental work including QA, Maintenance, Accounting, Parts, and Logistics; role guidance and revisioned instructions.
- Previously planned foundations: authenticated memberships and permissions, offline recovery, backup/restore, and later PM rules. New entries below extend those foundations rather than define separate competing systems.

All register entries start with **Decision: Captured / Delivery: Not scheduled / Accountable owner: Unassigned**, with subsequent scope/status updates recorded below. QA, Maintenance, Accounting, Parts and Logistics are requested participants; other department names are suggestions. Examples are hypothetical. An individual owner and real example should be identified before an item enters delivery planning.

Owner clarification, September 5, 2026: Parts and Logistics should originate and own work, and parts should link to assets/equipment, rooms, areas and departments. **OPS-005: Decision Exploring / Delivery Not scheduled** while the catalog relationships and fulfillment workflow are defined. The desired relationships are confirmed; the detailed workflow remains a proposal. **OPS-006 remains Captured / Not scheduled**; product links, prices and sourcing are explicitly for later consideration. See [the parts/logistics blueprint](SHARED-WORK.md#parts-and-logistics-in-the-proposed-model). Preserve a single catalog with distinct compatibility, installation, supported-location, stocked-location, department and work-transaction relationships. Review supplier offers after the catalog and a representative fulfillment flow have been selected.

## Operational records to consider

| ID      | Capability                                          | Records worth keeping                                                                                                                                                  | Useful connection or question                                                                                                                                                                    |
| ------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| OPS-001 | Shift handoffs and daily rounds                     | Shift/location, observations, unfinished work, sender, receiving owner, acknowledgment, due time, backup contact                                                       | Extends operational logs: did the next shift accept the outstanding action, and who owns it now?                                                                                                 |
| OPS-002 | Downtime and operating losses                       | Asset/line, start/end, planned/unplanned event, suspected and verified cause, affected run, linked repair, restart confirmation                                        | Operations and Maintenance can distinguish repair completion from resumed production. Allow unknown causes; overlapping events must not inflate totals.                                          |
| OPS-003 | Inspections and quality deviations                  | Checklist/specification revision, observed result, affected asset/run/lot, defect, containment, disposition decision, reviewer and evidence                            | QA links an out-of-spec result to follow-up work. Repair completion does not automatically accept an inspection or release affected output.                                                      |
| OPS-004 | Root causes and corrective actions                  | Related recurring events, investigation, cause evidence, action owner, due date, verification and later effectiveness review                                           | Record whether the chosen fix reduced recurrence. Use the same task records for actions instead of a second task system.                                                                         |
| OPS-005 | Parts catalog, associations and movements           | Shared part catalog; equipment/location/department relationships; quantity/unit, storeroom/bin, reservation, issue/return, transfer, custody and count evidence        | Parts, Logistics, Maintenance and Accounting can distinguish what fits, where it is stored, who manages it, and what was used. Preserve movements and receiving acknowledgment.                  |
| OPS-006 | Supplier, sourcing and delivery handoffs            | Supplier/item reference, future product links, dated price/currency and pack unit, lead time, request, shipment/delivery, receipt, shortage/return and source evidence | Connect Parts and Logistics to supplier follow-up, QA and Accounting. Links/pricing/sourcing remain for later consideration; dispatch, receipt, acceptance and payment are separate events.      |
| OPS-007 | Calibration and measuring instruments               | Instrument ID, calibration/check date, due date, method/result, certificate reference, acceptance state and affected readings                                          | QA and Maintenance can identify which instrument supported a measurement and review affected work if that instrument is later found unreliable.                                                  |
| OPS-008 | Production or service execution and traceability    | Run/job, product/service revision, line/shift, planned and actual output, good/rejected quantities, start/end, material lot/serial references                          | Give maintenance and QA events the context of what was being produced or delivered. Begin with references to the existing production system if one exists.                                       |
| OPS-009 | Safety and environmental observations               | Hazard/near-miss or environmental event, location, immediate action, responsible person, related controls/permit references, follow-up verification                    | Link relevant controls and unresolved actions to the work. Workflow design and requirements need the responsible departmental owner's review before implementation.                              |
| OPS-010 | Process and equipment changes                       | Proposed change, reason, affected assets/processes/roles, impact review, decision, effective date, transition tasks, superseded revision and follow-up                 | Engineering, Operations, QA and Maintenance can see what changed and which instructions were valid when work occurred. Preserve prior evidence.                                                  |
| OPS-011 | Work readiness, resources and effort                | Required skills/tools/materials, shared-equipment availability, reservations, readiness blockers, planned versus reported effort, coverage                             | Leads can identify what must be available before work starts. Begin with task-level resource needs and explicit time entries, not inferred employee activity.                                    |
| OPS-012 | Role readiness, onboarding and qualifications       | Role expectations, required guidance, revision acknowledgment, assessed skill, assessor, authorization scope and review/expiry date                                    | Extends role learning: reading instructions, demonstrating a skill and being authorized for a task are separate records. Reuse company-owned training records where appropriate.                 |
| OPS-013 | Audits and findings                                 | Review scope, criteria revision, finding, evidence, responsible owner, due date, action and closure verification                                                       | QA or another designated department can follow a finding through to evidence of resolution using shared tasks.                                                                                   |
| OPS-014 | Customer complaints, returns and service feedback   | Complaint/return reference, affected order/product/service/lot, observed problem, response owner, investigation and resolution                                         | Customer-facing teams can connect external feedback to QA, Maintenance, supplier issues or an improvement action. Link to an existing customer system where appropriate.                         |
| OPS-015 | Asset lifecycle, warranties and service obligations | Commissioning, ownership/custody, moves, criticality, service contract/warranty reference, renewal dates, decommissioning and retained history                         | Extend asset history and help Maintenance/Accounting find who should service or review equipment. Avoid turning a location edit into an unrecorded asset move.                                   |
| OPS-016 | Utilities and resource consumption                  | Electricity, water, fuel or other resource readings with unit, meter/source, period, location and linked run/event                                                     | Reuse the meter model to compare consumption over time and investigate changes. Consumption history needs explicit reporting periods and reliable units.                                         |
| OPS-017 | Decisions, blockers and commitments                 | Decision/hold, reason, accountable person, evidence, next action, review date, release condition and scope                                                             | A paused request explains what it is waiting for. Meeting actions and exception decisions link to the affected work instead of disappearing into notes.                                          |
| OPS-018 | Improvement ideas and outcome review                | Suggestion or repeated problem, supporting records, decision, owner, baseline, expected benefit, follow-up date and observed result                                    | Any department can propose an improvement and later see why it was pursued, deferred or declined and whether the change helped.                                                                  |
| OPS-019 | Operational reporting                               | Metric definition, source records, calculation/version, date range, baseline, target owner, review notes and drill-through links                                       | Managers can inspect the records behind backlog, downtime, overdue actions, quality results and reported costs. Define denominators and overlap rules before presenting performance comparisons. |

IT, Facilities, Planning, Purchasing, Stores, People Operations and customer-facing teams may use the same shared-request and department-task structure when a real workflow is selected. Payroll, banking, tax records, detailed personnel files and full ERP/CRM execution are not assumed additions to the pilot. Where another system owns a record, preserve its reference and define ownership before copying or updating it.

## Shared recordkeeping foundations

These also start as Captured / Not scheduled extensions. Some underlying pieces already exist or appear in the roadmap; the descriptions identify the remaining capability rather than claiming a new implementation.

| ID      | Foundation to extend                   | What must be preserved or demonstrated                                                                                                                                                                                                  |
| ------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REC-001 | Common record context and history      | Stable reference, company/site/department scope, occurred-at versus entered-at time, author/source, related work, owner, state, required next action, and correction/revision history; quantity/unit or amount/currency where relevant  |
| REC-002 | Documents and evidence                 | Manuals, photos, certificates, receipts and other evidence linked to records; document revision, author/source, access rules and retained references. A summary must lead back to its supporting evidence.                              |
| REC-003 | Finding and linking records            | Permission-aware search and filters across assets, tasks, readings, notes and references; related-record navigation, duplicate/merged-record references, and retrievable archived history                                               |
| REC-004 | Imports, integrations and data quality | Source system and external ID, mapping/version, unit/time interpretation, import preview, rejected rows, duplicate/conflict handling and reconciliation. Future device readings and manual entries must not be silently double-counted. |
| REC-005 | Reminders and escalation               | An owner, due/review time, acknowledgment, escalation recipient, delivery outcome and rules for retries. A notification alone does not establish that someone accepted responsibility.                                                  |
| REC-006 | Portability, retention and recovery    | Export records with stable links and evidence references; defined archive/retention responsibilities; tested restoration of records, attachments and relationships; offline recovery and account-change behavior                        |

For each record type, choose the smallest set of these fields that its workflow needs. Keep operational observations, system audit events, approvals and published guidance distinguishable while linking them in one timeline. Shared progress summaries and restricted evidence may have different access rules. Business record dates, versioned instructions, and decision history must remain reconstructable after an update.

## Preserve an idea without losing its decision

Use two independent status fields:

- **Decision:** Captured, Exploring, Accepted, Deferred, Declined.
- **Delivery:** Not scheduled, Planned, In progress, Implemented, Pilot validated.

An accepted idea may remain unscheduled. Implemented requires a concrete feature/change reference; pilot validated requires observed user evidence. Retain deferred and declined entries with their reasons. Never silently remove an idea because the next milestone is smaller.

When evaluating an entry, add the following immediately below its ID or in a linked detail note:

```text
ID and title:
Origin and date:
Organizational need and a real example:
Accountable owner and participating departments:
Decision / delivery status:
Decision date and reason:
Record types and links to existing work:
Current source of truth:
Dependencies and unresolved questions:
Smallest useful pilot and success evidence:
Next review trigger:
Implementation and validation references, when available:
```

Keep IDs stable. Merge duplicate ideas by linking the surviving ID and retaining the original reference. Review captured ideas when pilot feedback reveals a gap or before selecting a new milestone; this is a planning practice, not a scheduled automation.

## Suggested order for discussion

Continue the manual meters/logs increment and one departmental handoff already in the roadmap. During that walkthrough, pay particular attention to **OPS-001 handoff acknowledgment, OPS-002 downtime, OPS-003 quality observations, and OPS-017 blockers/decisions**. They are useful examples for testing whether the shared records contain enough context, not commitments to implement four additional modules immediately.

Prioritize later entries using an observed recurring need, a willing owner, the cost of missing information, available data, and the size of the smallest useful workflow. Production lot traceability, customer returns, safety workflows and formal qualifications need the relevant departmental context before scope is chosen. Promote one bounded capability at a time and update PRD/API/schema decisions only when that increment is selected.

## Reference checks

The register is a QueSuite design proposal. These primary sources were checked September 5, 2026 to compare coverage with established operational systems; they do not prescribe QueSuite's implementation or require purchasing another product.

Quality deviations and follow-up are established quality-management capabilities. Microsoft's overview describes quality and nonconformance management across supply-chain processes. [Microsoft quality management overview](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/quality-management-processes).

Production genealogy can connect supplier, material, quality and downstream records; this supports keeping lot/run references as a candidate in OPS-008. [Microsoft traceability overview](https://www.microsoft.com/en-us/dynamics-365/blog/it-professional/2024/07/29/introducing-traceability-for-dynamics-365-supply-chain-management/).

Linked incident, problem, change, knowledge and asset records are established service-management categories. This supports preserving decisions, causes and changes alongside requests rather than only recording task completion. [Atlassian service-management overview](https://www.atlassian.com/software/jira/service-management/product-guide/overview).
