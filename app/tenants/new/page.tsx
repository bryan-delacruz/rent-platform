import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTenant } from "@/lib/actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewTenantPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/tenants">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Agregar Nuevo Arrendatario</h2>
      </div>

      <form action={createTenant} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre Completo</Label>
          <Input id="name" name="name" placeholder="Juan Pérez" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dni">DNI</Label>
            <Input id="dni" name="dni" placeholder="12345678" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" name="phone" placeholder="+51 999 999 999" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="juan@ejemplo.com" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Dirección</Label>
          <Input id="address" name="address" placeholder="Dirección personal" required />
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/tenants">
            <Button variant="outline" type="button">Cancelar</Button>
          </Link>
          <Button type="submit">Crear Arrendatario</Button>
        </div>
      </form>
    </div>
  );
}
