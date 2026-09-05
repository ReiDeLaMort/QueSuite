# ADR 005 — real memberships before independent team access

Status: planned; pilot identity deliberately limited.
The current audit actor is pilot-owner. Assigned technician names are display metadata. The owner may demonstrate the workflow, but these labels do not prove who performed a maintenance action.

Before a shared team pilot, adopt managed OpenID Connect sign-in and store users plus organization memberships. Choose a provider with the team's IT requirements. Coordinator permissions govern assignment and closure; technicians start and complete their assigned work; administrators manage membership and configuration. Enforce all permissions on the server and test expired/revoked access.

Cache cleanup on logout/account switch is required. Revocation cannot erase an already-disconnected device immediately; define retention and device expectations before offline rollout.
