# Owner-led validation checklist

Record date, observer, device, scenario, outcome, and friction. Do not enter secrets into test records.

## Walkthrough

- Add a site, a building inside it, and a work area inside that building.
- Register an asset with a unique tag and select its location; confirm the full path appears on the asset and its new work order.
- Confirm any pre-existing asset labels and work-order service locations still read as before.
- Create a work order with a clear symptom, priority, and work type.
- Assign it by technician name, start, complete with an outcome note, then review and close.
- Refresh and confirm the record and completion note remain.
- Search by asset or technician; filter statuses.
- Click each dashboard count and confirm its list matches the count.
- Follow a location to its child locations and equipment, then an asset to its work orders and a work order back to its asset. Check closed work-order details too.
- Start a work order from an asset and confirm that asset is preselected. Add equipment or a child location from location details and check the parent selection.
- Use browser Back to return to a filtered list, reload a detail URL, open a record link in another tab, and navigate links using the keyboard. A copied local URL references this computer's local database, not hosted data.
- Have a technician and coordinator explain what each step means.

## Technical acceptance

- Automated repository tests: persistence, lifecycle validation, original-result replay, stale updates, foreign-organization references, transactional rollback, competing operation IDs, location hierarchy/uniqueness, and upgrades with existing history.
- Live HTTP test: location hierarchy, structured and legacy asset creation, list, full lifecycle, and simultaneous updates through the actual local D1 runtime.
- Browser interaction, keyboard/accessibility, 200% text zoom, Android-width layout, and macOS/Android hardware are manual checks not yet completed.
- Private hosted page and direct API routes must reject unauthenticated requests.
- Offline recovery and role isolation are future release gates, not capabilities of this pilot.

## Team observation log

| Date / observer | Scenario / device | Worked without help? | Friction or missing data | Next action |
| --------------- | ----------------- | -------------------- | ------------------------ | ----------- |
|                 |                   |                      |                          |             |

Choose pilot targets after observing the existing workflow. Compare time to record/assign/close work and completeness of the record against that baseline; avoid claiming improvements before measuring them.
