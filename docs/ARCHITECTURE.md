# Architecture and domain model

## Dependency direction

```text
React screens → HTTP API → repository + domain rules → SQLite/D1
                              ↓
                     immutable audit results

Future device cache + outbox → same HTTP API
Future authenticated membership → server organization/actor context
```

UI modules do not import the database. Pure TypeScript rules do not import platform code. Routes validate HTTP input; repository operations enforce scoped references and transactional writes.

## Implemented entities

| Entity           | Fields and invariants                                                                                                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Asset            | UUID, organization ID, normalized tag unique within organization, name, location label, created time                                                                                              |
| Work order       | UUID, organization ID, same-company asset reference, copied asset tag/service location, title, description, type, priority, status, assignee label, completion note, positive version, timestamps |
| Work-order event | Organization + operation ID primary key; one event per order/version; command, original result, pilot actor, server timestamp                                                                     |

Work orders preserve the service location when created. Future asset moves must not rewrite historical service locations.

Status flow: requested → assigned → in_progress → completed → closed.
Assignment requires a name. Completion requires a nonblank result note. Skipping steps and changing closed records are rejected. Cancellation, reassignment, and reopening need explicit future commands and audit reasons.

## Planned entities

Organization and membership (user/role/active state); hierarchical location (site/building/line/room); procedures and checklist answers; PM schedule; meter/reading; part/stock transaction; attachment metadata.

Locations must remain in the same company and cannot have cycles. An active assignee membership must belong to the work order's organization. Deactivate historical references instead of deleting them. Inventory and schedule models will be designed when those workflows enter scope.

## Transaction and retry contract

Work-order commands use a client UUID and operation ID. An exact accepted retry returns the original result before version checks. A different payload under the same operation ID returns 409 without changing records.

A mutation checks the organization and expected version, and refuses to run if the operation was already accepted. In the same D1 batch, an audit/result entry is inserted only for the matching operation marker. A failed comparison cannot produce an event. Audit SQL failure rolls back the mutation.

The browser retains the same request identifiers when retrying an unchanged open form after a network failure. It does not persist that draft across refreshes yet.

## Known boundaries

The server currently selects one fixed pilot organization and actor. These establish ownership but do not implement identity, tenant isolation, or technician permissions. Private Sites access provides the owner-only demonstration perimeter. The local dev server has no app-level login and must remain local.

The initial snapshot reads all pilot records. Introduce pagination, incremental sync cursors, query limits, and indexes based on measured access patterns before large datasets. Timestamps are UTC server values, not client conflict-resolution clocks.
