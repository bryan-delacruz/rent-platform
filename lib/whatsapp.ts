import { formatDate, formatMoney } from '@/lib/format';
import { getDictionary, interpolate, type Locale } from '@/lib/i18n';
import type { Currency, Payment } from '@/lib/types';

/** Builds a wa.me link, assuming Peru (+51) when the number has no country code. */
export function whatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '');
  const withCode = digits.startsWith('51') && digits.length > 9 ? digits : `51${digits}`;
  return `https://wa.me/${withCode}?text=${encodeURIComponent(message)}`;
}

export function paymentMessage(
  locale: Locale,
  payment: Pick<Payment, 'amount' | 'amountPaid' | 'dueDate' | 'status' | 'overdueDays'>,
  currency: Currency,
  tenantName: string,
  propertyName: string,
): string {
  const t = getDictionary(locale).whatsapp;
  const money = (value: number) => formatMoney(value, currency, locale);

  if (payment.status === 'PAID') {
    return interpolate(t.confirmation, {
      tenant: tenantName,
      amount: money(payment.amountPaid),
      property: propertyName,
    });
  }

  const parts = [
    interpolate(t.reminder, {
      tenant: tenantName,
      property: propertyName,
      date: formatDate(payment.dueDate, locale),
    }),
  ];
  if (payment.overdueDays > 0) parts.push(interpolate(t.overdue, { count: payment.overdueDays }));
  parts.push(
    payment.amountPaid > 0
      ? interpolate(t.balance, { amount: money(payment.amount - payment.amountPaid) })
      : interpolate(t.amountDue, { amount: money(payment.amount) }),
  );
  return parts.join(' ');
}
