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
import { getTenants, getLeases } from "@/lib/db";
import { formatPhone } from "@/lib/utils";
import Link from "next/link";
import { Plus } from "lucide-react";
import { EditTenantDialog } from "@/components/EditTenantDialog";
import { DeleteTenantDialog } from "@/components/DeleteTenantDialog";

export default async function TenantsPage() {
  const tenants = await getTenants();
  const leases = await getLeases();

  // Determine active status for each tenant
  const activeTenantIds = new Set(
    leases
      .filter(l => l.status === 'ACTIVE')
      .map(l => l.tenantId)
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Arrendatarios</h2>
        <Link href="/tenants/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Agregar Arrendatario
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((tenant) => {
              const isActive = activeTenantIds.has(tenant.id);
              return (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">{tenant.name}</TableCell>
                  <TableCell>{tenant.dni || '-'}</TableCell>
                  <TableCell>{formatPhone(tenant.phone)}</TableCell>
                  <TableCell>{tenant.address || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={isActive ? 'default' : 'secondary'}>
                      {isActive ? 'Activo' : 'Inactivo'}
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
                <TableCell colSpan={6} className="h-24 text-center">
                  No se encontraron arrendatarios.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
