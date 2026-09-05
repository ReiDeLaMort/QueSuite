import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { command, addAsset, snapshot } from '../lib/server/repository.ts';
import { DomainError } from '../lib/domain.ts';
import { addLocation } from '../lib/server/locations.ts';

function database(migrationCount = Infinity) {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec('PRAGMA foreign_keys = ON');
  for (const file of readdirSync(new URL('../drizzle/', import.meta.url))
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .slice(0, migrationCount))
    sqlite.exec(
      readFileSync(new URL('../drizzle/' + file, import.meta.url), 'utf8'),
    );
  class Statement {
    sql: string;
    args: (string | number | null)[] = [];
    constructor(sql: string) {
      this.sql = sql;
    }
    bind(...args: (string | number | null)[]) {
      this.args = args;
      return this;
    }
    async first() {
      const row = sqlite.prepare(this.sql).get(...this.args);
      return row ? { ...row } : null;
    }
    async run() {
      const result = sqlite.prepare(this.sql).run(...this.args);
      return {
        success: true,
        meta: { changes: Number(result.changes) },
        results: [],
      };
    }
    async all() {
      return {
        success: true,
        results: sqlite
          .prepare(this.sql)
          .all(...this.args)
          .map((row) => ({ ...row })),
      };
    }
  }
  const db = {
    prepare: (sql: string) => new Statement(sql),
    async batch(statements: Statement[]) {
      sqlite.exec('BEGIN');
      try {
        const result = [];
        for (const statement of statements)
          result.push(
            statement.sql.startsWith('SELECT')
              ? await statement.all()
              : await statement.run(),
          );
        sqlite.exec('COMMIT');
        return result;
      } catch (e) {
        sqlite.exec('ROLLBACK');
        throw e;
      }
    },
  } as unknown as D1Database;
  return { db, sqlite };
}
async function setup() {
  const context = database();
  const asset = await addAsset(context.db, {
    id: crypto.randomUUID(),
    tag: 'P-001',
    name: 'Cooling pump',
    location: 'Plant / Utility room',
  });
  const create = {
    kind: 'create',
    operationId: crypto.randomUUID(),
    id: crypto.randomUUID(),
    assetId: asset.id,
    title: 'Inspect seal leak',
    description: 'Observe at startup',
    priority: 'high',
    type: 'corrective',
  };
  return { ...context, asset, create };
}
const transition = (
  id: string,
  version: number,
  status: string,
  extra = {},
) => ({
  kind: 'transition',
  id,
  operationId: crypto.randomUUID(),
  expectedVersion: version,
  status,
  ...extra,
});
await test('complete lifecycle persists service location and exactly five audit events', async () => {
  const { db, sqlite, create } = await setup();
  try {
    let order = await command(db, create);
    assert.equal(order.version, 1);
    order = await command(
      db,
      transition(order.id, 1, 'assigned', { assignee: 'Technician A' }),
    );
    order = await command(db, transition(order.id, 2, 'in_progress'));
    await assert.rejects(
      command(
        db,
        transition(order.id, 3, 'completed', { completionNote: '  ' }),
      ),
      DomainError,
    );
    order = await command(
      db,
      transition(order.id, 3, 'completed', {
        completionNote: 'Replaced seal and checked for leaks.',
      }),
    );
    order = await command(db, transition(order.id, 4, 'closed'));
    await assert.rejects(
      command(db, transition(order.id, 5, 'requested')),
      DomainError,
    );
    assert.equal(order.status, 'closed');
    assert.equal(order.version, 5);
    assert.equal(
      (await snapshot(db)).workOrders[0].serviceLocation,
      'Plant / Utility room',
    );
    assert.equal(
      sqlite.prepare('SELECT count(*) AS n FROM work_order_events').get()!.n,
      5,
    );
  } finally {
    sqlite.close();
  }
});
await test('lost response replay returns original result after later updates; changed payload rejected', async () => {
  const { db, sqlite, create } = await setup();
  try {
    const original = await command(db, create);
    await command(
      db,
      transition(original.id, 1, 'assigned', { assignee: 'Technician A' }),
    );
    assert.deepEqual(await command(db, create), original);
    await assert.rejects(
      command(db, { ...create, title: 'Different work' }),
      (e: unknown) => e instanceof DomainError && e.status === 409,
    );
    assert.equal((await snapshot(db)).workOrders[0].version, 2);
    assert.equal(
      sqlite.prepare('SELECT count(*) AS n FROM work_order_events').get()!.n,
      2,
    );
  } finally {
    sqlite.close();
  }
});
await test('stale update cannot overwrite a newer assignment or create a false audit event', async () => {
  const { db, sqlite, create } = await setup();
  try {
    const order = await command(db, create);
    await command(
      db,
      transition(order.id, 1, 'assigned', { assignee: 'Technician A' }),
    );
    await assert.rejects(
      command(
        db,
        transition(order.id, 1, 'assigned', { assignee: 'Technician B' }),
      ),
      (e: unknown) => e instanceof DomainError && e.status === 409,
    );
    assert.equal((await snapshot(db)).workOrders[0].assignee, 'Technician A');
    assert.equal(
      sqlite.prepare('SELECT count(*) AS n FROM work_order_events').get()!.n,
      2,
    );
  } finally {
    sqlite.close();
  }
});
await test('SQL failure during auditing rolls the work-order mutation back', async () => {
  const { db, sqlite, create } = await setup();
  try {
    const order = await command(db, create);
    sqlite.exec(
      "CREATE TRIGGER force_audit_failure BEFORE INSERT ON work_order_events BEGIN SELECT RAISE(ABORT,'simulated disk failure'); END",
    );
    await assert.rejects(
      command(
        db,
        transition(order.id, 1, 'assigned', { assignee: 'Technician A' }),
      ),
    );
    assert.equal((await snapshot(db)).workOrders[0].version, 1);
    assert.equal((await snapshot(db)).workOrders[0].status, 'requested');
    assert.equal(
      sqlite.prepare('SELECT count(*) AS n FROM work_order_events').get()!.n,
      1,
    );
  } finally {
    sqlite.close();
  }
});
await test('organization-scoped references and tags reject foreign assets and duplicates', async () => {
  const { db, sqlite, create, asset } = await setup();
  try {
    await assert.rejects(
      addAsset(db, { ...asset, id: crypto.randomUUID(), tag: 'p-001' }),
      DomainError,
    );
    const foreign = crypto.randomUUID();
    sqlite
      .prepare('INSERT INTO assets VALUES (?,?,?,?,?,?)')
      .run(
        foreign,
        'another-company',
        'P-001',
        'Other pump',
        'Other plant',
        new Date().toISOString(),
      );
    await assert.rejects(
      command(db, { ...create, assetId: foreign }),
      DomainError,
    );
    assert.equal((await snapshot(db)).assets.length, 1);
    assert.equal((await snapshot(db)).workOrders.length, 0);
  } finally {
    sqlite.close();
  }
});
await test('invalid IDs, enums, skipped lifecycle and blank assignees fail without a write', async () => {
  const { db, sqlite, create } = await setup();
  try {
    await assert.rejects(
      command(db, { ...create, priority: 'unknown' }),
      DomainError,
    );
    await assert.rejects(
      command(db, { ...create, id: 'invalid' }),
      DomainError,
    );
    const order = await command(db, create);
    await assert.rejects(
      command(db, transition(order.id, 1, 'closed')),
      DomainError,
    );
    await assert.rejects(
      command(db, transition(order.id, 1, 'assigned', { assignee: '' })),
      DomainError,
    );
    assert.equal((await snapshot(db)).workOrders[0].version, 1);
  } finally {
    sqlite.close();
  }
});
await test('an idempotency key accepted between read and mutation prevents a second record', async () => {
  const { db, sqlite, create } = await setup();
  try {
    const original = await command(db, create);
    const alternate = {
      ...create,
      id: crypto.randomUUID(),
      title: 'Racing command',
    };
    let first = true;
    const wrapped = {
      prepare(sql: string) {
        const stmt = db.prepare(sql);
        if (sql.startsWith('SELECT command, result') && first) {
          first = false;
          return { bind: () => ({ first: async () => null }) };
        }
        return stmt;
      },
      batch: db.batch.bind(db),
    } as unknown as D1Database;
    await assert.rejects(
      command(wrapped, alternate),
      (e: unknown) => e instanceof DomainError && e.status === 409,
    );
    assert.equal((await snapshot(db)).workOrders.length, 1);
    assert.equal((await snapshot(db)).workOrders[0].id, original.id);
  } finally {
    sqlite.close();
  }
});

const locationRequest = (
  name: string,
  kind: string,
  parentId: string | null = null,
) => ({
  id: crypto.randomUUID(),
  name,
  kind,
  parentId,
});
async function hierarchy(db: D1Database) {
  const site = await addLocation(db, locationRequest('Main plant', 'site'));
  const building = await addLocation(
    db,
    locationRequest('Production', 'building', site.id),
  );
  const area = await addLocation(
    db,
    locationRequest('Assembly line 1', 'area', building.id),
  );
  return { site, building, area };
}
await test('structured hierarchy derives asset and work-order locations on the server', async () => {
  const { db, sqlite } = database();
  try {
    const { area } = await hierarchy(db);
    const request = {
      id: crypto.randomUUID(),
      tag: 'A-1',
      name: 'Press',
      locationId: area.id,
    };
    const asset = await addAsset(db, request);
    assert.equal(asset.location, 'Main plant / Production / Assembly line 1');
    assert.equal(asset.locationId, area.id);
    assert.deepEqual(await addAsset(db, request), asset);
    const order = await command(db, {
      kind: 'create',
      operationId: crypto.randomUUID(),
      id: crypto.randomUUID(),
      assetId: asset.id,
      title: 'Inspect press',
      priority: 'normal',
      type: 'inspection',
    });
    assert.equal(order.serviceLocation, asset.location);
    assert.equal((await snapshot(db)).locations.length, 3);
    assert.equal(
      sqlite.prepare('SELECT count(*) AS n FROM asset_locations').get()!.n,
      1,
    );
  } finally {
    sqlite.close();
  }
});
await test('location retries preserve original timestamps and reject changed identity', async () => {
  const { db, sqlite } = database();
  try {
    const request = locationRequest('  Main   plant  ', 'site');
    const original = await addLocation(db, request);
    assert.equal(original.name, 'Main plant');
    assert.deepEqual(await addLocation(db, request), original);
    await assert.rejects(
      addLocation(db, { ...request, name: 'Different site' }),
      (e: unknown) => e instanceof DomainError && e.status === 409,
    );
    assert.equal((await snapshot(db)).locations.length, 1);
  } finally {
    sqlite.close();
  }
});
await test('case-insensitive root and sibling names are unique, distinct parents may reuse names', async () => {
  const { db, sqlite } = database();
  try {
    const { site, building } = await hierarchy(db);
    await assert.rejects(
      addLocation(db, locationRequest('MAIN PLANT', 'site')),
      DomainError,
    );
    await assert.rejects(
      addLocation(db, locationRequest('production', 'building', site.id)),
      DomainError,
    );
    const other = await addLocation(
      db,
      locationRequest('Second plant', 'site'),
    );
    const reused = await addLocation(
      db,
      locationRequest(building.name, 'building', other.id),
    );
    assert.notEqual(reused.id, building.id);
    assert.equal((await snapshot(db)).locations.length, 5);
  } finally {
    sqlite.close();
  }
});
await test('invalid parent kinds, missing parents, self-parenting, and ambiguous names are rejected', async () => {
  const { db, sqlite } = database();
  try {
    const { site, area } = await hierarchy(db);
    const self = crypto.randomUUID();
    for (const request of [
      locationRequest('Missing parent', 'building'),
      locationRequest('Nested site', 'site', site.id),
      locationRequest('Skipped building', 'area', site.id),
      locationRequest('Too deep', 'building', area.id),
      locationRequest('Missing', 'building', crypto.randomUUID()),
      { id: self, name: 'Self', kind: 'building', parentId: self },
      locationRequest('Plant / Building', 'site'),
      locationRequest('x'.repeat(51), 'site'),
    ])
      await assert.rejects(addLocation(db, request), DomainError);
    assert.equal((await snapshot(db)).locations.length, 3);
  } finally {
    sqlite.close();
  }
});
await test('company boundaries apply to location parents, asset assignments, reads, and SQL foreign keys', async () => {
  const { db, sqlite, asset } = await setup();
  try {
    const foreign = crypto.randomUUID();
    sqlite
      .prepare(
        'INSERT INTO locations (id,organization_id,name,name_key,kind,parent_id,path,created_at) VALUES (?,?,?,?,?,?,?,?)',
      )
      .run(
        foreign,
        'another-company',
        'Other plant',
        'other plant',
        'site',
        null,
        'Other plant',
        new Date().toISOString(),
      );
    await assert.rejects(
      addLocation(db, locationRequest('Foreign building', 'building', foreign)),
      DomainError,
    );
    await assert.rejects(
      addAsset(db, {
        id: crypto.randomUUID(),
        tag: 'X-1',
        name: 'Other equipment',
        locationId: foreign,
      }),
      DomainError,
    );
    assert.throws(() =>
      sqlite
        .prepare('INSERT INTO asset_locations VALUES (?,?,?)')
        .run('quesuite-pilot', asset.id, foreign),
    );
    assert.throws(() =>
      sqlite
        .prepare(
          'INSERT INTO locations (id,organization_id,name,name_key,kind,parent_id,path,created_at) VALUES (?,?,?,?,?,?,?,?)',
        )
        .run(
          crypto.randomUUID(),
          'quesuite-pilot',
          'Cross-company',
          'cross-company',
          'building',
          foreign,
          'Other plant / Cross-company',
          new Date().toISOString(),
        ),
    );
    assert.equal((await snapshot(db)).locations.length, 0);
    assert.equal((await snapshot(db)).assets.length, 1);
  } finally {
    sqlite.close();
  }
});
await test('failed location association rolls back a newly registered asset', async () => {
  const { db, sqlite } = database();
  try {
    const { area } = await hierarchy(db);
    sqlite.exec(
      "CREATE TRIGGER fail_assignment BEFORE INSERT ON asset_locations BEGIN SELECT RAISE(ABORT,'simulated association failure'); END",
    );
    await assert.rejects(
      addAsset(db, {
        id: crypto.randomUUID(),
        tag: 'ROLLBACK-1',
        name: 'Press',
        locationId: area.id,
      }),
    );
    assert.equal((await snapshot(db)).assets.length, 0);
    assert.equal(
      sqlite.prepare('SELECT count(*) AS n FROM asset_locations').get()!.n,
      0,
    );
  } finally {
    sqlite.close();
  }
});
await test('conflicting retry cannot attach a location to an existing legacy asset', async () => {
  const { db, sqlite } = database();
  try {
    const { area } = await hierarchy(db);
    const request = {
      id: crypto.randomUUID(),
      tag: 'LEGACY-1',
      name: 'Press',
      location: area.path,
    };
    const asset = await addAsset(db, request);
    // Same display label still cannot silently change the structured association.
    await assert.rejects(
      addAsset(db, {
        id: asset.id,
        tag: asset.tag,
        name: asset.name,
        locationId: area.id,
      }),
      DomainError,
    );
    assert.equal((await snapshot(db)).assets[0].locationId, null);
    assert.equal(
      sqlite.prepare('SELECT count(*) AS n FROM asset_locations').get()!.n,
      0,
    );
  } finally {
    sqlite.close();
  }
});
await test('additive migration preserves populated assets, work orders, audit JSON, and replay results', async () => {
  const { db, sqlite } = database(1);
  try {
    const assetId = crypto.randomUUID();
    sqlite
      .prepare('INSERT INTO assets VALUES (?,?,?,?,?,?)')
      .run(
        assetId,
        'quesuite-pilot',
        'OLD-1',
        'Legacy pump',
        'Old site / Pump room',
        new Date().toISOString(),
      );
    const create = {
      kind: 'create',
      operationId: crypto.randomUUID(),
      id: crypto.randomUUID(),
      assetId,
      title: 'Legacy inspection',
      priority: 'normal',
      type: 'inspection',
    };
    const original = await command(db, create);
    const before = sqlite.prepare('SELECT * FROM work_order_events').all();
    for (const file of readdirSync(new URL('../drizzle/', import.meta.url))
      .filter((f) => f.endsWith('.sql'))
      .sort()
      .slice(1))
      sqlite.exec(
        readFileSync(new URL('../drizzle/' + file, import.meta.url), 'utf8'),
      );
    const upgraded = await snapshot(db);
    assert.equal(upgraded.assets[0].location, 'Old site / Pump room');
    assert.equal(upgraded.assets[0].locationId, null);
    assert.deepEqual(upgraded.workOrders, [original]);
    assert.deepEqual(
      sqlite.prepare('SELECT * FROM work_order_events').all(),
      before,
    );
    assert.deepEqual(await command(db, create), original);
    assert.deepEqual(upgraded.locations, []);
    assert.equal(sqlite.prepare('PRAGMA foreign_key_check').all().length, 0);
  } finally {
    sqlite.close();
  }
});
await test('maximum supported hierarchy fits the existing location label limit', async () => {
  const { db, sqlite } = database();
  try {
    const site = await addLocation(db, locationRequest('S'.repeat(50), 'site'));
    const building = await addLocation(
      db,
      locationRequest('B'.repeat(50), 'building', site.id),
    );
    const area = await addLocation(
      db,
      locationRequest('A'.repeat(50), 'area', building.id),
    );
    const asset = await addAsset(db, {
      id: crypto.randomUUID(),
      tag: 'MAX-1',
      name: 'Press',
      locationId: area.id,
    });
    assert.equal(asset.location.length, 156);
  } finally {
    sqlite.close();
  }
});
