import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseRoute,
  routeHref,
  locationTrail,
  locationScope,
  type WorkspaceRoute,
} from '../lib/navigation.ts';
import type { Location } from '../lib/domain.ts';

await test('record links and filtered lists survive URL roundtrips without losing search context', () => {
  const routes: WorkspaceRoute[] = [
    {
      section: 'work-orders',
      asset: 'asset-1',
      status: 'in_progress',
      query: 'Pump #1 / seal & leak?',
    },
    { section: 'work-orders', status: 'open' },
    { section: 'work-orders', query: 'all' },
    { section: 'assets', location: 'area-1' },
    { section: 'locations', id: 'location/with?reserved#characters' },
    { section: 'work-orders', id: 'closed-order' },
  ];
  for (const route of routes)
    assert.deepEqual(parseRoute(routeHref(route)), route);
  assert.equal(
    routeHref({ section: 'work-orders', status: 'all' }),
    '#/work-orders',
  );
});
await test('malformed and unknown links recover safely while missing record IDs remain identifiable', () => {
  for (const hash of ['', '#/unknown', '#/assets/a/extra', '#/assets/%E0%A4%A'])
    assert.deepEqual(parseRoute(hash), { section: 'work-orders' });
  assert.deepEqual(parseRoute('#/work-orders?status=made-up'), {
    section: 'work-orders',
  });
  assert.deepEqual(parseRoute('#/assets/missing'), {
    section: 'assets',
    id: 'missing',
  });
});
function location(
  id: string,
  parentId: string | null,
  kind: Location['kind'],
  path: string,
): Location {
  return {
    id,
    parentId,
    kind,
    path,
    name: id,
    organizationId: 'pilot',
    createdAt: '2026-09-05T00:00:00.000Z',
  };
}
await test('location navigation follows IDs and includes descendants without matching similar labels', () => {
  const locations = [
    location('site', null, 'site', 'Plant'),
    location('building', 'site', 'building', 'Plant / Hall'),
    location('area', 'building', 'area', 'Plant / Hall / Line'),
    location('other', null, 'site', 'Plant annex'),
  ];
  assert.deepEqual(
    locationTrail(locations, 'area').map((record) => record.id),
    ['site', 'building', 'area'],
  );
  assert.deepEqual(
    [...locationScope(locations, 'site')],
    ['site', 'building', 'area'],
  );
  assert.deepEqual([...locationScope(locations, 'area')], ['area']);
  assert.equal(locationScope(locations, 'missing').size, 0);
  assert.equal(locationScope(locations, 'Plant').size, 0);
  const malformed = [
    location('a', 'b', 'building', 'a'),
    location('b', 'a', 'area', 'b'),
  ];
  assert.equal(locationTrail(malformed, 'a').length, 2);
});
