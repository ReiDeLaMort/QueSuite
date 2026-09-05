# ADR 006 — introduce locations without rewriting maintenance history

Status: implemented for milestone 0.2.

Use a company-scoped, three-level hierarchy: site → building → work area. Sites have no parent. Each child must reference the immediately preceding kind in the same company. Locations are create-only in this increment, which keeps parent paths stable and prevents cycles through the API. Limit each name to 50 characters and derive paths on the server; three names plus separators fit the existing 160-character asset label. Normalize names with NFKC, whitespace folding, and lowercase uniqueness keys. Enforce uniqueness per parent, including a separate index for root sites.

Add locations and asset_locations tables with composite same-company foreign keys. Leave assets, work orders, audit events, and their existing labels untouched. New assets use a selected location, store its path, and insert the association in the same transaction. Existing assets return a null location reference. The API still accepts legacy free-text creation and retries. Do not infer hierarchy by splitting old labels: the original text may not represent a valid site/building/area structure.

Location and asset UUIDs also identify create requests. Exact normalized retries return the original record; reused IDs with different data or duplicate names/tags return 409. Asset and location association insertion must either both commit or both roll back. Work orders continue copying the asset label at creation so later location management cannot silently change maintenance history.

A nullable location column on the existing asset table was considered. A separate one-to-one association keeps this migration entirely additive and avoids rebuilding a table already referenced by work orders. Revisit that tradeoff if measured query needs justify it. Location renaming, reparenting, archiving, asset moves, and legacy conversion need explicit commands and audit rules before implementation. Fixed pilot company context remains a prototype boundary, not authenticated tenant isolation.
