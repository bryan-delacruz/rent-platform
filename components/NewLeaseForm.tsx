'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createLease } from "@/lib/actions";
import { Property, Tenant } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function NewLeasePage({ properties, tenants }: { properties: Property[], tenants: Tenant[] }) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");

  const availableProperties = properties.filter(p => p.status === 'AVAILABLE');
  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  const isCommercial = selectedProperty?.type === 'COMMERCIAL';

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/leases">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Nuevo Contrato de Alquiler</h2>
      </div>

      <form action={createLease} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="propertyId">Propiedad</Label>
          <Select name="propertyId" required onValueChange={setSelectedPropertyId}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar propiedad" />
            </SelectTrigger>
            <SelectContent>
              {availableProperties.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} ({p.currency === 'USD' ? '$' : 'S/.'}{p.price}) - {p.type === 'ROOM' ? 'Cuarto' : 'Local'}
                </SelectItem>
              ))}
              {availableProperties.length === 0 && (
                <SelectItem value="" disabled>No hay propiedades disponibles</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tenantId">Inquilino</Label>
          <Select name="tenantId" required>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar inquilino" />
            </SelectTrigger>
            <SelectContent>
              {tenants.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Fecha de Inicio</Label>
            <Input id="startDate" name="startDate" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">Fecha de Fin</Label>
            <Input id="endDate" name="endDate" type="date" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="monthlyRent">Renta Mensual</Label>
            <Input id="monthlyRent" name="monthlyRent" type="number" min="0" defaultValue={selectedProperty?.price} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Moneda</Label>
            <Select name="currency" required defaultValue={selectedProperty?.currency || 'PEN'}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar moneda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PEN">Soles (S/.)</SelectItem>
                <SelectItem value="USD">Dólares ($)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="advanceMonths">Meses de Adelanto</Label>
            <Input id="advanceMonths" name="advanceMonths" type="number" min="0" defaultValue="1" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="warrantyMonths">Meses de Garantía</Label>
            <Input id="warrantyMonths" name="warrantyMonths" type="number" min="0" defaultValue="1" required />
          </div>
        </div>

        {isCommercial && (
          <div className="border p-4 rounded-md space-y-4 bg-slate-50">
            <h3 className="font-semibold">Costos de Servicios (Local Comercial)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="waterCost">Pago Agua</Label>
                <Input id="waterCost" name="waterCost" type="number" min="0" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="electricityCost">Pago Luz</Label>
                <Input id="electricityCost" name="electricityCost" type="number" min="0" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gasCost">Pago Gas</Label>
                <Input id="gasCost" name="gasCost" type="number" min="0" placeholder="0" />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Link href="/leases">
            <Button variant="outline" type="button">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={availableProperties.length === 0}>Crear Contrato</Button>
        </div>
      </form>
    </div>
  );
}
