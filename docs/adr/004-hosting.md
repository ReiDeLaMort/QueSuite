# ADR 004 — private pilot hosting with D1

Status: provisional.
Use private Sites hosting for the owner's review and a separate local D1 database for development. Maintain schema through checked-in Drizzle migrations; apply local migrations with the repository script and hosted migrations during deployment.

Alternative: conventional Node/ASP.NET hosting with PostgreSQL. Revisit when operating costs, integrations, data residency, scale, backups, or organizational IT requirements are known. Do not assume a hosting platform alone satisfies these future requirements.

Keep hosted access owner-only in this milestone. App-level authorization must be in place before changing the audience.
