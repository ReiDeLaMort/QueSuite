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
| Location         | Company-scoped UUID, normalized name, kind (site/building/area), same-company parent, server-derived path; create-only in 0.2                                                                     |
| Asset            | UUID, organization ID, normalized tag unique within organization, name, location label, optional structured location reference, created time                                                      |
| Asset location   | One same-company location reference per asset; composite foreign keys; committed atomically with a new asset                                                                                      |
| Work order       | UUID, organization ID, same-company asset reference, copied asset tag/service location, title, description, type, priority, status, assignee label, completion note, positive version, timestamps |
| Work-order event | Organization + operation ID primary key; one event per order/version; command, original result, pilot actor, server timestamp                                                                     |

Work orders preserve the service location when created. Future asset moves must not rewrite historical service locations.

Sites have no parent; buildings belong to sites; work areas belong to buildings. Create-only parents and the strict kind hierarchy prevent cycles through the API. Normalized lowercase keys enforce unique sibling names and unique site names within a company. Names are at most 50 characters; the deepest path is at most 156 characters. A new asset stores the selected path as its label. Assets created before this feature retain their free-text label and return `locationId: null`. See ADR 006 for migration and retry decisions.

Status flow: requested → assigned → in_progress → completed → closed.
Assignment requires a name. Completion requires a nonblank result note. Skipping steps and changing closed records are rejected. Cancellation, reassignment, and reopening need explicit future commands and audit reasons.

## Planned entities

Organization and department memberships (user/responsibility/active state); shared request and department task; versioned instructions and acceptance records; operational log; meter/reading; PM schedule; procedures and checklist answers; part/stock transaction; attachment metadata.

The owner has expanded the product direction to departmental collaboration and role guidance. [SHARED-WORK.md](SHARED-WORK.md) proposes the next bounded model. A shared request can be asset-optional and coordinates department-owned tasks. A linked maintenance task derives execution progress from the existing work order; requesting-department verification is a separate acceptance step. Keep the existing asset requirement and maintenance lifecycle intact. All new entities remain planned until a scoped API/schema increment is implemented.

Locations must remain in the same company and cannot have cycles. An active assignee membership must belong to the work order's organization. Deactivate historical references instead of deleting them. Inventory and schedule models will be designed when those workflows enter scope.

## Transaction and retry contract

Work-order commands use a client UUID and operation ID. An exact accepted retry returns the original result before version checks. A different payload under the same operation ID returns 409 without changing records.

A mutation checks the organization and expected version, and refuses to run if the operation was already accepted. In the same D1 batch, an audit/result entry is inserted only for the matching operation marker. A failed comparison cannot produce an event. Audit SQL failure rolls back the mutation.

The browser retains the same request identifiers when retrying an unchanged open form after a network failure. It does not persist that draft across refreshes yet.

Client navigation uses native fragment links (`#/assets/<id>`, `#/locations/<id>`, `#/work-orders/<id>`). List filters live in the fragment query string. A small `useSyncExternalStore` subscription tracks browser history; search/status changes replace the current list address, while record links create history entries. This keeps forms and the loaded snapshot in one workspace and adds no server routes, dependencies, or persistence changes. Missing IDs show a recoverable empty state. Location navigation follows IDs, includes descendants when labeled "within," and never infers relationships from legacy labels. Historical work-order service locations remain plain text; the asset is linked separately.

Location and asset creation use their UUID as request identity. An exact normalized retry returns the saved record and timestamp; conflicting payloads return 409. The legacy asset API remains available with a free-text label. Structured creation accepts a location UUID and derives the label on the server.

## Known boundaries

The server currently selects one fixed pilot organization and actor. These establish ownership but do not implement identity, tenant isolation, or technician permissions. Private Sites access provides the owner-only demonstration perimeter. The local dev server has no app-level login and must remain local.

The initial snapshot reads all pilot records. Introduce pagination, incremental sync cursors, query limits, and indexes based on measured access patterns before large datasets. Timestamps are UTC server values, not client conflict-resolution clocks.
