'use client';
import { useSyncExternalStore } from 'react';
import { parseRoute, routeHref, type WorkspaceRoute } from '@/lib/navigation';

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}
const getSnapshot = () => window.location.hash;
const getServerSnapshot = () => '';
export function useWorkspaceRoute() {
  return parseRoute(
    useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot),
  );
}
export function navigate(route: WorkspaceRoute, replace = false) {
  const href = routeHref(route);
  if (replace) {
    window.history.replaceState(window.history.state, '', href);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else window.location.hash = href;
}
