import { DomainError } from '../domain';
export function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
export async function readBody(
  request: Request,
): Promise<Record<string, unknown>> {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin)
    throw new DomainError('Cross-origin writes are not allowed.', 403);
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    throw new DomainError('Use application/json.', 415);
  const text = await request.text();
  if (text.length > 16000) throw new DomainError('Request is too large.', 413);
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new DomainError('Invalid JSON.', 400);
  }
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new DomainError('A JSON object is required.', 400);
  return value as Record<string, unknown>;
}
export async function handle(action: () => Promise<unknown>) {
  try {
    return json(await action());
  } catch (error) {
    if (error instanceof DomainError)
      return json({ error: error.message }, error.status);
    console.error('CMMS request failed', error);
    return json(
      { error: 'The server could not complete this request. Try again.' },
      500,
    );
  }
}
