'use client';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deletePayment } from "@/lib/actions";
import { Edit, MoreVertical, Trash } from "lucide-react";
import { useState } from "react";
import { EditPaymentDialog } from "./EditPaymentDialog";

interface PaymentActionsMenuProps {
  payment: {
    id: string;
    amount: number;
    dueDate: string;
    transactions?: { id: string; date: string; amount: number }[];
  };
  currency: 'USD' | 'PEN';
}

export function PaymentActionsMenu({ payment, currency }: PaymentActionsMenuProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleDelete = async () => {
    if (confirm("¿Estás seguro de eliminar este recibo permanentemente? Se perderán todas las transacciones asociadas.")) {
      await deletePayment(payment.id);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
            <Trash className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditPaymentDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        payment={payment}
        currency={currency}
      />
    </>
  );
}
