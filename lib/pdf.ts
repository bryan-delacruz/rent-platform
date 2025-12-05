import jsPDF from "jspdf";
import { formatMoney } from "@/lib/utils";

interface ReceiptData {
  payment: {
    id: string;
    amount: number;
    amountPaid: number;
    dueDate: string;
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

export function generateReceiptPDF({ payment, lease, tenant, property }: ReceiptData) {
  const doc = new jsPDF();

  // Receipt Content
  doc.setFontSize(20);
  doc.text("Recibo de Pago", 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 40);
  doc.text(`Propiedad: ${property.name}`, 20, 50);
  doc.text(`Inquilino: ${tenant.name}`, 20, 60);

  doc.line(20, 70, 190, 70);

  doc.text("Detalle del Pago", 20, 80);
  doc.text(`Vencimiento: ${payment.dueDate}`, 20, 90);
  doc.text(`Monto Total: ${formatMoney(payment.amount, lease.currency)}`, 20, 100);
  doc.text(`Monto Pagado: ${formatMoney(payment.amountPaid, lease.currency)}`, 20, 110);

  if (payment.transactions && payment.transactions.length > 0) {
    doc.text("Transacciones:", 20, 130);
    let y = 140;
    payment.transactions.forEach((tx) => {
      doc.text(`- ${tx.date}: ${formatMoney(tx.amount, lease.currency)}`, 30, y);
      y += 10;
    });
  }

  doc.save(`Recibo_${tenant.name}_${payment.dueDate}.pdf`);
}
