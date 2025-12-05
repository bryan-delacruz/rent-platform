import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMoney(amount: number, currency: 'USD' | 'PEN' = 'PEN') {
  const formatter = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Replace standard grouping separator if needed, but es-PE usually does it right.
  // User specifically asked for space as thousands separator if possible, 
  // but standard currency format is usually preferred. 
  // Let's stick to standard locale first, which for PEN is usually "S/ 1,200.00" or similar.
  // If user wants specific "space" separator:
  return formatter.format(amount).replace(',', ' ');
}

export function formatPhone(phone: string) {
  // Remove non-digits
  const cleaned = phone.replace(/\D/g, '');
  // Group by 3
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`;
  }
  // Fallback for other lengths
  return phone.replace(/(\d{3})(?=\d)/g, '$1 ');
}

export function isOverdue(dueDate: string): boolean {
  const due = new Date(dueDate);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return today > due;
}

export type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL';

export function calculatePaymentStatus(amount: number, amountPaid: number, dueDate: string): PaymentStatus {
  if (amountPaid >= amount) {
    return 'PAID';
  } else if (amountPaid > 0) {
    return 'PARTIAL';
  } else {
    return isOverdue(dueDate) ? 'OVERDUE' : 'PENDING';
  }
}
