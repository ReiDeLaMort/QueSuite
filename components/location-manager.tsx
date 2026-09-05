'use client';
import { MapPin, Building2, Layers, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Choice } from '@/components/form-choice';
import type { Location, LocationKind, Asset } from '@/lib/domain';

export const locationLabels = {
  site: 'Site',
  building: 'Building',
  area: 'Work area',
};
export function LocationFields({
  kind,
  onKindChange,
  locations,
}: {
  kind: LocationKind;
  onKindChange: (kind: LocationKind) => void;
  locations: Location[];
}) {
  const parentKind = kind === 'building' ? 'site' : 'building';
  const parents = locations.filter((l) => l.kind === parentKind);
  return (
    <>
      <Choice
        name="kind"
        title="Location type"
        value={kind}
        onValueChange={(value) => onKindChange(value as LocationKind)}
        items={Object.entries(locationLabels).map(([value, label]) => ({
          value,
          label,
        }))}
      />
      {kind !== 'site' &&
        (parents.length ? (
          <Choice
            key={kind}
            name="parentId"
            title={kind === 'building' ? 'Site' : 'Building'}
            items={parents.map((l) => ({ value: l.id, label: l.path }))}
          />
        ) : (
          <p className="notice">
            Create a {parentKind} before adding this location.
          </p>
        ))}
      <label className="field" htmlFor="location-name">
        Location name
        <Input
          id="location-name"
          name="name"
          required
          maxLength={50}
          placeholder={
            kind === 'site'
              ? 'e.g. Main plant'
              : kind === 'building'
                ? 'e.g. Production building'
                : 'e.g. Assembly line 1'
          }
        />
      </label>
      <p className="muted">Site → Building → Work area</p>
    </>
  );
}
export function LocationList({
  locations,
  assets,
  ready,
  onAdd,
}: {
  locations: Location[];
  assets: Asset[];
  ready: boolean;
  onAdd: () => void;
}) {
  const icons = { site: MapPin, building: Building2, area: Layers };
  return (
    <>
      <div className="toolbar">
        <p className="muted">
          Organize equipment by site, building, and work area.
        </p>
        <Button onClick={onAdd} disabled={!ready}>
          <Plus /> Add location
        </Button>
      </div>
      {!ready ? (
        <div className="empty-state">
          <MapPin />
          <h2>Loading locations…</h2>
        </div>
      ) : locations.length ? (
        <ul className="location-list">
          {locations.map((location) => {
            const Icon = icons[location.kind];
            const count = assets.filter(
              (a) => a.locationId === location.id,
            ).length;
            return (
              <li key={location.id} className={'location-row ' + location.kind}>
                <Icon aria-hidden="true" />
                <div>
                  <span className="location-kind">
                    {locationLabels[location.kind]}
                  </span>
                  <h2>{location.name}</h2>
                  <p>{location.path}</p>
                </div>
                <span className="location-count">
                  {count} {count === 1 ? 'asset' : 'assets'} here
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="empty-state">
          <MapPin />
          <h2>Start with your first site</h2>
          <p>
            Add a site, then its buildings and the areas where work happens.
          </p>
          <Button onClick={onAdd}>
            <Plus /> Add site
          </Button>
        </div>
      )}
    </>
  );
}
