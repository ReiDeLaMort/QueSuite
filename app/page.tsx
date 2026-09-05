'use client';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type SyntheticEvent,
} from 'react';
import {
  Wrench,
  Plus,
  ArrowRight,
  RefreshCw,
  ClipboardList,
  Box,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Choice } from '@/components/form-choice';
import { LocationFields, LocationList } from '@/components/location-manager';
import type { LocationKind } from '@/lib/domain';
import { registerWorkOrderTools } from '@/lib/webmcp';
import {
  statuses,
  labels,
  type Snapshot,
  type WorkOrder,
  type Status,
} from '@/lib/domain';
const empty: Snapshot = { assets: [], workOrders: [], locations: [] };
type FormMode = 'asset' | 'work-order' | 'location' | WorkOrder | null;
export default function Home() {
  const [data, setData] = useState<Snapshot>(empty);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<FormMode>(null);
  const [filter, setFilter] = useState('all');
  const [tab, setTab] = useState('work-orders');
  const [query, setQuery] = useState('');
  const [locationKind, setLocationKind] = useState<LocationKind>('site');
  const locations = data.locations ?? [];
  const loadGeneration = useRef(0);
  const [drafts, setDrafts] = useState<
    Record<
      string,
      { title: string; fields: Record<string, FormDataEntryValue> }
    >
  >({});
  const pending = useRef<{
    signature: string;
    body: Record<string, unknown>;
  } | null>(null);
  function openLocation() {
    pending.current = null;
    setError('');
    setLocationKind('site');
    setMode('location');
  }
  function openAsset() {
    if (!locations.length) {
      openLocation();
      return;
    }
    pending.current = null;
    setError('');
    setMode('asset');
  }
  const refresh = useCallback(async () => {
    const generation = ++loadGeneration.current;
    const response = await fetch('/api/snapshot', { cache: 'no-store' });
    if (!response.ok)
      throw new Error(
        'Could not load your records. Check the connection and try Refresh.',
      );
    const snapshot = (await response.json()) as Snapshot;
    if (generation === loadGeneration.current) {
      setData(snapshot);
      setReady(true);
    }
  }, []);
  useEffect(() => {
    Promise.resolve()
      .then(refresh)
      .catch((e) => setError(String(e.message)));
  }, [refresh]);
  useEffect(
    () =>
      registerWorkOrderTools((query, status) => {
        setQuery(query);
        setFilter(status);
        setTab('work-orders');
      }),
    [],
  );
  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);
    setError('');
    setNotice('');
    if (mode && typeof mode === 'object')
      setDrafts((current) => ({
        ...current,
        [mode.id]: { title: mode.title, fields },
      }));
    try {
      const signature = JSON.stringify([mode, fields]);
      const candidate =
        mode === 'asset' || mode === 'location'
          ? { id: pending.current?.body.id || crypto.randomUUID(), ...fields }
          : mode === 'work-order'
            ? {
                kind: 'create',
                operationId: crypto.randomUUID(),
                id: pending.current?.body.id || crypto.randomUUID(),
                ...fields,
              }
            : {
                kind: 'transition',
                operationId: crypto.randomUUID(),
                id: mode!.id,
                expectedVersion: mode!.version,
                status: statuses[statuses.indexOf(mode!.status) + 1],
                ...fields,
              };
      if (pending.current?.signature !== signature)
        pending.current = { signature, body: candidate };
      const body = pending.current.body;
      const response = await fetch(
        mode === 'asset'
          ? '/api/assets'
          : mode === 'location'
            ? '/api/locations'
            : '/api/work-orders',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      );
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        if (response.status === 409) await refresh();
        throw new Error(result.error || 'The change could not be saved.');
      }
      if (mode && typeof mode === 'object')
        setDrafts((current) => {
          const remaining = { ...current };
          delete remaining[mode.id];
          return remaining;
        });
      pending.current = null;
      setMode(null);
      setNotice('Saved.');
      await refresh();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Connection lost. Your change has not been confirmed.',
      );
    } finally {
      setBusy(false);
    }
  }
  const visible = data.workOrders.filter(
    (w) =>
      (filter === 'all' || w.status === filter) &&
      [w.title, w.assetTag, w.assignee || '']
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const active = data.workOrders.filter(
    (w) => !['completed', 'closed'].includes(w.status),
  ).length;
  const next =
    typeof mode === 'object' && mode
      ? statuses[statuses.indexOf(mode.status) + 1]
      : undefined;
  const action: Record<Status, string> = {
    requested: 'Assign work',
    assigned: 'Start work',
    in_progress: 'Complete work',
    completed: 'Close work order',
    closed: 'Closed',
  };
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link href="/" className="brand">
          <span className="brand-icon">
            <Wrench size={23} />
          </span>
          <span>
            QueSuite <small>CMMS</small>
          </span>
        </Link>
        <span className="pilot-label">WORKSPACE / PILOT</span>
      </header>
      <main className="workspace">
        <div className="page-heading">
          <div>
            <p className="eyebrow">MAINTENANCE OPERATIONS</p>
            <h1>Keep the work moving.</h1>
            <p className="muted">
              Your equipment. Your team. Every work order in one place.
            </p>
          </div>
          <Button
            disabled={!ready || !data.assets.length}
            onClick={() => {
              setError('');
              setMode('work-order');
            }}
          >
            <Plus /> New work order
          </Button>
        </div>
        <div className="metrics">
          <div>
            <span>Open work orders</span>
            <strong>{ready ? active.toString().padStart(2, '0') : '—'}</strong>
            <ClipboardList />
          </div>
          <div>
            <span>Awaiting closure</span>
            <strong>
              {ready
                ? data.workOrders
                    .filter((w) => w.status === 'completed')
                    .length.toString()
                    .padStart(2, '0')
                : '—'}
            </strong>
            <CheckCircle2 />
          </div>
          <div>
            <span>Registered assets</span>
            <strong>
              {ready ? data.assets.length.toString().padStart(2, '0') : '—'}
            </strong>
            <Box />
          </div>
        </div>
        <div aria-live="polite">
          {notice && <p className="notice">{notice}</p>}
          {error && !mode && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </div>
        {Object.entries(drafts).map(([id, draft]) => (
          <details className="notice" key={id}>
            <summary>Unsent entry: {draft.title}</summary>
            {Object.entries(draft.fields).map(([field, value]) => (
              <p key={field}>
                {field}: {typeof value === 'string' ? value : value.name}
              </p>
            ))}
            <Button
              variant="ghost"
              onClick={() =>
                setDrafts((current) => {
                  const remaining = { ...current };
                  delete remaining[id];
                  return remaining;
                })
              }
            >
              Discard this draft
            </Button>
          </details>
        ))}
        <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
          <div className="section-bar">
            <TabsList variant="line">
              <TabsTrigger value="work-orders">Work orders</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="locations">Locations</TabsTrigger>
            </TabsList>
            <Button
              variant="ghost"
              onClick={() => {
                setError('');
                refresh().catch((e) => setError(String(e.message)));
              }}
            >
              <RefreshCw /> Refresh
            </Button>
          </div>
          <TabsContent value="work-orders">
            <div className="toolbar">
              <Input
                aria-label="Search work orders"
                placeholder="Search title, asset, or assignee…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Select
                value={filter}
                onValueChange={(v) => setFilter(String(v))}
                items={[
                  { value: 'all', label: 'All statuses' },
                  ...statuses.map((value) => ({ value, label: labels[value] })),
                ]}
              >
                <SelectTrigger aria-label="Filter by status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {labels[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!ready ? (
              <div className="empty-state">
                <ClipboardList />
                <h2>
                  {error
                    ? 'Your workspace is unavailable'
                    : 'Loading your workspace…'}
                </h2>
                <p>Use Refresh to try again.</p>
              </div>
            ) : visible.length ? (
              <ul className="orders">
                {visible.map((w) => (
                  <li key={w.id} className="order">
                    <div className={'priority-mark ' + w.priority} />
                    <div className="order-main">
                      <div className="order-meta">
                        <span>{w.assetTag}</span>
                        <span className={'badge ' + w.status}>
                          {labels[w.status]}
                        </span>
                        <span className="priority-text">
                          {w.priority} priority
                        </span>
                      </div>
                      <h2>{w.title}</h2>
                      <p>
                        {w.serviceLocation} · {w.assignee || 'Unassigned'} ·{' '}
                        {w.type}
                      </p>
                      {w.description && (
                        <p className="order-description">{w.description}</p>
                      )}
                      {w.completionNote && (
                        <p className="completion">
                          <strong>Completion note:</strong> {w.completionNote}
                        </p>
                      )}
                    </div>
                    {w.status !== 'closed' && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setError('');
                          setMode(w);
                        }}
                      >
                        {action[w.status]}
                        <ArrowRight />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">
                <ClipboardList />
                <h2>
                  {data.workOrders.length
                    ? 'No matching work orders'
                    : 'A clear start for your maintenance team'}
                </h2>
                <p>
                  {data.workOrders.length
                    ? 'Try a different search or status.'
                    : data.assets.length
                      ? 'Create a work order to record what needs attention.'
                      : locations.length
                        ? 'Register your first asset, then create its first work order.'
                        : 'Add your first location, then register the equipment there.'}
                </p>
                {!data.assets.length && (
                  <Button
                    onClick={() => {
                      setError('');
                      openAsset();
                    }}
                  >
                    <Plus />{' '}
                    {locations.length
                      ? 'Add your first asset'
                      : 'Add your first location'}
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
          <TabsContent value="assets">
            <div className="toolbar">
              <p className="muted">The equipment your team maintains.</p>
              <Button
                onClick={() => {
                  setError('');
                  openAsset();
                }}
                disabled={!ready}
              >
                <Plus /> {locations.length ? 'Add asset' : 'Add location'}
              </Button>
            </div>
            {data.assets.length ? (
              <ul className="asset-grid">
                {data.assets.map((a) => (
                  <li key={a.id}>
                    <span className="asset-tag">
                      <Box size={18} />
                      {a.tag}
                    </span>
                    <h2>{a.name}</h2>
                    <p>{a.location}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">
                <Box />
                <h2>No assets registered yet</h2>
                <p>Add an asset with its tag and service location.</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="locations">
            <LocationList
              locations={locations}
              assets={data.assets}
              ready={ready}
              onAdd={openLocation}
            />
          </TabsContent>
        </Tabs>
        <footer>
          <span>QueSuite CMMS · Pilot 0.2</span>
          <span>Online pilot · Changes require a connection</span>
        </footer>
      </main>
      <Dialog
        open={mode !== null}
        onOpenChange={(open) => {
          if (!open && !busy) {
            pending.current = null;
            setMode(null);
            setError('');
          }
        }}
      >
        <DialogContent className="work-dialog">
          <DialogTitle>
            {mode === 'location'
              ? 'Add a location'
              : mode === 'asset'
                ? 'Register an asset'
                : mode === 'work-order'
                  ? 'New work order'
                  : mode
                    ? action[mode.status]
                    : ''}
          </DialogTitle>
          <DialogDescription>
            {typeof mode === 'object' && mode
              ? mode.title
              : 'Keep the details clear for the next person doing the work.'}
          </DialogDescription>
          <form
            onSubmit={submit}
            className="work-form"
            key={typeof mode === 'string' ? mode : mode?.id}
          >
            {mode === 'location' ? (
              <LocationFields
                kind={locationKind}
                onKindChange={setLocationKind}
                locations={locations}
              />
            ) : mode === 'asset' ? (
              <>
                <label className="field" htmlFor="tag">
                  Asset tag
                  <Input
                    id="tag"
                    name="tag"
                    required
                    maxLength={40}
                    placeholder="e.g. PUMP-001"
                  />
                </label>
                <label className="field" htmlFor="name">
                  Asset name
                  <Input
                    id="name"
                    name="name"
                    required
                    maxLength={120}
                    placeholder="e.g. Cooling water pump"
                  />
                </label>
                <Choice
                  name="locationId"
                  title="Location"
                  items={locations.map((location) => ({
                    value: location.id,
                    label: location.path,
                  }))}
                />
              </>
            ) : mode === 'work-order' ? (
              <>
                <label className="field" htmlFor="title">
                  Title
                  <Input
                    id="title"
                    name="title"
                    required
                    maxLength={160}
                    placeholder="What needs attention?"
                  />
                </label>
                <Choice
                  name="assetId"
                  title="Asset"
                  items={data.assets.map((a) => ({
                    value: a.id,
                    label: a.tag + ' · ' + a.name,
                  }))}
                />
                <div className="form-row">
                  <Choice
                    name="priority"
                    title="Priority"
                    initial="normal"
                    items={['low', 'normal', 'high', 'urgent'].map((value) => ({
                      value,
                      label: value[0].toUpperCase() + value.slice(1),
                    }))}
                  />
                  <Choice
                    name="type"
                    title="Work type"
                    initial="corrective"
                    items={['corrective', 'preventive', 'inspection'].map(
                      (value) => ({
                        value,
                        label: value[0].toUpperCase() + value.slice(1),
                      }),
                    )}
                  />
                </div>
                <label className="field" htmlFor="description">
                  Description
                  <Textarea
                    id="description"
                    name="description"
                    maxLength={2000}
                    placeholder="Symptoms, observations, and the work needed."
                  />
                </label>
              </>
            ) : (
              <>
                {next === 'assigned' && (
                  <label className="field" htmlFor="assignee">
                    Assigned technician
                    <Input
                      id="assignee"
                      name="assignee"
                      required
                      maxLength={120}
                      placeholder="Technician name"
                    />
                  </label>
                )}
                {next === 'completed' && (
                  <label className="field" htmlFor="completionNote">
                    Completion note
                    <Textarea
                      id="completionNote"
                      name="completionNote"
                      required
                      maxLength={2000}
                      placeholder="Describe the work performed and the result."
                    />
                  </label>
                )}
                {next === 'in_progress' && (
                  <p>
                    Record that the assigned technician has started this work.
                  </p>
                )}
                {next === 'closed' && (
                  <p>
                    Confirm the completed work has been reviewed. Closed work
                    orders are read-only in this pilot.
                  </p>
                )}
              </>
            )}
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={
                busy ||
                (mode === 'location' &&
                  locationKind !== 'site' &&
                  !locations.some(
                    (l) =>
                      l.kind ===
                      (locationKind === 'building' ? 'site' : 'building'),
                  ))
              }
            >
              {busy
                ? 'Saving…'
                : mode === 'location'
                  ? 'Save location'
                  : mode === 'asset'
                    ? 'Register asset'
                    : mode === 'work-order'
                      ? 'Create work order'
                      : 'Confirm'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
