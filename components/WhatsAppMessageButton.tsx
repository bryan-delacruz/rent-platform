'use client';

import { Button } from "@/components/ui/button";
import { MessageCircle, MessageSquareWarning } from "lucide-react";
import { generatePaymentMessage, generateWhatsAppUrl } from "@/lib/whatsapp";

interface WhatsAppMessageButtonProps {
  payment: {
    amount: number;
    amountPaid: number;
    dueDate: string;
    status: string;
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
  overdueDays: number;
}

export function WhatsAppMessageButton({ payment, lease, tenant, property, overdueDays }: WhatsAppMessageButtonProps) {
  const isPaid = payment.status === 'PAID';

  const handleSendMessage = () => {
    const message = generatePaymentMessage(
      isPaid ? 'CONFIRMATION' : 'REMINDER',
      payment,
      lease,
      tenant,
      property,
      overdueDays
    );

    const whatsappUrl = generateWhatsAppUrl(tenant.phone, message);
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      title={isPaid ? "Enviar Confirmación por WhatsApp" : "Enviar Recordatorio por WhatsApp"}
      onClick={handleSendMessage}
    >
      {isPaid ? (
        <MessageCircle className="h-4 w-4 text-green-600" />
      ) : (
        <MessageSquareWarning className="h-4 w-4 text-amber-600" />
      )}
    </Button>
  );
}
