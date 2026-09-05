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
