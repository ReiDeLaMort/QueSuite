import {
  DomainError,
  field,
  uuid,
  choice,
  statuses,
  validateTransition,
  type Asset,
  type Location,
  type WorkOrder,
  type Snapshot,
} from '../domain.ts';
import { organizationId } from './context.ts';
import { findLocation, locationColumns } from './locations.ts';
const assetColumns =
  'a.id, a.organization_id AS organizationId, a.tag, a.name, a.location, a.created_at AS createdAt, al.location_id AS locationId';
const assetJoin =
  ' FROM assets a LEFT JOIN asset_locations al ON al.organization_id = a.organization_id AND al.asset_id = a.id';
const columns =
  'id, organization_id AS organizationId, asset_id AS assetId, asset_tag AS assetTag, service_location AS serviceLocation, title, description, priority, type, status, assignee, completion_note AS completionNote, version, created_at AS createdAt, updated_at AS updatedAt';
const resultJson =
  "json_object('id',id,'organizationId',organization_id,'assetId',asset_id,'assetTag',asset_tag,'serviceLocation',service_location,'title',title,'description',description,'priority',priority,'type',type,'status',status,'assignee',assignee,'completionNote',completion_note,'version',version,'createdAt',created_at,'updatedAt',updated_at)";
function canonical(body: Record<string, unknown>) {
  return JSON.stringify(
    Object.fromEntries(
      Object.keys(body)
        .sort()
        .map((k) => [k, body[k]]),
    ),
  );
}
export async function snapshot(db: D1Database): Promise<Snapshot> {
  const result = await db.batch([
    db
      .prepare(
        'SELECT ' +
          assetColumns +
          assetJoin +
          ' WHERE a.organization_id = ? ORDER BY a.tag',
      )
      .bind(organizationId),
    db
      .prepare(
        'SELECT ' +
          columns +
          ' FROM work_orders WHERE organization_id = ? ORDER BY updated_at DESC, id',
      )
      .bind(organizationId),
    db
      .prepare(
        'SELECT ' +
          locationColumns +
          ' FROM locations WHERE organization_id = ? ORDER BY path COLLATE NOCASE, id',
      )
      .bind(organizationId),
  ]);
  return {
    assets: result[0].results as unknown as Asset[],
    workOrders: result[1].results as unknown as WorkOrder[],
    locations: result[2].results as unknown as Location[],
  };
}
export async function addAsset(
  db: D1Database,
  body: Record<string, unknown>,
): Promise<Asset> {
  const locationId = body.locationId == null ? null : uuid(body.locationId);
  if (locationId && body.location !== undefined)
    throw new DomainError(
      'Choose a structured location or supply a legacy label, not both.',
    );
  const selected = locationId ? await findLocation(db, locationId) : null;
  if (locationId && !selected)
    throw new DomainError('Selected location not found.', 404);
  const asset: Asset = {
    id: uuid(body.id),
    organizationId,
    tag: field(body.tag, 'Asset tag', 40).toUpperCase(),
    name: field(body.name, 'Asset name', 120),
    location: selected ? selected.path : field(body.location, 'Location', 160),
    locationId,
    createdAt: new Date().toISOString(),
  };
  const matches = (saved: Asset) =>
    saved.tag === asset.tag &&
    saved.name === asset.name &&
    saved.location === asset.location &&
    saved.locationId === asset.locationId;
  const find = () =>
    db
      .prepare(
        'SELECT ' +
          assetColumns +
          assetJoin +
          ' WHERE a.organization_id = ? AND a.id = ?',
      )
      .bind(organizationId, asset.id)
      .first<Asset>();
  const existing = await find();
  if (existing) {
    if (matches(existing)) return existing;
    throw new DomainError(
      'This asset request ID already describes different data.',
      409,
    );
  }
  // A plain INSERT ensures a conflicting retry cannot attach a location to an
  // existing asset. D1 rolls the whole batch back if either insertion fails.
  const insert = db
    .prepare(
      'INSERT INTO assets (id,organization_id,tag,name,location,created_at) VALUES (?,?,?,?,?,?)',
    )
    .bind(
      asset.id,
      organizationId,
      asset.tag,
      asset.name,
      asset.location,
      asset.createdAt,
    );
  try {
    const statements = [insert];
    if (locationId)
      statements.push(
        db
          .prepare(
            'INSERT INTO asset_locations (organization_id,asset_id,location_id) VALUES (?,?,?)',
          )
          .bind(organizationId, asset.id, locationId),
      );
    await db.batch(statements);
  } catch (error) {
    const saved = await find();
    if (saved && matches(saved)) return saved;
    const duplicate =
      saved ||
      (await db
        .prepare('SELECT id FROM assets WHERE organization_id = ? AND tag = ?')
        .bind(organizationId, asset.tag)
        .first());
    if (duplicate)
      throw new DomainError(
        'This asset tag or request ID already exists. Refresh and review the asset.',
        409,
      );
    throw error;
  }
  return asset;
}

export async function command(
  db: D1Database,
  body: Record<string, unknown>,
): Promise<WorkOrder> {
  const operationId = uuid(body.operationId);
  const id = uuid(body.id);
  const serialized = canonical(body);

  async function replay() {
    const event = await db
      .prepare(
        'SELECT command, result FROM work_order_events WHERE organization_id = ? AND operation_id = ?',
      )
      .bind(organizationId, operationId)
      .first<{ command: string; result: string }>();
    if (!event) return null;
    if (event.command !== serialized)
      throw new DomainError(
        'This operation ID was already used with different data.',
        409,
      );
    return JSON.parse(event.result) as WorkOrder;
  }
  const previous = await replay();
  if (previous) return previous;
  const now = new Date().toISOString();
  let mutation: D1PreparedStatement;
  if (body.kind === 'create') {
    const assetId = uuid(body.assetId);
    const title = field(body.title, 'Title', 160);
    const description = field(
      body.description ?? '',
      'Description',
      2000,
      true,
    );
    const priority = choice(
      body.priority,
      ['low', 'normal', 'high', 'urgent'] as const,
      'priority',
    );
    const type = choice(
      body.type,
      ['corrective', 'preventive', 'inspection'] as const,
      'work type',
    );
    mutation = db
      .prepare(
        "INSERT INTO work_orders (id,organization_id,asset_id,asset_tag,service_location,title,description,priority,type,status,version,created_at,updated_at,last_operation_id) SELECT ?,organization_id,id,tag,location,?,?,?,?, 'requested',1,?,?,? FROM assets WHERE organization_id = ? AND id = ? AND NOT EXISTS (SELECT 1 FROM work_order_events WHERE organization_id = ? AND operation_id = ?) ON CONFLICT DO NOTHING",
      )
      .bind(
        id,
        title,
        description,
        priority,
        type,
        now,
        now,
        operationId,
        organizationId,
        assetId,
        organizationId,
        operationId,
      );
  } else if (body.kind === 'transition') {
    if (
      !Number.isSafeInteger(body.expectedVersion) ||
      Number(body.expectedVersion) < 1
    )
      throw new DomainError('A positive expectedVersion is required.');
    const current = await db
      .prepare(
        'SELECT ' +
          columns +
          ' FROM work_orders WHERE organization_id = ? AND id = ?',
      )
      .bind(organizationId, id)
      .first<WorkOrder>();
    if (!current) throw new DomainError('Work order not found.', 404);
    if (current.version !== body.expectedVersion) {
      const accepted = await replay();
      if (accepted) return accepted;
      throw new DomainError(
        'Another change was saved first. Your entry is preserved. Close this form, review the refreshed work order, then try again.',
        409,
      );
    }
    const next = choice(body.status, statuses, 'status');
    validateTransition(current.status, next, body);
    mutation = db
      .prepare(
        'UPDATE work_orders SET status = ?, assignee = ?, completion_note = ?, version = version + 1, updated_at = ?, last_operation_id = ? WHERE organization_id = ? AND id = ? AND version = ? AND NOT EXISTS (SELECT 1 FROM work_order_events WHERE organization_id = ? AND operation_id = ?)',
      )
      .bind(
        next,
        next === 'assigned'
          ? field(body.assignee, 'Assigned technician', 120)
          : current.assignee,
        next === 'completed'
          ? field(body.completionNote, 'Completion note', 2000)
          : current.completionNote,
        now,
        operationId,
        organizationId,
        id,
        body.expectedVersion as number,
        organizationId,
        operationId,
      );
  } else throw new DomainError('Invalid command kind.');
  // The mutation, immutable result, and audit entry commit together. The operation marker
  // prevents a failed compare-and-set from recording an event for another writer.
  try {
    await db.batch([
      mutation,
      db
        .prepare(
          'INSERT INTO work_order_events (organization_id,operation_id,work_order_id,version,command,result,actor,created_at) SELECT organization_id,?,id,version,?,' +
            resultJson +
            ", 'pilot-owner',? FROM work_orders WHERE organization_id = ? AND id = ? AND last_operation_id = ? AND NOT EXISTS (SELECT 1 FROM work_order_events WHERE organization_id = ? AND operation_id = ?)",
        )
        .bind(
          operationId,
          serialized,
          now,
          organizationId,
          id,
          operationId,
          organizationId,
          operationId,
        ),
    ]);
  } catch (error) {
    const accepted = await replay();
    if (accepted) return accepted;
    throw error;
  }
  const accepted = await replay();
  if (!accepted)
    throw new DomainError(
      'The asset is unavailable or this work order changed. Refresh and review before trying again.',
      409,
    );
  return accepted;
}
