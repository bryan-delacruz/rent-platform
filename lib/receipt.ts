import jsPDF from 'jspdf';
import { formatDate, formatMoney } from '@/lib/format';
import { getDictionary, interpolate, type Locale } from '@/lib/i18n';
import { todayISO } from '@/lib/billing';
import type { Currency, Payment } from '@/lib/types';

/** Generates and downloads a payment receipt in the active language. */
export function downloadReceipt(
  locale: Locale,
  payment: Payment,
  currency: Currency,
  tenantName: string,
  propertyName: string,
) {
  const t = getDictionary(locale).receipt;
  const money = (value: number) => formatMoney(value, currency, locale);
  const date = (value: string) => formatDate(value, locale);
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text(t.title, 105, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.text(interpolate(t.issued, { date: date(todayISO()) }), 20, 40);
  doc.text(interpolate(t.property, { name: propertyName }), 20, 50);
  doc.text(interpolate(t.tenant, { name: tenantName }), 20, 60);
  doc.line(20, 70, 190, 70);

  doc.text(t.detail, 20, 80);
  doc.text(interpolate(t.dueDate, { date: date(payment.dueDate) }), 20, 90);
  doc.text(interpolate(t.total, { amount: money(payment.amount) }), 20, 100);
  doc.text(interpolate(t.paid, { amount: money(payment.amountPaid) }), 20, 110);
  if (payment.paidDate) {
    doc.text(interpolate(t.lastPayment, { date: date(payment.paidDate) }), 20, 120);
  }

  if (payment.transactions.length > 0) {
    doc.text(t.transactions, 20, 140);
    payment.transactions.forEach((tx, index) => {
      doc.text(`- ${date(tx.date)}: ${money(tx.amount)}`, 30, 150 + index * 10);
    });
  }

  const safeName = tenantName.replace(/[^\p{L}\p{N}]+/gu, '_');
  doc.save(interpolate(t.fileName, { tenant: safeName, date: payment.dueDate }));
}
