'use client';

import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { generatePaymentMessage, generateWhatsAppUrl } from "@/lib/whatsapp";
import { generateReceiptPDF } from "@/lib/pdf";

interface WhatsAppReceiptButtonProps {
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

export function WhatsAppReceiptButton({ payment, lease, tenant, property }: WhatsAppReceiptButtonProps) {
  const handleGenerateAndSend = () => {
    // Generate PDF
    generateReceiptPDF({ payment, lease, tenant, property });

    // WhatsApp Link
    const message = generatePaymentMessage(
      'RECEIPT',
      { ...payment, status: 'PAID' }, // Force status for type safety
      lease,
      tenant,
      property
    );
    const whatsappUrl = generateWhatsAppUrl(tenant.phone, message);

    window.open(whatsappUrl, '_blank');
  };

  return (
    <Button size="icon" variant="ghost" title="Enviar Recibo por WhatsApp" onClick={handleGenerateAndSend}>
      <MessageCircle className="h-4 w-4 text-green-600" />
    </Button>
  );
}
