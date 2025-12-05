'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerPayment } from "@/lib/actions";
import { formatMoney } from "@/lib/utils";
import { Check, DollarSign } from "lucide-react";
import { useState } from "react";

interface Payment {
  id: string;
  amount: number;
  amountPaid: number;
  currency?: 'USD' | 'PEN';
}

export function RegisterPaymentDialog({ payment, currency }: { payment: Payment, currency: 'USD' | 'PEN' }) {
  const [open, setOpen] = useState(false);
  const remaining = payment.amount - (payment.amountPaid || 0);
  const [amount, setAmount] = useState(remaining.toString());

  const handleRegister = async () => {
    await registerPayment(payment.id, Number(amount));
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" title="Registrar Pago">
          <DollarSign className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
          <DialogDescription>
            Ingrese el monto a registrar. Puede ser un pago parcial o total.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Total</Label>
            <div className="col-span-3 font-medium">
              {formatMoney(payment.amount, currency)}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Pagado</Label>
            <div className="col-span-3 font-medium text-green-600">
              {formatMoney(payment.amountPaid || 0, currency)}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Pendiente</Label>
            <div className="col-span-3 font-medium text-red-600">
              {formatMoney(remaining, currency)}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Monto a Pagar
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
              max={remaining}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleRegister}>Registrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
