import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewLeaseForm } from "@/components/NewLeaseForm";
import { listProperties, listTenants } from "@/lib/data";
import { getI18n } from "@/lib/i18n/server";

export default async function NewLeasePage() {
  const [{ t }, properties, tenants] = await Promise.all([getI18n(), listProperties(), listTenants()]);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/leases" aria-label={t.common.back}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{t.leases.newTitle}</h1>
      </div>
      <NewLeaseForm properties={properties} tenants={tenants} />
    </div>
  );
}
