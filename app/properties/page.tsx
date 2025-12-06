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
import { getProperties, getLeases } from "@/lib/db";
import { deletePropertyAction } from "@/lib/actions";
import { formatMoney, asCurrency } from "@/lib/utils";
import Link from "next/link";
import { Plus } from "lucide-react";
import { EditPropertyDialog } from "@/components/EditPropertyDialog";
import { DeletePropertyDialog } from "@/components/DeletePropertyDialog";

export default async function PropertiesPage() {
  const properties = await getProperties();
  const leases = await getLeases();

  const activeLeasePropertyIds = new Set(
    leases
      .filter(l => l.status === 'ACTIVE')
      .map(l => l.propertyId)
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Propiedades</h2>
        <Link href="/properties/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Nueva Propiedad
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Piso</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((property) => {
              const isOccupied = activeLeasePropertyIds.has(property.id);
              // If occupied by lease, show Occupied. Otherwise use stored status (Available/Maintenance)
              const displayStatus = isOccupied ? 'OCCUPIED' : property.status;

              return (
                <TableRow key={property.id}>
                  <TableCell className="font-medium">{property.name}</TableCell>
                  <TableCell>{property.type === 'ROOM' ? 'Cuarto' : 'Local Comercial'}</TableCell>
                  <TableCell>{property.location || '-'}</TableCell>
                  <TableCell>{property.floor || '-'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        displayStatus === 'OCCUPIED' ? 'default' :
                          displayStatus === 'AVAILABLE' ? 'success' : 'warning'
                      }
                    >
                      {displayStatus === 'AVAILABLE' ? 'Disponible' :
                        displayStatus === 'OCCUPIED' ? 'Ocupado' : 'Mantenimiento'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatMoney(property.price, asCurrency(property.currency))}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <EditPropertyDialog property={property} isOccupied={isOccupied} />
                      <DeletePropertyDialog propertyId={property.id} propertyName={property.name} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {properties.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No se encontraron propiedades.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
