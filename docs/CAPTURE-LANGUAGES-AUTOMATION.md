# Text capture, language views and automatic maintenance work

Direction confirmed September 6, 2026: support both document photos/scans and pasted text; let each person use English, Spanish or another supported language without duplicating work orders; keep PM plans distinguishable from work execution; support automatic PM drafting and work-order generation. These are proposed capabilities, not implemented by this document.

## One record, multiple language views

A work order keeps one company-scoped ID, asset reference, assignment, lifecycle and history. English and Spanish are views of its content, not separate work orders. A Spanish note and an English note can belong to the same timeline. Language changes never create, assign, close or otherwise mutate a work order.

Separate three concerns:

| Concern            | Proposed behavior                                                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Interface language | Translate menus, field labels, statuses, validation messages and help through application dictionaries; retain canonical codes and IDs      |
| Authored content   | Preserve each original field/note/procedure revision with its language, author and evidence; English is not a mandatory intermediate source |
| Translated content | Link each translation to its exact source field/revision and target language, with translation method, translator/reviewer and review state |

Use a personal language preference, then the company default, then an explicitly labeled available fallback. Show language names such as English and Español; provide search as the supported list grows. Keep an easy **Show original** or **Original + translation** view. The UI can be translated while a particular document has no translation; show that gap clearly. Source edits mark earlier translations outdated. Editing translated wording and changing the underlying instruction are distinct actions; preserve both kinds of contribution through the revision model.

Language names and regional metadata use standard language tags, with additional subtags only when needed. Text language, date/number formatting, site scheduling timezone and measurement units are separate settings. Do not translate equipment tags, serials or canonical codes, silently change units/currency, or reinterpret ambiguous dates and decimal separators. Keep exact source values available during review. Start with validated English/Spanish support; add languages through the same structure, including right-to-left layouts where needed. Do not promise hundreds of complete translations before they exist. [W3C language-tag guidance](https://www.w3.org/International/questions/qa-choosing-language-tags).

The user's JW Library comparison informs the language chooser and switching the current content in place. Its official help describes selecting an available language for the current article and prioritizing commonly used languages. This is a UX reference, not evidence about that app's internal record model or translation-generation method. [JW Library language selection](https://www.jw.org/en/online-help/jw-library/windows/customize-reading/).

## Capture source text into reviewable fields

Proposed flow: **photo/scan or pasted text → retained source → recognized text → suggested fields → review existing matches → create or link**.

Keep the source document/image/page or pasted excerpt, source revision, submitting person, entered time, reported document/event time and original language. Image capture requires OCR; text extraction, field interpretation and translation remain separate steps so mistakes can be traced to the right stage. Retain the source span/page supporting each suggested field. A recognition score is not proof that the extracted fact is correct.

Propose relevant fields such as title, description, equipment reference, observed value/unit, location, and any explicitly stated interval or instruction. Highlight uncertain characters, dates, IDs, units and missing information. Never invent an asset match, assignee, due date, PM interval or manufacturer procedure. Match against existing permitted equipment, parts, locations and work; let the contributor choose an existing record or explicitly create a new one.

A document can contain several instructions or describe already completed work. Let the reviewer select its destination: attach/link evidence, propose an instruction revision, draft a work order, draft a PM plan, or retain an observation. Do not turn every paragraph into an active order. Technical instructions need a designated review appropriate to their use before generated wording becomes an accepted procedure. Automatically translated text must be distinguishable from reviewed text, with the original accessible.

Treat captured document text as evidence, not as commands or permission for software actions. Scope documents, extraction jobs, translations, search results and drafts to the company and authorized users. Define supported formats, size/page limits, retention and external processing arrangements before selecting any OCR/translation service. No provider or dependency is selected by this proposal, and no company document is sent to one.

## Prevent duplicate capture and preserve credit

Give a capture a stable ID and each extracted draft item its own stable ID. Accepting an item must atomically link it to the created/selected record, record the submitting and reviewing identities, and save the original command result. Repeating acceptance returns that same result, including when the screen is now in another language. A fresh retry ID alone must not bypass an already accepted draft item's record link.

Source hashes, equipment IDs, dates and existing record references can suggest possible duplicates within the permitted company scope. A repeated document or similar wording does not prove that two real maintenance events are the same. Review candidate matches rather than silently merging legitimate work. Multilingual search returns one result per record, with original/translated snippets pointing to that record. Preserve the contributor separately from the OCR process, translator and reviewer.

## PM plans and work orders stay distinct

| Record        | Responsibility                                                                                                                                                       |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PM plan       | Recurring requirement: asset scope, approved instruction revision, calendar/usage rule, timezone or meter baseline, responsibility, active/paused state and revision |
| PM occurrence | One due execution: stable occurrence identity, rule revision used, due time/threshold, trigger evidence and generated work-order reference                           |
| Work order    | One instance of execution with the existing requested → assigned → in progress → completed → closed lifecycle                                                        |

The **PM plans** view shows schedules, upcoming occurrences and their history. The **Work orders** view shows execution, with preventive work linked back to its plan. Both screens open the same generated work order. Completing one occurrence does not complete or delete the ongoing plan. Translated plan instructions and orders use the same language-view model; a language choice never adds another occurrence.

Support two distinct forms of automatic creation:

- **From captured instructions:** propose a PM plan or work-order draft for review. Accepting a plan's wording and activating its schedule are separate choices.
- **From an activated rule:** create a requested preventive work order when its due occurrence arrives. Later condition/event rules can create corrective work under explicitly configured behavior. Automation records its rule, evidence and authorizing configuration; it does not certify completion or equipment readiness.

## Make automatic generation repeatable without extra orders

Command idempotency handles a repeated request. A durable unique occurrence handles different scheduler runs or workers trying to create the same due work with different request IDs. Use company + persistent schedule-series identity + asset + stable occurrence token; create the occurrence, order link and event atomically.

For a calendar rule, define the due slot, timezone and daylight-saving behavior. For usage rules, include the meter identity, threshold and reset/replacement epoch. The occurrence stores the rule revision used, but a new plan revision must not by itself create a second identity for an already generated due event. Define the effective boundary and reconciliation of existing/future occurrences when a plan changes.

Before activating a rule, define calendar-based versus completion-based recurrence, missed-run catch-up, overdue open work, pause/resume, cancellation/replacement and monitoring of generation failures. Start with one calendar rule. Usage-based rules depend on reliable meter definitions, corrections, resets and rollovers. Persistent condition triggers need an episode/rearm rule so every high reading does not create another order. Document-derived intervals and thresholds remain proposals until accepted; do not infer equipment-specific requirements.

## Small implementation sequence and checks

1. Define source/revision, translation and capture-draft contracts. Add English/Spanish interface dictionaries and personal preference while preserving original record content and company access.
2. Prove pasted-text capture into one reviewed work-order draft, including existing-asset matching and duplicate acceptance. Both paste and image inputs are requested; add photo/scan ingestion through the same draft contract after document handling and provider choices are resolved.
3. Add record-content translations with original/translated views, separate contributor/reviewer credit, outdated-translation handling and technical-term review. Test unsupported languages, mixed-language notes, long text and locale-sensitive numbers/dates.
4. Add one reviewed PM-plan/calendar-occurrence flow, then activate generation. Test competing scheduler runs, interrupted writes, plan revisions, missed runs, timezone boundaries and repeated multilingual views. Each due occurrence must still have only one execution order.
5. Expand to usage/condition rules and additional languages after the relevant meter and language checks pass. Offline document capture/drafts and downloadable language content depend on the separate offline/recovery milestone.

Current code has a preventive work-order type, English UI strings and retry/version foundations. No OCR capture, multilingual record system, PM plan/occurrence model or automatic scheduler is implemented. New manual meter and seeded membership work is present in the working tree, but does not itself supply these capabilities or individual authentication. Track this proposal through **REC-009, REC-010 and OPS-020** in [OPERATIONS-REGISTER.md](OPERATIONS-REGISTER.md), alongside [CONTRIBUTIONS.md](CONTRIBUTIONS.md) and [COMPANY-APPEARANCE.md](COMPANY-APPEARANCE.md).
