import { getDb } from '@/db';
import { addLocation } from '@/lib/server/locations';
import { handle, readBody } from '@/lib/server/http';
export function POST(request: Request) {
  return handle(async () => addLocation(getDb(), await readBody(request)));
}
