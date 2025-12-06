'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateLease } from "@/lib/actions";
import { Lease, Property } from "@/lib/db";
import { Pencil } from "lucide-react";
import { useState } from "react";

export function EditLeaseDialog({ lease, property }: { lease: Lease; property?: Property }) {
  const [open, setOpen] = useState(false);
  const isCommercial = property?.type === 'COMMERCIAL';

  const updateAction = async (formData: FormData) => {
    await updateLease(lease.id, formData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Contrato</DialogTitle>
        </DialogHeader>
        <form action={updateAction} className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha Inicio</Label>
              <Input id="startDate" name="startDate" type="date" defaultValue={lease.startDate} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha Fin</Label>
              <Input id="endDate" name="endDate" type="date" defaultValue={lease.endDate} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthlyRent">Renta Mensual</Label>
              <Input id="monthlyRent" name="monthlyRent" type="number" min="0" defaultValue={lease.monthlyRent} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select name="currency" required defaultValue={lease.currency}>
                <SelectTrigger>
                  <SelectValue />
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
              <Label htmlFor="advanceMonths">Adelanto (Meses)</Label>
              <Input id="advanceMonths" name="advanceMonths" type="number" min="0" defaultValue={lease.advanceMonths} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warrantyMonths">Garantía (Meses)</Label>
              <Input id="warrantyMonths" name="warrantyMonths" type="number" min="0" defaultValue={lease.warrantyMonths} required />
            </div>
          </div>

          {isCommercial && (
            <div className="border p-4 rounded-md space-y-4 bg-slate-50">
              <h3 className="font-semibold text-sm">Costos de Servicios</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="waterCost">Agua</Label>
                  <Input id="waterCost" name="waterCost" type="number" min="0" defaultValue={(lease.utilityCosts as any)?.water || 0} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="electricityCost">Luz</Label>
                  <Input id="electricityCost" name="electricityCost" type="number" min="0" defaultValue={(lease.utilityCosts as any)?.electricity || 0} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gasCost">Gas</Label>
                  <Input id="gasCost" name="gasCost" type="number" min="0" defaultValue={(lease.utilityCosts as any)?.gas || 0} />
                </div>
              </div>
            </div>
          )}



          <div className="flex justify-end">
            <Button type="submit">Guardar Cambios</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
