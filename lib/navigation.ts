import { statuses, type Status, type Location } from './domain.ts';

export type Section = 'work-orders' | 'assets' | 'locations';
export interface WorkspaceRoute {
  section: Section;
  id?: string;
  status?: 'all' | 'open' | Status;
  asset?: string;
  location?: string;
  query?: string;
}
export function routeHref(route: WorkspaceRoute): string {
  const params = new URLSearchParams();
  for (const key of ['status', 'asset', 'location', 'query'] as const) {
    if (route[key] && !(key === 'status' && route[key] === 'all'))
      params.set(key, route[key]);
  }
  return (
    '#/' +
    route.section +
    (route.id ? '/' + encodeURIComponent(route.id) : '') +
    (params.size ? '?' + params.toString() : '')
  );
}
export function parseRoute(hash: string): WorkspaceRoute {
  const [path, query] = hash.replace(/^#\/?/, '').split('?');
  const [section, encodedId, extra] = path.split('/');
  if (
    !['work-orders', 'assets', 'locations'].includes(section) ||
    extra !== undefined
  )
    return { section: 'work-orders' };
  const route: WorkspaceRoute = { section: section as Section };
  try {
    if (encodedId) route.id = decodeURIComponent(encodedId);
  } catch {
    return { section: 'work-orders' };
  }
  const params = new URLSearchParams(query);
  const status = params.get('status');
  if (status && ['all', 'open', ...statuses].includes(status))
    route.status = status as WorkspaceRoute['status'];
  for (const key of ['asset', 'location', 'query'] as const) {
    const value = params.get(key);
    if (value) route[key] = value;
  }
  return route;
}
// Follow IDs, never infer relationships from legacy labels or path prefixes.
export function locationTrail(locations: Location[], id: string): Location[] {
  const trail: Location[] = [],
    visited = new Set<string>();
  let current = locations.find((location) => location.id === id);
  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    trail.unshift(current);
    current = locations.find((location) => location.id === current?.parentId);
  }
  return trail;
}
export function locationScope(locations: Location[], id: string): Set<string> {
  return new Set(
    locations
      .filter((location) =>
        locationTrail(locations, location.id).some(
          (parent) => parent.id === id,
        ),
      )
      .map((location) => location.id),
  );
}
