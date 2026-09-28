import { generateMonthlyCharges } from '@/lib/charges';
import { isAuthorizedCron } from '@/lib/cron';

/** Daily: creates this month's charge for every active lease. Idempotent. */
export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const result = await generateMonthlyCharges();
  return Response.json(result);
}
