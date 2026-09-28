import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EditTenantDialog } from "@/components/EditTenantDialog";
import { DeleteTenantDialog } from "@/components/DeleteTenantDialog";
import { listLeases, listTenants } from "@/lib/data";
import { formatPhone } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";

export default async function TenantsPage() {
  const [{ t }, tenants, leases] = await Promise.all([getI18n(), listTenants(), listLeases()]);
  const activeIds = new Set(leases.filter((lease) => lease.status === "ACTIVE").map((lease) => lease.tenantId));
  const f = t.tenants.fields;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{t.tenants.title}</h1>
        <Button asChild>
          <Link href="/tenants/new">
            <Plus className="mr-2 h-4 w-4" aria-hidden /> {t.tenants.add}
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{f.name}</TableHead>
              <TableHead>{f.dni}</TableHead>
              <TableHead>{f.phone}</TableHead>
              <TableHead>{f.address}</TableHead>
              <TableHead>{t.common.status}</TableHead>
              <TableHead className="text-right">{t.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((tenant) => {
              const isActive = activeIds.has(tenant.id);
              return (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">{tenant.name}</TableCell>
                  <TableCell>{tenant.dni}</TableCell>
                  <TableCell>{formatPhone(tenant.phone)}</TableCell>
                  <TableCell>{tenant.address}</TableCell>
                  <TableCell>
                    <Badge variant={isActive ? "default" : "secondary"}>
                      {isActive ? t.tenants.active : t.tenants.inactive}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <EditTenantDialog tenant={tenant} />
                      <DeleteTenantDialog tenantId={tenant.id} tenantName={tenant.name} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {tenants.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  {t.tenants.empty}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
