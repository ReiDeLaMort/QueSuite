import { getDb } from '@/db';
import { command } from '@/lib/server/repository';
import { handle, readBody } from '@/lib/server/http';
export function POST(request: Request) {
  return handle(async () => command(getDb(), await readBody(request)));
}
