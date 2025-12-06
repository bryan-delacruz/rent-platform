import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getLeases, getProperties, getTenants } from "@/lib/db";
import { terminateLeaseAction } from "@/lib/actions";
import { formatMoney, asCurrency } from "@/lib/utils";
import Link from "next/link";
import { Plus, History } from "lucide-react";
import { EditLeaseDialog } from "@/components/EditLeaseDialog";
import { TerminateLeaseDialog } from "@/components/TerminateLeaseDialog";

export default async function LeasesPage() {
  const leases = await getLeases();
  const properties = await getProperties();
  const tenants = await getTenants();

  const propertyMap = new Map(properties.map(p => [p.id, p]));
  const tenantMap = new Map(tenants.map(t => [t.id, t]));

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Contratos</h2>
        <Link href="/leases/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Contrato
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Propiedad</TableHead>
              <TableHead>Inquilino</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Renta</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leases.map((lease) => {
              const property = propertyMap.get(lease.propertyId);
              const tenant = tenantMap.get(lease.tenantId);
              const currencySymbol = lease.currency === 'USD' ? '$' : 'S/.';

              let status = 'ACTIVE';
              if (lease.status === 'TERMINATED') {
                status = 'TERMINATED';
              } else if (today > lease.endDate) {
                status = 'EXPIRED';
              }

              return (
                <TableRow key={lease.id}>
                  <TableCell className="font-medium">{property?.name || 'Desconocido'}</TableCell>
                  <TableCell>{tenant?.name || 'Desconocido'}</TableCell>
                  <TableCell>
                    {lease.startDate} a {lease.endDate}
                    {status === 'TERMINATED' && lease.terminationDate && (
                      <div className="text-xs text-muted-foreground">
                        Terminado el: {lease.terminationDate}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{formatMoney(lease.monthlyRent, asCurrency(lease.currency))}</TableCell>
                  <TableCell>
                    <Badge variant={
                      status === 'ACTIVE' ? 'default' :
                        status === 'TERMINATED' ? 'destructive' : 'secondary'
                    }>
                      {status === 'ACTIVE' ? 'Activo' :
                        status === 'TERMINATED' ? 'Terminado' : 'Expirado'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/leases/${lease.id}`}>
                        <Button size="icon" variant="ghost" title="Ver Historial">
                          <History className="h-4 w-4" />
                        </Button>
                      </Link>
                      <EditLeaseDialog lease={lease} property={property} />
                      {status === 'ACTIVE' && (
                        <TerminateLeaseDialog leaseId={lease.id} />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {leases.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No se encontraron contratos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
