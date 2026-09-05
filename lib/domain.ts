export const statuses = [
  'requested',
  'assigned',
  'in_progress',
  'completed',
  'closed',
] as const;
export type Status = (typeof statuses)[number];
export const labels: Record<Status, string> = {
  requested: 'Requested',
  assigned: 'Assigned',
  in_progress: 'In progress',
  completed: 'Completed',
  closed: 'Closed',
};
export interface Asset {
  id: string;
  organizationId: string;
  tag: string;
  name: string;
  location: string;
  createdAt: string;
}
export interface WorkOrder {
  id: string;
  organizationId: string;
  assetId: string;
  assetTag: string;
  serviceLocation: string;
  title: string;
  description: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  type: 'corrective' | 'preventive' | 'inspection';
  status: Status;
  assignee: string | null;
  completionNote: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}
export interface Snapshot {
  assets: Asset[];
  workOrders: WorkOrder[];
}
export class DomainError extends Error {
  status: number;
  constructor(message: string, status = 422) {
    super(message);
    this.status = status;
  }
}
export function field(
  value: unknown,
  name: string,
  max: number,
  optional = false,
): string {
  if (
    typeof value !== 'string' ||
    value.trim().length > max ||
    (!optional && !value.trim())
  )
    throw new DomainError(
      name +
        ' must contain ' +
        (optional ? '0' : '1') +
        '–' +
        max +
        ' characters.',
    );
  return value.trim();
}
export function uuid(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  )
    throw new DomainError('A valid UUID is required.');
  return value;
}
export function choice<T extends string>(
  value: unknown,
  choices: readonly T[],
  name: string,
): T {
  if (typeof value !== 'string' || !choices.includes(value as T))
    throw new DomainError('Invalid ' + name + '.');
  return value as T;
}
export function validateTransition(
  current: Status,
  next: Status,
  body: Record<string, unknown>,
) {
  if (
    current === 'closed' ||
    statuses.indexOf(next) !== statuses.indexOf(current) + 1
  )
    throw new DomainError(
      'Cannot move from ' + labels[current] + ' to ' + labels[next] + '.',
    );
  if (next === 'assigned') field(body.assignee, 'Assigned technician', 120);
  if (next === 'completed') field(body.completionNote, 'Completion note', 2000);
}
