'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deleteTransaction, updatePayment } from "@/lib/actions";
import { formatMoney } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface EditPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: {
    id: string;
    amount: number;
    dueDate: string;
    transactions?: { id: string; date: string; amount: number }[];
  };
  currency: 'USD' | 'PEN';
}

export function EditPaymentDialog({ open, onOpenChange, payment, currency }: EditPaymentDialogProps) {
  const [amount, setAmount] = useState(payment.amount);
  const [dueDate, setDueDate] = useState(payment.dueDate);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updatePayment(payment.id, { amount, dueDate });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update payment", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTransaction = async (txId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta transacción?")) return;

    setIsLoading(true);
    try {
      await deleteTransaction(payment.id, txId);
    } catch (error) {
      console.error("Failed to delete transaction", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Recibo</DialogTitle>
          <DialogDescription>
            Modifica los detalles del recibo o gestiona las transacciones.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="transactions">Transacciones</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Monto
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                Vencimiento
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="col-span-3"
              />
            </div>
            <DialogFooter>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4 py-4">
            {payment.transactions && payment.transactions.length > 0 ? (
              <div className="space-y-2">
                {payment.transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between rounded-md border p-2">
                    <div className="text-sm">
                      <p className="font-medium">{tx.date}</p>
                      <p className="text-muted-foreground">{formatMoney(tx.amount, currency)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTransaction(tx.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">
                No hay transacciones registradas.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
