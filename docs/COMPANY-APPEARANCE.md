# Company appearance and familiar workspaces

Direction confirmed by the owner September 5, 2026. The company website screenshot was supplied as a reference for visual feel and layout options. The product requirement is that each company can make QueSuite feel familiar to its people. This document and the accompanying conversation mockup are design proposals, not implemented tenant settings.

## Familiarity at three levels

| Level      | Proposed choices                                                                                                               | Purpose                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| Company    | Display name and logo, accessible accent palette, header style, default home layout, approved terminology and navigation order | Establish a recognizable company workspace      |
| Department | Relevant home sections, shortcuts, default work views and procedures                                                           | Put each team's daily work within easy reach    |
| Individual | Landing view, pinned links, section order, density and light/dark preference                                                   | Let each person arrange their own working space |

Personal preferences override department defaults, then company defaults, then QueSuite defaults, only for settings that support those scopes. Shared identity remains company-controlled. A person can restore inherited defaults without resetting anyone else's layout. Device-specific density or navigation adapts to the available space rather than forcing desktop arrangements onto a phone.

## Three starting layouts

- **Company Home:** a clean branded header, modest welcome area, familiar top navigation and linked work cards. The reference's green/white palette, whitespace and recognizable identity inform this option. A supplied workplace image can be an optional home treatment later.
- **Workday:** company branding with a persistent desktop sidebar, a work list and contextual record details. This is a proposed everyday operations default.
- **Compact:** a smaller header and rows for scanning more records, with details available on demand. Touch targets and text remain readable on small screens.

All three use the same record components, routes and workflows. Start with named templates and a small selection of home sections. A company-specific code fork, unrestricted page builder, arbitrary scripts and custom CSS uploads are outside the initial scope.

## Preserve meaning while changing presentation

Themes must preserve record identity, links, history, lifecycle meanings, required fields and server permissions. Showing or hiding a shortcut does not grant or remove access. Job titles are useful view defaults, not authorization rules. An authorized user still needs a way to find permitted records outside their personalized home page.

Allow familiar display labels while retaining canonical field/status definitions and stable identifiers. A renamed navigation label cannot change what a completed or closed order means. Branding must not obscure warnings, pending changes, errors, focus indicators, the active company, or development/beta environment labels. Status text/icons remain recognizable across palettes; brand color alone does not carry operational meaning.

Offer accessible palette pairs and validate foreground/background contrast when custom colors become available. Every template must support keyboard use, zoom, long company names, missing logos, phones and tablets. Personal dark mode or readability preferences should not be silently overridden by a decorative company theme.

## Preview and save at the right scope

Provide distinct actions for **Preview**, **Save my preferences**, and **Publish company defaults**. Shared publication requires the appropriate server-verified capability; it is not available to anyone merely because they can create an operational record. Define department publication separately when that scope is implemented.

Keep company appearance revisions with contributor, change reason and expected version, using the planned contribution/history foundation. Restore a prior shared appearance through a new revision. Personal reset returns to current inherited defaults. Invalid or obsolete settings fall back safely without making the workspace inaccessible.

Logo/image handling will need bounded supported formats, validation and access rules when uploads enter scope. Keep supplied branding assets company-scoped. Use theme tokens and a validated settings schema; do not treat branding as executable content.

## Small implementation sequence

1. Compare the three layouts and a few palettes using fictional records in a presentation-only mockup. No API writes, tenant switching or persistence are implied.
2. Select a bounded company-appearance increment: logo/name, accessible palette and one default layout. Consolidate existing hard-coded header colors into shared design tokens; retain the established components and navigation.
3. Define the settings schema and API together with authenticated membership and publication permissions before persisting shared company settings. Test company isolation, stale updates, invalid values and fallback behavior.
4. Add personal preferences and inheritance; then department defaults and reorderable home sections if actual use warrants them. Verify reset behavior, bookmarks, keyboard access and representative devices.

The current app has a fixed QueSuite header/palette and no appearance-settings API or authenticated company configuration. Existing uncommitted meter/log work is a separate increment. This requirement is tracked as **REC-008 — Decision Exploring / Delivery Not scheduled** in [OPERATIONS-REGISTER.md](OPERATIONS-REGISTER.md).
