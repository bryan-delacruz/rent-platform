'use client';

import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";
import jsPDF from "jspdf";
import { FileDown } from "lucide-react";

interface DownloadReceiptButtonProps {
  payment: {
    id: string;
    amount: number;
    amountPaid: number;
    dueDate: string;
    paidDate: string | null;
    transactions?: { date: string; amount: number }[];
  };
  lease: {
    currency: 'USD' | 'PEN';
  };
  tenant: {
    name: string;
    phone: string;
  };
  property: {
    name: string;
  };
}

export function DownloadReceiptButton({ payment, lease, tenant, property }: DownloadReceiptButtonProps) {
  const handleDownload = () => {
    const doc = new jsPDF();

    // Receipt Content
    doc.setFontSize(20);
    doc.text("Recibo de Pago", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Fecha Emisión: ${new Date().toLocaleDateString()}`, 20, 40);
    doc.text(`Propiedad: ${property.name}`, 20, 50);
    doc.text(`Inquilino: ${tenant.name}`, 20, 60);

    doc.line(20, 70, 190, 70);

    doc.text("Detalle del Pago", 20, 80);
    doc.text(`Vencimiento: ${payment.dueDate}`, 20, 90);
    doc.text(`Monto Total Contrato: ${formatMoney(payment.amount, lease.currency)}`, 20, 100);
    doc.text(`Monto Abonado: ${formatMoney(payment.amountPaid, lease.currency)}`, 20, 110);

    if (payment.paidDate) {
      doc.text(`Fecha Último Pago: ${payment.paidDate}`, 20, 120);
    }

    if (payment.transactions && payment.transactions.length > 0) {
      doc.text("Historial de Transacciones:", 20, 140);
      let y = 150;
      payment.transactions.forEach((tx) => {
        doc.text(`- ${tx.date}: ${formatMoney(tx.amount, lease.currency)}`, 30, y);
        y += 10;
      });
    }

    doc.save(`Recibo_${tenant.name}_${payment.dueDate}.pdf`);
  };

  return (
    <Button size="icon" variant="ghost" title="Descargar Recibo PDF" onClick={handleDownload}>
      <FileDown className="h-4 w-4 text-blue-600" />
    </Button>
  );
}
