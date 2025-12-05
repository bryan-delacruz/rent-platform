import { readDb, getProperties, getLeases, getPayments, getTenants } from "@/lib/db";
import { generateMonthlyPayments } from "@/lib/actions";
import DashboardClient from "@/components/DashboardClient";

export default async function Home() {
  // Check and generate payments on load
  await generateMonthlyPayments(false);

  const properties = await getProperties();
  const leases = await getLeases();
  const payments = await getPayments();
  const tenants = await getTenants();

  return (
    <DashboardClient
      properties={properties}
      leases={leases}
      payments={payments}
      tenants={tenants}
    />
  );
}
