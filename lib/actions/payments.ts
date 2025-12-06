'use server';

import { prisma } from '@/lib/prisma';
import { calculatePaymentStatus } from '@/lib/utils';
import { revalidatePayments } from '@/lib/revalidation';
import { generateId, generateUniqueId, TRANSACTION_PREFIX, PAYMENT_PREFIX } from '@/lib/id-generator';

export async function registerPayment(paymentId: string, amount: number) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) return;

  // Get current transactions
  const currentTransactions = (payment.transactions as any[]) || [];

  // Add new transaction
  const newTransactions = [
    ...currentTransactions,
    {
      id: generateId(TRANSACTION_PREFIX),
      date: new Date().toISOString().split('T')[0],
      amount: amount,
    },
  ];

  // Recalculate total paid from transactions
  const totalPaid = newTransactions.reduce((sum: number, tx: any) => sum + tx.amount, 0);

  const today = new Date().toISOString().split('T')[0];

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      transactions: newTransactions,
      amountPaid: totalPaid,
      paidDate: today,
      status: totalPaid >= payment.amount
        ? 'PAID'
        : calculatePaymentStatus(payment.amount, totalPaid, payment.dueDate),
    },
  });

  revalidatePayments(payment.leaseId);
}

export async function generateMonthlyPayments(revalidate = true) {
  const today = new Date();
  const currentMonth = today.getMonth(); // 0-11
  const currentYear = today.getFullYear();

  // Format: YYYY-MM-01
  const dueDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;

  // Get all active leases
  const activeLeases = await prisma.lease.findMany({
    where: {
      status: 'ACTIVE',
      endDate: {
        gte: dueDate, // Lease must not be physically expired
      },
    },
  });

  let createdCount = 0;

  for (const lease of activeLeases) {
    // Check if payment already exists for this month/year for this lease
    const existingPayment = await prisma.payment.findFirst({
      where: {
        leaseId: lease.id,
        dueDate: dueDate,
      },
    });

    if (!existingPayment) {
      await prisma.payment.create({
        data: {
          id: generateUniqueId(PAYMENT_PREFIX),
          leaseId: lease.id,
          dueDate: dueDate,
          amount: lease.monthlyRent,
          amountPaid: 0,
          status: 'PENDING',
          paidDate: null,
        },
      });
      createdCount++;
    }
  }

  if (revalidate) {
    revalidatePayments();
  }

  return {
    created: createdCount,
    message: createdCount > 0
      ? `Successfully generated ${createdCount} new payments for this month.`
      : `No new payments generated. All active leases already have payments for this month.`,
  };
}

export async function updatePayment(paymentId: string, data: { amount: number; dueDate: string }) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) return;

  const totalPaid = payment.amountPaid || 0;

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      amount: data.amount,
      dueDate: data.dueDate,
      status: calculatePaymentStatus(data.amount, totalPaid, data.dueDate),
    },
  });

  revalidatePayments(payment.leaseId);
}

export async function deletePayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) return;

  await prisma.payment.delete({
    where: { id: paymentId },
  });

  revalidatePayments(payment.leaseId);
}

export async function deleteTransaction(paymentId: string, transactionId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) return;

  const currentTransactions = (payment.transactions as any[]) || [];
  const updatedTransactions = currentTransactions.filter((tx: any) => tx.id !== transactionId);

  // Recalculate total paid
  const totalPaid = updatedTransactions.reduce((sum: number, tx: any) => sum + tx.amount, 0);

  // Determine paidDate
  const paidDate = totalPaid === 0
    ? null
    : (updatedTransactions[updatedTransactions.length - 1]?.date || null);

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      transactions: updatedTransactions,
      amountPaid: totalPaid,
      status: calculatePaymentStatus(payment.amount, totalPaid, payment.dueDate),
      paidDate,
    },
  });

  revalidatePayments(payment.leaseId);
}
