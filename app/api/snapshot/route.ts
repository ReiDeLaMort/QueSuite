import { getDb } from '@/db';
import { snapshot } from '@/lib/server/repository';
import { handle } from '@/lib/server/http';
export function GET() {
  return handle(() => snapshot(getDb()));
}
