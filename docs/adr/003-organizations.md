# ADR 003 — one-team validation, multiple-company destination

Status: accepted from the owner's direction.
Validate with our team before selling to other companies. Add organization IDs and composite same-company references now, while the server fixes context to one organization for the owner-led pilot.

This avoids a later ownership retrofit but does not constitute multi-tenant security. Before onboarding a second organization, replace fixed context with authenticated memberships and verify reads, writes, assets, event replay, sync, and browser caches cannot cross company boundaries. Add active memberships and tenant-scoped uniqueness. Do not accept an organization ID or actor from untrusted request data.
