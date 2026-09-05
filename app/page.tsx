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
  RefreshCw,
  ClipboardList,
  Box,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RecordDetails } from '@/components/record-details';
import {
  AssetCards,
  WorkOrderCards,
  orderActions,
} from '@/components/record-links';
import { navigate, useWorkspaceRoute } from '@/components/workspace-route';
import {
  locationScope,
  routeHref,
  type WorkspaceRoute,
} from '@/lib/navigation';
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
import type { Location, LocationKind } from '@/lib/domain';
import { registerWorkOrderTools } from '@/lib/webmcp';
import { statuses, labels, type Snapshot, type WorkOrder } from '@/lib/domain';
const empty: Snapshot = { assets: [], workOrders: [], locations: [] };
type FormMode = 'asset' | 'work-order' | 'location' | WorkOrder | null;
export default function Home() {
  const [data, setData] = useState<Snapshot>(empty);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<FormMode>(null);
  const route = useWorkspaceRoute();
  const filter = route.status || 'all';
  const query = route.query || '';
  const tab = route.section;
  const [formDefaults, setFormDefaults] = useState<{
    assetId?: string;
    locationId?: string;
    parentId?: string;
  }>({});
  const contentRef = useRef<HTMLDivElement>(null);
  const previousView = useRef('work-orders/');
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
  function openLocation(parent?: Location) {
    pending.current = null;
    setError('');
    setFormDefaults({ parentId: parent?.id });
    setLocationKind(
      parent?.kind === 'site'
        ? 'building'
        : parent?.kind === 'building'
          ? 'area'
          : 'site',
    );
    setMode('location');
  }
  function openAsset(locationId?: string) {
    if (!locations.length) {
      openLocation();
      return;
    }
    pending.current = null;
    setError('');
    setFormDefaults({ locationId });
    setMode('asset');
  }
  function openWorkOrder(assetId?: string) {
    pending.current = null;
    setError('');
    setFormDefaults({ assetId });
    setMode('work-order');
  }
  function openTransition(order: WorkOrder) {
    pending.current = null;
    setError('');
    setMode(order);
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
        navigate({
          section: 'work-orders',
          query,
          status: status as WorkspaceRoute['status'],
        });
      }),
    [],
  );
  useEffect(() => {
    const key = route.section + '/' + (route.id || '');
    if (ready && previousView.current !== key) {
      contentRef.current?.focus();
      previousView.current = key;
    }
  }, [route.section, route.id, ready]);
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
      const result = (await response.json()) as { error?: string; id?: string };
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
      if (result.id && typeof mode === 'string')
        navigate({
          section:
            mode === 'asset'
              ? 'assets'
              : mode === 'location'
                ? 'locations'
                : 'work-orders',
          id: result.id,
        });
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
      (filter === 'all' ||
        (filter === 'open'
          ? !['completed', 'closed'].includes(w.status)
          : w.status === filter)) &&
      (!route.asset || w.assetId === route.asset) &&
      [w.title, w.assetTag, w.assignee || '']
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const selectedAsset = data.assets.find((asset) => asset.id === route.asset);
  const unavailableAsset = Boolean(
    (route.asset && !selectedAsset) ||
    (tab === 'assets' &&
      route.id &&
      !data.assets.some((asset) => asset.id === route.id)),
  );
  const selectedLocation = locations.find(
    (location) => location.id === route.location,
  );
  const scope = route.location
    ? locationScope(locations, route.location)
    : null;
  const visibleAssets = scope
    ? data.assets.filter(
        (asset) => asset.locationId && scope.has(asset.locationId),
      )
    : data.assets;
  const active = data.workOrders.filter(
    (w) => !['completed', 'closed'].includes(w.status),
  ).length;
  const next =
    typeof mode === 'object' && mode
      ? statuses[statuses.indexOf(mode.status) + 1]
      : undefined;
  return (
    <div className="app-shell">
      <header className="app-header">
        <a href={routeHref({ section: 'work-orders' })} className="brand">
          <span className="brand-icon">
            <Wrench size={23} />
          </span>
          <span>
            QueSuite <small>CMMS</small>
          </span>
        </a>
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
            disabled={!ready || !data.assets.length || unavailableAsset}
            onClick={() =>
              openWorkOrder(
                tab === 'assets' && route.id
                  ? data.assets.find((asset) => asset.id === route.id)?.id
                  : selectedAsset?.id,
              )
            }
          >
            <Plus /> New work order
          </Button>
        </div>
        <div className="metrics">
          <a href={routeHref({ section: 'work-orders', status: 'open' })}>
            <span>Open work orders</span>
            <strong>{ready ? active.toString().padStart(2, '0') : '—'}</strong>
            <ClipboardList />
            <span className="metric-hint">View open work →</span>
          </a>
          <a href={routeHref({ section: 'work-orders', status: 'completed' })}>
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
            <span className="metric-hint">Review completed work →</span>
          </a>
          <a href={routeHref({ section: 'assets' })}>
            <span>Registered assets</span>
            <strong>
              {ready ? data.assets.length.toString().padStart(2, '0') : '—'}
            </strong>
            <Box />
            <span className="metric-hint">Explore equipment →</span>
          </a>
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
        <div className="section-bar">
          <nav className="workspace-nav" aria-label="Workspace">
            {(['work-orders', 'assets', 'locations'] as const).map(
              (section) => (
                <a
                  key={section}
                  href={routeHref({ section })}
                  aria-current={tab === section ? 'page' : undefined}
                >
                  {
                    {
                      'work-orders': 'Work orders',
                      assets: 'Assets',
                      locations: 'Locations',
                    }[section]
                  }
                </a>
              ),
            )}
          </nav>
          <Button
            variant="ghost"
            onClick={() => {
              setError('');
              refresh().catch((e) => setError(String(e.message)));
            }}
          >
            <RefreshCw />
            Refresh
          </Button>
        </div>
        <div
          ref={contentRef}
          tabIndex={-1}
          className="workspace-content"
          aria-label={
            {
              'work-orders': 'Work orders',
              assets: 'Assets',
              locations: 'Locations',
            }[tab]
          }
        >
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
          ) : route.id ? (
            <RecordDetails
              route={route}
              data={data}
              onAsset={openAsset}
              onLocation={openLocation}
              onWorkOrder={openWorkOrder}
              onTransition={openTransition}
            />
          ) : tab === 'work-orders' ? (
            <section aria-label="Work-order list">
              {route.asset && (
                <div className="context-bar">
                  <span>
                    Work orders for{' '}
                    {selectedAsset ? (
                      <a
                        className="record-link"
                        href={routeHref({
                          section: 'assets',
                          id: selectedAsset.id,
                        })}
                      >
                        {selectedAsset.tag} · {selectedAsset.name}
                      </a>
                    ) : (
                      'an unavailable asset'
                    )}
                  </span>
                  <a
                    className="record-link"
                    href={routeHref({ section: 'work-orders' })}
                  >
                    Show all work orders
                  </a>
                </div>
              )}
              <div className="toolbar">
                <Input
                  aria-label="Search work orders"
                  placeholder="Search title, asset, or assignee…"
                  value={query}
                  onChange={(event) =>
                    navigate({ ...route, query: event.target.value }, true)
                  }
                />
                <Select
                  value={filter}
                  onValueChange={(value) =>
                    navigate(
                      {
                        ...route,
                        status: String(value) as WorkspaceRoute['status'],
                      },
                      true,
                    )
                  }
                  items={[
                    { value: 'all', label: 'All statuses' },
                    { value: 'open', label: 'Open work orders' },
                    ...statuses.map((value) => ({
                      value,
                      label: labels[value],
                    })),
                  ]}
                >
                  <SelectTrigger aria-label="Filter by status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="open">Open work orders</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {labels[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {visible.length ? (
                <WorkOrderCards
                  orders={visible}
                  onTransition={openTransition}
                />
              ) : (
                <div className="empty-state">
                  <ClipboardList />
                  <h2>
                    {query || filter !== 'all' || route.asset
                      ? 'No matching work orders'
                      : 'A clear start for your maintenance team'}
                  </h2>
                  <p>
                    {query || filter !== 'all'
                      ? 'Try a different search or status.'
                      : data.assets.length
                        ? 'Create a work order to record what needs attention.'
                        : locations.length
                          ? 'Register your first asset, then create its first work order.'
                          : 'Add your first location, then register the equipment there.'}
                  </p>
                  {(query || filter !== 'all') && (
                    <a
                      className="related-link"
                      href={routeHref({
                        section: 'work-orders',
                        asset: route.asset,
                      })}
                    >
                      Clear search and status
                    </a>
                  )}
                  {data.assets.length ? (
                    <Button
                      disabled={unavailableAsset}
                      onClick={() => openWorkOrder(selectedAsset?.id)}
                    >
                      <Plus />
                      New work order
                    </Button>
                  ) : (
                    <Button onClick={() => openAsset()}>
                      <Plus />
                      {locations.length
                        ? 'Add your first asset'
                        : 'Add your first location'}
                    </Button>
                  )}
                </div>
              )}
            </section>
          ) : tab === 'assets' ? (
            <section aria-label="Asset list">
              {route.location && (
                <div className="context-bar">
                  <span>
                    Equipment within{' '}
                    {selectedLocation ? (
                      <a
                        className="record-link"
                        href={routeHref({
                          section: 'locations',
                          id: selectedLocation.id,
                        })}
                      >
                        {selectedLocation.path}
                      </a>
                    ) : (
                      'an unavailable location'
                    )}{' '}
                    (including child locations)
                  </span>
                  <a
                    className="record-link"
                    href={routeHref({ section: 'assets' })}
                  >
                    Show all assets
                  </a>
                </div>
              )}
              <div className="toolbar">
                <p className="muted">The equipment your team maintains.</p>
                <Button
                  disabled={Boolean(route.location && !selectedLocation)}
                  onClick={() => openAsset(selectedLocation?.id)}
                >
                  <Plus />
                  {locations.length ? 'Add asset' : 'Add location'}
                </Button>
              </div>
              {visibleAssets.length ? (
                <AssetCards
                  assets={visibleAssets}
                  workOrders={data.workOrders}
                />
              ) : (
                <div className="empty-state">
                  <Box />
                  <h2>
                    {route.location
                      ? 'No assets within this location'
                      : 'No assets registered yet'}
                  </h2>
                  <p>Add an asset with its tag and service location.</p>
                </div>
              )}
            </section>
          ) : (
            <LocationList
              locations={locations}
              assets={data.assets}
              ready={ready}
              onAdd={() => openLocation()}
            />
          )}
        </div>
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
                    ? orderActions[mode.status]
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
                parentId={formDefaults.parentId}
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
                  initial={formDefaults.locationId}
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
                  initial={formDefaults.assetId}
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
