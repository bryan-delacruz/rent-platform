import DashboardClient from "@/components/DashboardClient";
import { todayISO } from "@/lib/billing";
import { getPortfolio } from "@/lib/data";

export default async function DashboardPage() {
  // Charges are created by the daily cron and the "generate" button, never on render.
  const { properties, tenants, leases, payments } = await getPortfolio();

  return (
    <DashboardClient
      properties={properties}
      leases={leases}
      payments={payments}
      tenants={tenants}
      today={todayISO()}
    />
  );
}
