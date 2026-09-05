import {
  DomainError,
  choice,
  field,
  uuid,
  locationKinds,
  type Location,
} from '../domain.ts';
import { organizationId } from './context.ts';

export const locationColumns =
  'id, organization_id AS organizationId, name, kind, parent_id AS parentId, path, created_at AS createdAt';

export function findLocation(db: D1Database, id: string) {
  return db
    .prepare(
      'SELECT ' +
        locationColumns +
        ' FROM locations WHERE organization_id = ? AND id = ?',
    )
    .bind(organizationId, id)
    .first<Location>();
}

export async function addLocation(
  db: D1Database,
  body: Record<string, unknown>,
): Promise<Location> {
  const id = uuid(body.id);
  const name = field(
    field(body.name, 'Location name', 50)
      .normalize('NFKC')
      .replace(/\s+/g, ' '),
    'Location name',
    50,
  );
  if (
    name.includes('/') ||
    name.includes('\\') ||
    name
      .split('')
      .some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)
  )
    throw new DomainError(
      'Use a single location name without slashes or control characters.',
    );
  const kind = choice(body.kind, locationKinds, 'location kind');
  const parentId = body.parentId == null ? null : uuid(body.parentId);
  if (parentId === id)
    throw new DomainError('A location cannot be its own parent.');
  if ((kind === 'site') !== (parentId === null))
    throw new DomainError(
      'Sites have no parent. Buildings and work areas require a parent.',
    );
  const existing = await findLocation(db, id);
  function same(saved: Location) {
    return (
      saved.name === name && saved.kind === kind && saved.parentId === parentId
    );
  }
  if (existing) {
    if (same(existing)) return existing;
    throw new DomainError(
      'This location request ID already describes different data.',
      409,
    );
  }
  const parent = parentId ? await findLocation(db, parentId) : null;
  if (parentId && !parent)
    throw new DomainError('Parent location not found.', 404);
  if (
    parent &&
    ((kind === 'building' && parent.kind !== 'site') ||
      (kind === 'area' && parent.kind !== 'building'))
  )
    throw new DomainError(
      'Place buildings under a site, and work areas under a building.',
    );
  const location: Location = {
    id,
    organizationId,
    name,
    kind,
    parentId,
    path: parent ? parent.path + ' / ' + name : name,
    createdAt: new Date().toISOString(),
  };
  await db
    .prepare(
      'INSERT INTO locations (id,organization_id,name,name_key,kind,parent_id,path,created_at) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT DO NOTHING',
    )
    .bind(
      id,
      organizationId,
      name,
      name.toLowerCase(),
      kind,
      parentId,
      location.path,
      location.createdAt,
    )
    .run();
  const saved = await findLocation(db, id);
  if (!saved || !same(saved))
    throw new DomainError(
      'A location with this name already exists under this parent, or the request ID was reused. Refresh and review.',
      409,
    );
  return saved;
}
