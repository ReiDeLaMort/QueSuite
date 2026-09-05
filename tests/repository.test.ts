import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { command, addAsset, snapshot } from '../lib/server/repository.ts';
import { DomainError } from '../lib/domain.ts';

function database() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec('PRAGMA foreign_keys = ON');
  for (const file of readdirSync(new URL('../drizzle/', import.meta.url))
    .filter((f) => f.endsWith('.sql'))
    .sort())
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
      return sqlite.prepare(this.sql).get(...this.args) ?? null;
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
        results: sqlite.prepare(this.sql).all(...this.args),
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
