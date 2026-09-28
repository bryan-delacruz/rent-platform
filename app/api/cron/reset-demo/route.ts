import { resetDemoData } from '@/lib/demo-data';
import { isAuthorizedCron } from '@/lib/cron';
import { prisma } from '@/lib/prisma';

/** Daily: restores the demo account, so a visitor never finds it broken. */
export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const ownerId = process.env.DEMO_USER_ID;
  if (!ownerId) {
    return Response.json({ error: 'DEMO_USER_ID is not set' }, { status: 500 });
  }
  await resetDemoData(prisma, ownerId);
  return Response.json({ reset: true });
}
