'use client';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  labels,
  type Location,
  type Snapshot,
  type WorkOrder,
} from '@/lib/domain';
import {
  locationScope,
  routeHref,
  type WorkspaceRoute,
} from '@/lib/navigation';
import {
  AssetCards,
  LocationBreadcrumbs,
  WorkOrderCards,
  orderActions,
} from '@/components/record-links';
import { locationLabels } from '@/components/location-manager';

export function RecordDetails({
  route,
  data,
  onAsset,
  onLocation,
  onWorkOrder,
  onTransition,
}: {
  route: WorkspaceRoute;
  data: Snapshot;
  onAsset: (locationId?: string) => void;
  onLocation: (parent?: Location) => void;
  onWorkOrder: (assetId?: string) => void;
  onTransition: (order: WorkOrder) => void;
}) {
  const asset =
    route.section === 'assets'
      ? data.assets.find((record) => record.id === route.id)
      : undefined;
  const location =
    route.section === 'locations'
      ? data.locations.find((record) => record.id === route.id)
      : undefined;
  const order =
    route.section === 'work-orders'
      ? data.workOrders.find((record) => record.id === route.id)
      : undefined;
  const sectionLabel = {
    assets: 'Assets',
    locations: 'Locations',
    'work-orders': 'Work orders',
  }[route.section];
  return (
    <section className="record-detail">
      <a className="related-link" href={routeHref({ section: route.section })}>
        <ArrowLeft size={16} />
        All {sectionLabel.toLowerCase()}
      </a>
      {!asset && !location && !order ? (
        <div className="empty-state">
          <h2>Record not found</h2>
          <p>
            This record is unavailable in this workspace. Return to the list or
            try Refresh.
          </p>
        </div>
      ) : null}
      {asset && (
        <>
          {asset.locationId && (
            <LocationBreadcrumbs
              locations={data.locations}
              id={asset.locationId}
            />
          )}
          <div className="detail-heading">
            <div>
              <p className="eyebrow">Asset · {asset.tag}</p>
              <h2>{asset.name}</h2>
              <p className="muted">{asset.location}</p>
            </div>
            <Button onClick={() => onWorkOrder(asset.id)}>
              <Plus />
              New work order
            </Button>
          </div>
          <div className="toolbar">
            <h3>Work orders for {asset.tag}</h3>
            <a
              className="record-link"
              href={routeHref({ section: 'work-orders', asset: asset.id })}
            >
              Open filtered list <ArrowRight size={16} />
            </a>
          </div>
          {data.workOrders.some((record) => record.assetId === asset.id) ? (
            <WorkOrderCards
              orders={data.workOrders.filter(
                (record) => record.assetId === asset.id,
              )}
              onTransition={onTransition}
            />
          ) : (
            <div className="empty-state">
              <h2>No work orders for this asset</h2>
              <p>
                Create its first work order when this equipment needs attention.
              </p>
              <Button onClick={() => onWorkOrder(asset.id)}>
                <Plus />
                New work order
              </Button>
            </div>
          )}
        </>
      )}
      {location &&
        (() => {
          const scope = locationScope(data.locations, location.id);
          const assets = data.assets.filter(
            (record) => record.locationId && scope.has(record.locationId),
          );
          const children = data.locations.filter(
            (record) => record.parentId === location.id,
          );
          return (
            <>
              <LocationBreadcrumbs
                locations={data.locations}
                id={location.id}
              />
              <div className="detail-heading">
                <div>
                  <p className="eyebrow">{locationLabels[location.kind]}</p>
                  <h2>{location.name}</h2>
                  <p className="muted">{location.path}</p>
                </div>
                <div className="detail-actions">
                  {location.kind !== 'area' && (
                    <Button
                      variant="outline"
                      onClick={() => onLocation(location)}
                    >
                      <Plus />
                      Add {location.kind === 'site' ? 'building' : 'work area'}
                    </Button>
                  )}
                  <Button onClick={() => onAsset(location.id)}>
                    <Plus />
                    Add asset here
                  </Button>
                </div>
              </div>
              {location.kind !== 'area' && (
                <section className="related-section">
                  <h3>
                    {location.kind === 'site' ? 'Buildings' : 'Work areas'}
                  </h3>
                  {children.length ? (
                    <ul className="child-locations">
                      {children.map((child) => (
                        <li key={child.id}>
                          <a
                            href={routeHref({
                              section: 'locations',
                              id: child.id,
                            })}
                          >
                            {child.name}
                            <ArrowRight size={18} />
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted">
                      No {location.kind === 'site' ? 'buildings' : 'work areas'}{' '}
                      added yet.
                    </p>
                  )}
                </section>
              )}
              <div className="toolbar">
                <div>
                  <h3>Equipment within this location</h3>
                  <p className="muted">
                    Includes assets in any buildings and work areas below it.
                  </p>
                </div>
                <a
                  className="record-link"
                  href={routeHref({ section: 'assets', location: location.id })}
                >
                  {assets.length} {assets.length === 1 ? 'asset' : 'assets'}{' '}
                  <ArrowRight size={16} />
                </a>
              </div>
              {assets.length ? (
                <AssetCards assets={assets} workOrders={data.workOrders} />
              ) : (
                <div className="empty-state">
                  <h2>No equipment registered here</h2>
                  <p>Add an asset at this location or one of its work areas.</p>
                  <Button onClick={() => onAsset(location.id)}>
                    <Plus />
                    Add asset here
                  </Button>
                </div>
              )}
            </>
          );
        })()}
      {order && (
        <>
          <div className="detail-heading">
            <div>
              <p className="eyebrow">Work order</p>
              <h2>{order.title}</h2>
              <a
                className="related-link"
                href={routeHref({ section: 'assets', id: order.assetId })}
              >
                Asset {order.assetTag}
                <ArrowRight size={16} />
              </a>
            </div>
            {order.status !== 'closed' && (
              <Button onClick={() => onTransition(order)}>
                {orderActions[order.status]}
                <ArrowRight />
              </Button>
            )}
          </div>
          <dl className="record-facts">
            <div>
              <dt>Status</dt>
              <dd>
                <a
                  className={'badge ' + order.status}
                  href={routeHref({
                    section: 'work-orders',
                    status: order.status,
                  })}
                >
                  {labels[order.status]}
                </a>
              </dd>
            </div>
            <div>
              <dt>Priority</dt>
              <dd className="priority-text">{order.priority}</dd>
            </div>
            <div>
              <dt>Assigned technician</dt>
              <dd>{order.assignee || 'Unassigned'}</dd>
            </div>
            <div>
              <dt>Work type</dt>
              <dd className="priority-text">{order.type}</dd>
            </div>
            <div className="wide-fact">
              <dt>Service location when requested</dt>
              <dd>{order.serviceLocation}</dd>
            </div>
          </dl>
          <section className="related-section">
            <h3>Request</h3>
            <p className="record-text">
              {order.description || 'No additional description.'}
            </p>
          </section>
          {order.completionNote && (
            <section className="related-section completion">
              <h3>Completion note</h3>
              <p className="record-text">{order.completionNote}</p>
            </section>
          )}
          <a
            className="related-link"
            href={routeHref({ section: 'work-orders', asset: order.assetId })}
          >
            All work orders for {order.assetTag}
            <ArrowRight size={16} />
          </a>
        </>
      )}
    </section>
  );
}
