import { getProperties, getTenants } from "@/lib/db";
import NewLeaseForm from "@/components/NewLeaseForm";

export default async function NewLeasePage() {
  const properties = await getProperties();
  const tenants = await getTenants();

  return <NewLeaseForm properties={properties} tenants={tenants} />;
}
