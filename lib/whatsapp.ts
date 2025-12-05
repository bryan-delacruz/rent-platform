import { formatMoney } from "@/lib/utils";

export interface WhatsAppPaymentData {
  amount: number;
  amountPaid: number;
  dueDate: string;
  status: string;
}

export interface WhatsAppTenantData {
  name: string;
  phone: string;
}

export interface WhatsAppPropertyData {
  name: string;
}

export interface WhatsAppLeaseData {
  currency: 'USD' | 'PEN';
}

export function generateWhatsAppUrl(phone: string, message: string): string {
  // Ensure phone number has country code if missing (assuming PE +51 for now based on context)
  const cleanPhone = phone.replace(/\D/g, '');
  const phoneWithCode = cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`;

  return `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(message)}`;
}

export function generatePaymentMessage(
  type: 'CONFIRMATION' | 'REMINDER' | 'RECEIPT',
  payment: WhatsAppPaymentData,
  lease: WhatsAppLeaseData,
  tenant: WhatsAppTenantData,
  property: WhatsAppPropertyData,
  overdueDays: number = 0
): string {
  const remaining = payment.amount - (payment.amountPaid || 0);

  if (type === 'CONFIRMATION') {
    return `Hola ${tenant.name}, le confirmamos que hemos recibido el pago por ${formatMoney(payment.amountPaid, lease.currency)} correspondiente al alquiler de ${property.name}. ¡Gracias!`;
  }

  if (type === 'REMINDER') {
    let message = `Hola ${tenant.name}, le recordamos que tiene un pago pendiente del alquiler de ${property.name}. `;
    message += `Vence: ${payment.dueDate}. `;

    if (overdueDays > 0) {
      message += `Tiene ${overdueDays} días de retraso. `;
    }

    if (payment.amountPaid > 0) {
      message += `Saldo pendiente: ${formatMoney(remaining, lease.currency)}.`;
    } else {
      message += `Monto pendiente: ${formatMoney(payment.amount, lease.currency)}.`;
    }
    return message;
  }

  if (type === 'RECEIPT') {
    return `Hola ${tenant.name}, adjunto el recibo de pago del alquiler de ${property.name} correspondiente a la fecha ${payment.dueDate}. Monto pagado: ${formatMoney(payment.amountPaid, lease.currency)}.`;
  }

  return "";
}
