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
import { createProperty } from "@/lib/actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewPropertyPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/properties">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Agregar Nueva Propiedad</h2>
      </div>

      <form action={createProperty} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre de la Propiedad</Label>
          <Input id="name" name="name" placeholder="Ej: Habitación 101" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select name="type" required defaultValue="ROOM">
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ROOM">Cuarto</SelectItem>
                <SelectItem value="COMMERCIAL">Local Comercial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <Select name="location" required defaultValue="Los Naranjales">
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar ubicación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Los Naranjales">Los Naranjales</SelectItem>
                <SelectItem value="Los Pinos">Los Pinos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="floor">Piso</Label>
            <Select name="floor" required defaultValue="1">
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar piso" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((floor) => (
                  <SelectItem key={floor} value={floor.toString()}>
                    Piso {floor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Precio Mensual</Label>
            <Input id="price" name="price" type="number" min="0" placeholder="500" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Moneda</Label>
          <Select name="currency" required defaultValue="PEN">
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar moneda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PEN">Soles (S/.)</SelectItem>
              <SelectItem value="USD">Dólares ($)</SelectItem>
            </SelectContent>
          </Select>
        </div>



        <div className="flex justify-end gap-4">
          <Link href="/properties">
            <Button variant="outline" type="button">Cancelar</Button>
          </Link>
          <Button type="submit">Crear Propiedad</Button>
        </div>
      </form>
    </div>
  );
}
