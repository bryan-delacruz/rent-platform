import Link from "next/link";
import { History, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EditLeaseDialog } from "@/components/EditLeaseDialog";
import { TerminateLeaseDialog } from "@/components/TerminateLeaseDialog";
import { LeaseStatusBadge } from "@/components/StatusBadge";
import { listLeases, listProperties, listTenants } from "@/lib/data";
import { formatDate, formatMoney } from "@/lib/format";
import { interpolate } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n/server";

export default async function LeasesPage() {
  const [{ locale, t }, leases, properties, tenants] = await Promise.all([
    getI18n(),
    listLeases(),
    listProperties(),
    listTenants(),
  ]);
  const propertyById = new Map(properties.map((property) => [property.id, property]));
  const tenantById = new Map(tenants.map((tenant) => [tenant.id, tenant]));
  const date = (value: string) => formatDate(value, locale);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{t.leases.title}</h1>
        <Button asChild>
          <Link href="/leases/new">
            <Plus className="mr-2 h-4 w-4" aria-hidden /> {t.leases.add}
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.leases.property}</TableHead>
              <TableHead>{t.leases.tenant}</TableHead>
              <TableHead>{t.leases.duration}</TableHead>
              <TableHead>{t.leases.rent}</TableHead>
              <TableHead>{t.common.status}</TableHead>
              <TableHead className="text-right">{t.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leases.map((lease) => {
              const property = propertyById.get(lease.propertyId);
              return (
                <TableRow key={lease.id}>
                  <TableCell className="font-medium">{property?.name ?? t.common.unknown}</TableCell>
                  <TableCell>{tenantById.get(lease.tenantId)?.name ?? t.common.unknown}</TableCell>
                  <TableCell>
                    {interpolate(t.leases.range, { start: date(lease.startDate), end: date(lease.endDate) })}
                    {lease.status === "TERMINATED" && lease.terminationDate && (
                      <div className="text-xs text-muted-foreground">
                        {interpolate(t.leases.terminatedOn, { date: date(lease.terminationDate) })}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{formatMoney(lease.monthlyRent, lease.currency, locale)}</TableCell>
                  <TableCell>
                    <LeaseStatusBadge status={lease.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" asChild>
                        <Link href={`/leases/${lease.id}`} aria-label={t.leases.history} title={t.leases.history}>
                          <History className="h-4 w-4" />
                        </Link>
                      </Button>
                      <EditLeaseDialog lease={lease} property={property} />
                      {lease.status === "ACTIVE" && <TerminateLeaseDialog leaseId={lease.id} />}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {leases.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  {t.leases.empty}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
