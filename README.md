# QueSuite CMMS

A maintenance workspace for validating our team's workflow before building a product for multiple companies.

The product direction now includes collaboration between QA, Maintenance, Accounting, and other departments, with both operational logs and meter histories and guidance for each role. These are planned extensions; see [the shared-work blueprint](docs/SHARED-WORK.md) for the proposed pilot and implementation sequence.

Additional ideas for tracking operations are preserved in the [operations capability register](docs/OPERATIONS-REGISTER.md), with separate decision and delivery statuses so ideas remain visible without being mistaken for implemented features.

Source repository: [ReiDeLaMort/QueSuite](https://github.com/ReiDeLaMort/QueSuite).
Use this repository for work in Visual Studio, Codex, Claude, and other editors.

**Milestone 0.2: online, owner-led pilot.** Organize locations as site → building → work area, register assets at those locations, create work orders, assign a technician by name, start work, record completion notes, and close reviewed work. Records persist in SQLite/D1. The API rejects stale versions and conflicting retries and records accepted work-order changes in an audit table.

Individual accounts, roles, installation as a PWA, and offline synchronization are not implemented in this milestone. Assignee names are display labels, not authenticated identities. Hosted access remains private to the owner; this is a demonstration for the team, not a shared team deployment.

The workspace is interlinked: summary counts open filtered lists; asset, location, and work-order names open details; breadcrumbs connect locations; and related records link to one another. Start a work order from an asset or register equipment from a location to preselect that record. The URL records your view and filters, so browser Back, reload, bookmarks, and opening a link in another tab preserve that context within the same workspace.

## Start on this computer

Open this folder with Microsoft Visual Studio using **File → Open → Folder**. VS Code also works. No C# solution is required for this TypeScript project.

In the integrated PowerShell terminal:

```powershell
.\Start-CMMS.ps1
```

The launcher uses an installed pnpm, or this computer's bundled Codex Node/pnpm runtime. It installs locked dependencies, applies local migrations, and starts the server. Open the Local URL printed in the terminal. Keep that terminal running. Stop with Ctrl+C.

For a standard development machine, install Node.js 24 LTS and pnpm 11.19.0, then:

```sh
git clone https://github.com/ReiDeLaMort/QueSuite.git
cd QueSuite
pnpm install --frozen-lockfile
pnpm db:migrate:local
pnpm dev
```

Local D1 data lives in ignored .wrangler/state/. Restarting preserves it. Hosted D1 is a separate database; local test records do not upload with source. The local server is for this computer only; do not expose it as a shared production server.

The migration command uses `wrangler.local.jsonc`. Keep this explicit migration configuration separate from the dev server's generated Worker configuration. Updates preserve existing asset location labels and work-order history; they do not guess a hierarchy from old free text.

## Validate a change

```sh
pnpm check
pnpm build
```

Or use this computer's launcher helper:

```powershell
.\scripts\Invoke-Pnpm.ps1 check
.\scripts\Invoke-Pnpm.ps1 build
```

Tests execute the real repository SQL against isolated in-memory SQLite. CI runs the same lint, strict type checks, tests, and production build. Live D1 HTTP checks supplement these tests; automated browser, Android, and macOS validation remain on the pilot checklist.

## Work together

1. Read [the PRD](docs/PRD.md) and [architecture](docs/ARCHITECTURE.md).
2. Pick one item from [the roadmap](docs/ROADMAP.md).
3. Ask Codex or Claude to read AGENTS.md and the current task before editing.
4. Let one editor own a given file at a time. Review the changes, run the checks, then commit.

Visual Studio edits change these local files. They appear immediately in the running local development preview. Publishing to the private hosted app is a separate deployment step.

On the original development computer, `origin` points to GitHub and `sites` points to the private deployment source repository. Use GitHub for everyday branches, pushes, and pull requests. A fresh GitHub clone needs only `origin` for local development; the Sites remote is used separately when publishing. GitHub Actions validates changes and does not deploy the app.

## Foundation

- React + strict TypeScript, with a Vinext/Vite web runtime.
- D1/SQLite schema managed by Drizzle migrations.
- HTTP API described in [OpenAPI 3.1](docs/openapi.json).
- Version checks and idempotent work-order commands prepare the API for a future offline outbox.
- Company ownership appears on records now; membership-based access must be implemented before company onboarding.

Vinext is beta. The hosting choice is provisional for this pilot; see [ADR 001](docs/adr/001-platform.md). Domain rules are independent of React and Cloudflare to make later changes smaller.

Begin in **Locations**: add a site, a building beneath it, and a work area beneath that building. Register an asset such as PUMP-001 at the selected location, then create its first work order. Location creation is supported; renaming, moving, and deleting locations are future work. Use [the pilot checklist](docs/PILOT.md) to record what your team learns.
