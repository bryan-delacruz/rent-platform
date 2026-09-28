import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EditPropertyDialog } from "@/components/EditPropertyDialog";
import { DeletePropertyDialog } from "@/components/DeletePropertyDialog";
import { PropertyStatusBadge } from "@/components/StatusBadge";
import { listLeases, listProperties } from "@/lib/data";
import { formatMoney } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";

export default async function PropertiesPage() {
  const [{ locale, t }, properties, leases] = await Promise.all([getI18n(), listProperties(), listLeases()]);
  const occupiedIds = new Set(leases.filter((lease) => lease.status === "ACTIVE").map((lease) => lease.propertyId));
  const f = t.properties.fields;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{t.properties.title}</h1>
        <Button asChild>
          <Link href="/properties/new">
            <Plus className="mr-2 h-4 w-4" aria-hidden /> {t.properties.add}
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{f.name}</TableHead>
              <TableHead>{f.type}</TableHead>
              <TableHead>{f.location}</TableHead>
              <TableHead>{f.floor}</TableHead>
              <TableHead>{f.status}</TableHead>
              <TableHead>{f.price}</TableHead>
              <TableHead className="text-right">{t.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((property) => {
              const isOccupied = occupiedIds.has(property.id);
              return (
                <TableRow key={property.id}>
                  <TableCell className="font-medium">{property.name}</TableCell>
                  <TableCell>{t.propertyType[property.type]}</TableCell>
                  <TableCell>{property.location}</TableCell>
                  <TableCell>{property.floor}</TableCell>
                  <TableCell>
                    <PropertyStatusBadge status={isOccupied ? "OCCUPIED" : property.status} />
                  </TableCell>
                  <TableCell>{formatMoney(property.price, property.currency, locale)}</TableCell>
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
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  {t.properties.empty}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
