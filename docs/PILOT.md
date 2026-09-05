# Owner-led validation checklist

Record date, observer, device, scenario, outcome, and friction. Do not enter secrets into test records.

## Walkthrough

- Register an asset with a unique tag and meaningful location.
- Create a work order with a clear symptom, priority, and work type.
- Assign it by technician name, start, complete with an outcome note, then review and close.
- Refresh and confirm the record and completion note remain.
- Search by asset or technician; filter statuses.
- Have a technician and coordinator explain what each step means.

## Technical acceptance

- Automated repository tests: persistence, lifecycle validation, original-result replay, stale updates, foreign-organization references, transactional rollback, and competing operation IDs.
- Live HTTP test: create, list, full lifecycle, and simultaneous updates through the actual local D1 runtime.
- Browser interaction, keyboard/accessibility, 200% text zoom, Android-width layout, and macOS/Android hardware are manual checks not yet completed.
- Private hosted page and direct API routes must reject unauthenticated requests.
- Offline recovery and role isolation are future release gates, not capabilities of this pilot.

## Team observation log

| Date / observer | Scenario / device | Worked without help? | Friction or missing data | Next action |
| --------------- | ----------------- | -------------------- | ------------------------ | ----------- |
|                 |                   |                      |                          |             |

Choose pilot targets after observing the existing workflow. Compare time to record/assign/close work and completeness of the record against that baseline; avoid claiming improvements before measuring them.
