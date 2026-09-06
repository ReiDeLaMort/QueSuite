# QueSuite — contributions, sources, revisions and duplicate records

Status: direction requested by the owner on September 5, 2026. The behavior below is a proposed design for future implementation. No new record editing, individual credit, reversal or merge capability is implemented by this document.

## People help build the company record

Associates are expected to be frequent first contributors. Plan for authorized associates to create building/location, asset/equipment, department and part records, enter readings and observations, and explain where information came from. Workers, leads, supervisors, managers, and authorized owners/investors can add knowledge and reasons without replacing earlier contributors' credit.

Creation and contribution should not require a blanket management approval solely because the person is an associate. Define explicit capabilities by record type, action and company/department scope. Creating a department directory entry does not itself grant administrative authority or change memberships. Reviewing, merging identities, changing access, accepting work, or authorizing spending are separate capabilities. Ownership or seniority does not establish that an entered fact has been verified. Any investor view or contribution remains subject to the access explicitly granted to that person.

Keep distinct identities for the original creator, each contributor, the person who supplied information, the person who performed work, any reviewer, and the current responsible owner. A reviewer receives credit for their review without becoming the author of the associate's work. Preserve stable contributor references when people change department or leave; apply the chosen access/retention policy to how history is displayed.

Proposed record views: **Overview, Sources, Contributions, Change history, Related work**, plus **Sourcing and outcomes** for parts. Show a readable account of who supplied or changed what, why, the evidence used, and how the contribution was resolved. Rejected, superseded and reverted proposals retain their explanations rather than being presented as current facts.

## Preserve sources and intent

| Contribution information            | Purpose                                                                                                                                                               |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entered by and entered at           | Identify who recorded the contribution and when                                                                                                                       |
| Source and supplied by              | Link the manual/document revision and page, supplier offer/quote, earlier work record, direct observation, imported source, or colleague who supplied the information |
| Observed/effective time             | Keep the time the information applied separate from entry time                                                                                                        |
| Affected fields or relationships    | Explain precisely which fact, location, part association or instruction the source supports                                                                           |
| Previous/proposed values and reason | Preserve the change and the contributor's intended outcome                                                                                                            |
| Review/decision                     | Identify whether information is reported, reviewed or disputed, with the reviewer and decision reason where relevant                                                  |
| Linked evidence and alternatives    | Retain source references, other proposals and unresolved questions                                                                                                    |

Allow an explicit unknown or unverified source with a follow-up need instead of encouraging invented certainty. A link can change; where needed, preserve the relevant quote, document revision or evidence reference and the date it was checked. A source supporting a part number does not automatically support its price, compatibility or stock balance. Source changes and corrections retain the earlier association and reason.

## Concurrent edits and competing intentions

Use a stable contribution/operation ID and expected record version. Before accepting an edit, compare it with the current record. When another person has changed the record, retain the proposed values, source and reason and show the differences. Do not silently choose the latest arrival or highest-ranking contributor.

The first implementation should use explicit conflict review, with selected field changes and a recorded resolution. If nonconflicting edits are combined later, the result must identify the contributions it includes. An unchanged retry must return the original accepted result. Offline proposals must retain their original author, timestamps and operation ID until synchronized; account switches must not leak another person's drafts.

The selected current value can coexist with a retained alternative explanation in the contribution history. Accepting one proposal does not erase the other person's input. Drafts, proposed changes and accepted record revisions are distinguishable, so an unaccepted suggestion is not treated as an operational fact.

## Revert through a new revision

Provide a comparison of the targeted revision with the current record, identify the fields to restore, and require the reason for the reversal. The reversal creates a new revision referencing the earlier change; it does not delete history or replace the whole record with an old snapshot. Detect intervening edits and resolve conflicts before saving so unrelated contributions remain intact.

Reversing a description or part association cannot reverse a physical installation, stock issue, delivery, acceptance or financial transaction. Those events retain their history and require their own authorized correction, return, follow-up or compensating entry. An approved correction describes what actually happened; it must not imply that a real-world action was undone merely because a record changed.

## Consolidate duplicates with explicit identity review

Interpret duplicate merging here as consolidation of records within one company, not a merger of companies or their authorization boundaries.

1. Suggest possible matches using relevant identifiers and context. Similar names alone are not proof of identity. Two machines of the same model, two rooms with the same name at different sites, and two legitimate purchases can be different things.
2. An authorized reviewer compares both records, sources, contributors, conflicting values and affected links. Confirm that the records represent the same kind of entity and the same real-world identity. Preserve location kind/parent rules and prevent hierarchy cycles.
3. Select the canonical record and resolve field conflicts explicitly. Preserve both sets of contributions, source evidence, former names/IDs and the reason for each chosen value. Record who proposed and who accepted the merge separately.
4. Current lists display one canonical identity. Former links resolve through company-scoped aliases; historical work orders, readings, transaction references and service-location snapshots retain what was recorded at the time. Current views can group that history through the alias mapping without rewriting the original event.
5. Record the merge and any current relationship changes atomically against the versions of both records. Prevent duplicate merge execution, cycles, dangling references and ambiguous alias chains. A merge must not silently widen access or combine department memberships, approval authority or restricted evidence.
6. If the match proves wrong, provide a reviewed split/merge reversal using the retained mapping. References added after the merge need explicit reassignment to the correct restored identity. Preserve the merge and its reversal in history. Do not promise an unconditional one-click undo after later activity.

Stock and transactions require reconciliation separate from catalog identity. Merging two catalog records must not blindly add duplicate stock observations or erase independent receipts. Preserve valid transaction IDs, quantities, units, lots and serials; investigate suspected duplicate imports against their original source references. Record any stock correction explicitly.

## Keep sourcing options and evaluate outcomes

Several suppliers may offer one catalog item. Store separate offers with supplier/item references, source URL or quote, price/currency, quantity or pack unit, effective/checked date, lead time and supporting evidence. A proposed substitute remains a related item unless its applicability is established. Merging catalog duplicates must preserve offers and their original contributors rather than selecting one supplier as the definition of the part.

Link the options considered and selection reason to the authorized decision and purchase reference. Later connect reported order terms, receipt quantities/discrepancies, installation or use, QA result, return/warranty action and observed performance. Keep quoted, approved, reported actual and subsequently corrected amounts identifiable. Updated supplier prices never replace historical transaction costs.

The result can explain both what was chosen and what happened: a cheaper quote may have arrived late; a proposed substitute may have failed its check; a higher-priced part may have met the requirement. Preserve the observations and criteria so a later decision can use the evidence. These are proposed record links, not automatic purchasing, payment execution or a claim of financial benefit.

## Example to validate

An associate creates "Pump inlet filter" from a machine manual. Another contributor creates "F-100" from a supplier quote. An authorized reviewer confirms that the catalog identities match and consolidates them into F-100. Both creators, sources and prior links remain visible; any supplier offers remain separate records linked to the catalog item.

Parts records why it selected one offer. Logistics records receipt. Maintenance records installation. QA records the observed result. A later correction to the description keeps its author's reason and can be reversed without removing these events. If the catalog match was wrong, a reviewed split assigns later references to the correct identities while retaining receipt and installation facts.

## Implementation gates

- Authenticated individual membership is required for trustworthy personal attribution. The current pilot uses a fixed pilot-owner actor and cannot substantiate who among several people authored a record. Display names alone do not meet this requirement.
- Begin with source-backed creation and visible contribution history for one record type. Add explained edits with version checks and durable conflict handling, then targeted reversals, then merge/split review. Apply that proven pattern to other entities in small increments.
- Before schema/API work, define contribution/revision/source records, their permissions, and transaction boundaries. Test concurrent contributions, original-result retries, preservation of other edits during reversal, old-link resolution, cross-company rejection, hierarchy constraints, access preservation, and reconciliation of post-merge references.
- The current work-order lifecycle, immutable events and historical snapshots remain intact. Locations/assets remain create-only until an explicit edit increment is implemented. Purchase and sourcing records remain later scope as described in [SHARED-WORK.md](SHARED-WORK.md).

This foundation extends REC-001, REC-003, REC-004 and REC-007 in the [operations register](OPERATIONS-REGISTER.md), and supplies requirements for the existing meters/logs, identity and departmental-work plans.
