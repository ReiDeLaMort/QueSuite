# ADR 001 — responsive TypeScript web app

Status: provisional, pilot accepted.
Use a single responsive React/TypeScript application with the Sites Vinext/Vite runtime and D1. This gives one workflow across desktop and Android browsers and supports local editing in Microsoft Visual Studio. The eventual PWA will add install metadata, an app-shell service worker, and IndexedDB.

Alternatives: Flutter is appropriate if native device integration becomes central, but adds a different language/toolchain. ASP.NET is a valid future backend and fits Visual Studio well, but is not required simply because that editor is used.

Vinext is beta, so review runtime maturity and compatibility before wider deployment. Keep domain rules in plain TypeScript, HTTP contracts explicit, and database access isolated. Moving to another host or database still requires an adapter and verified migrations.
Source: https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/
