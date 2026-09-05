import { statuses } from './domain';
interface ModelContext {
  registerTool(
    tool: {
      name: string;
      description: string;
      inputSchema: object;
      annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
      execute(input: unknown): unknown;
    },
    options: { signal: AbortSignal },
  ): void | Promise<void>;
}
export function registerWorkOrderTools(
  apply: (query: string, status: string) => void,
) {
  const context = (document as Document & { modelContext?: ModelContext })
    .modelContext;
  if (!context?.registerTool) return;
  const lifecycle = new AbortController();
  try {
    Promise.resolve(
      context.registerTool(
        {
          name: 'filter_work_orders',
          description:
            'Filter the visible work-order list by title, asset tag, assignee, or status. Does not change saved records.',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', maxLength: 160 },
              status: { type: 'string', enum: ['all', ...statuses] },
            },
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: true },
          execute(input: unknown) {
            if (!input || typeof input !== 'object' || Array.isArray(input))
              throw new Error('An object is required.');
            const values = input as Record<string, unknown>;
            if (
              Object.keys(values).some((k) => !['query', 'status'].includes(k))
            )
              throw new Error('Unknown filter field.');
            const query = values.query ?? '',
              status = values.status ?? 'all';
            if (
              typeof query !== 'string' ||
              query.length > 160 ||
              typeof status !== 'string' ||
              !['all', ...statuses].includes(status)
            )
              throw new Error('Invalid query or status.');
            apply(query, status);
            return { query, status };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch((error) =>
      console.warn('Work-order tool registration failed', error),
    );
  } catch (error) {
    console.warn('Work-order tool registration unavailable', error);
  }
  return () => lifecycle.abort();
}
