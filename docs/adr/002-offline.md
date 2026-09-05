# ADR 002 — offline by deliberate stages

Status: architecture accepted; client implementation pending.
Offline support is required for a field-ready team pilot. Milestone 0.1 proves the online workflow and the API's version/idempotency guarantees first.

Next: save cached records and commands atomically in IndexedDB, namespaced by organization and signed-in user; replay commands in order per work order; retain operation IDs through restarts. Retry transient failures with backoff. Mark validation/permission/version failures as needing review. Never silently rebase or overwrite a conflict.

A service worker caches the app shell. Synchronization runs when the app opens, reconnects, or the technician chooses Sync. Browser Background Sync may enhance this but must not be required because support varies. Full offline startup and restart/reconnect recovery must pass on supported devices before claiming offline readiness.

Source: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation
Source: https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API
