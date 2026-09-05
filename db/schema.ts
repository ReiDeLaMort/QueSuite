import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  foreignKey,
  check,
  primaryKey,
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
export const locations = sqliteTable(
  'locations',
  {
    id: text('id').notNull(),
    organizationId: text('organization_id').notNull(),
    name: text('name').notNull(),
    nameKey: text('name_key').notNull(),
    kind: text('kind').notNull(),
    parentId: text('parent_id'),
    path: text('path').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.organizationId, t.id] }),
    foreignKey({
      columns: [t.organizationId, t.parentId],
      foreignColumns: [t.organizationId, t.id],
    }),
    uniqueIndex('locations_root_name')
      .on(t.organizationId, t.nameKey)
      .where(sql`${t.parentId} IS NULL`),
    uniqueIndex('locations_child_name')
      .on(t.organizationId, t.parentId, t.nameKey)
      .where(sql`${t.parentId} IS NOT NULL`),
    check('location_kind', sql`${t.kind} IN ('site','building','area')`),
    check(
      'location_parent',
      sql`(${t.kind} = 'site' AND ${t.parentId} IS NULL) OR (${t.kind} IN ('building','area') AND ${t.parentId} IS NOT NULL)`,
    ),
    check(
      'location_not_self',
      sql`${t.parentId} IS NULL OR ${t.parentId} <> ${t.id}`,
    ),
  ],
);
export const assets = sqliteTable(
  'assets',
  {
    id: text('id').notNull(),
    organizationId: text('organization_id').notNull(),
    tag: text('tag').notNull(),
    name: text('name').notNull(),
    location: text('location').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.organizationId, t.id] }),
    uniqueIndex('assets_org_tag').on(t.organizationId, t.tag),
  ],
);
// An additive association preserves existing assets and their historical labels.
export const assetLocations = sqliteTable(
  'asset_locations',
  {
    organizationId: text('organization_id').notNull(),
    assetId: text('asset_id').notNull(),
    locationId: text('location_id').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.organizationId, t.assetId] }),
    foreignKey({
      columns: [t.organizationId, t.assetId],
      foreignColumns: [assets.organizationId, assets.id],
    }),
    foreignKey({
      columns: [t.organizationId, t.locationId],
      foreignColumns: [locations.organizationId, locations.id],
    }),
  ],
);
export const workOrders = sqliteTable(
  'work_orders',
  {
    id: text('id').notNull(),
    organizationId: text('organization_id').notNull(),
    assetId: text('asset_id').notNull(),
    assetTag: text('asset_tag').notNull(),
    serviceLocation: text('service_location').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    priority: text('priority').notNull(),
    type: text('type').notNull(),
    status: text('status').notNull(),
    assignee: text('assignee'),
    completionNote: text('completion_note'),
    version: integer('version').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    lastOperationId: text('last_operation_id').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.organizationId, t.id] }),
    foreignKey({
      columns: [t.organizationId, t.assetId],
      foreignColumns: [assets.organizationId, assets.id],
    }),
    check(
      'work_order_status',
      sql`${t.status} IN ('requested','assigned','in_progress','completed','closed')`,
    ),
    check('work_order_version', sql`${t.version} > 0`),
    check(
      'work_order_priority',
      sql`${t.priority} IN ('low','normal','high','urgent')`,
    ),
    check(
      'work_order_type',
      sql`${t.type} IN ('corrective','preventive','inspection')`,
    ),
  ],
);
export const events = sqliteTable(
  'work_order_events',
  {
    organizationId: text('organization_id').notNull(),
    operationId: text('operation_id').notNull(),
    workOrderId: text('work_order_id').notNull(),
    version: integer('version').notNull(),
    command: text('command').notNull(),
    result: text('result').notNull(),
    actor: text('actor').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.organizationId, t.operationId] }),
    uniqueIndex('events_org_order_version').on(
      t.organizationId,
      t.workOrderId,
      t.version,
    ),
    foreignKey({
      columns: [t.organizationId, t.workOrderId],
      foreignColumns: [workOrders.organizationId, workOrders.id],
    }),
  ],
);
