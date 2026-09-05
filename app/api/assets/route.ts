import { getDb } from '@/db';
import { addAsset } from '@/lib/server/repository';
import { handle, readBody } from '@/lib/server/http';
export function POST(request: Request) {
  return handle(async () => addAsset(getDb(), await readBody(request)));
}
