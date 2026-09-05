'use client';
import { ArrowRight, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  labels,
  type Asset,
  type Location,
  type WorkOrder,
  type Status,
} from '@/lib/domain';
import { locationTrail, routeHref } from '@/lib/navigation';

export const orderActions: Record<Status, string> = {
  requested: 'Assign work',
  assigned: 'Start work',
  in_progress: 'Complete work',
  completed: 'Close work order',
  closed: 'Closed',
};
export function LocationBreadcrumbs({
  locations,
  id,
}: {
  locations: Location[];
  id: string;
}) {
  return (
    <nav aria-label="Location hierarchy" className="breadcrumbs">
      <ol>
        <li>
          <a href={routeHref({ section: 'locations' })}>Locations</a>
        </li>
        {locationTrail(locations, id).map((location) => (
          <li key={location.id}>
            <a href={routeHref({ section: 'locations', id: location.id })}>
              {location.name}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
export function AssetCards({
  assets,
  workOrders,
}: {
  assets: Asset[];
  workOrders: WorkOrder[];
}) {
  return (
    <ul className="asset-grid">
      {assets.map((asset) => {
        const count = workOrders.filter(
          (order) => order.assetId === asset.id,
        ).length;
        return (
          <li key={asset.id}>
            <a
              className="asset-tag record-link"
              href={routeHref({ section: 'assets', id: asset.id })}
            >
              <Box size={18} />
              {asset.tag}
            </a>
            <h2>
              <a
                className="record-link"
                href={routeHref({ section: 'assets', id: asset.id })}
              >
                {asset.name}
              </a>
            </h2>
            <p>
              {asset.locationId ? (
                <a
                  className="record-link"
                  href={routeHref({
                    section: 'locations',
                    id: asset.locationId,
                  })}
                >
                  {asset.location}
                </a>
              ) : (
                asset.location
              )}
            </p>
            <a
              className="related-link"
              href={routeHref({ section: 'work-orders', asset: asset.id })}
            >
              {count} work {count === 1 ? 'order' : 'orders'}{' '}
              <ArrowRight size={16} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
export function WorkOrderCards({
  orders,
  onTransition,
}: {
  orders: WorkOrder[];
  onTransition: (order: WorkOrder) => void;
}) {
  return (
    <ul className="orders">
      {orders.map((order) => (
        <li key={order.id} className="order">
          <div className={'priority-mark ' + order.priority} />
          <div className="order-main">
            <div className="order-meta">
              <a
                className="record-link"
                href={routeHref({ section: 'assets', id: order.assetId })}
              >
                {order.assetTag}
              </a>
              <a
                className={'badge ' + order.status}
                href={routeHref({
                  section: 'work-orders',
                  status: order.status,
                })}
              >
                {labels[order.status]}
              </a>
              <span className="priority-text">{order.priority} priority</span>
            </div>
            <h2>
              <a
                className="record-link"
                href={routeHref({ section: 'work-orders', id: order.id })}
              >
                {order.title}
              </a>
            </h2>
            <p>
              {order.serviceLocation} · {order.assignee || 'Unassigned'} ·{' '}
              {order.type}
            </p>
            {order.description && (
              <p className="order-description">{order.description}</p>
            )}
            {order.completionNote && (
              <p className="completion">
                <strong>Completion note:</strong> {order.completionNote}
              </p>
            )}
          </div>
          {order.status !== 'closed' && (
            <Button variant="outline" onClick={() => onTransition(order)}>
              {orderActions[order.status]}
              <ArrowRight />
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
