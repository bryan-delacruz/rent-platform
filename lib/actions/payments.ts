'use server';

import { readDb, writeDb } from '@/lib/db';
import { calculatePaymentStatus } from '@/lib/utils';
import { revalidatePayments } from '@/lib/revalidation';
import { generateId, generateUniqueId, TRANSACTION_PREFIX, PAYMENT_PREFIX } from '@/lib/id-generator';

export async function registerPayment(paymentId: string, amount: number) {
  const db = await readDb();
  const paymentIndex = db.payments.findIndex(p => p.id === paymentId);

  if (paymentIndex >= 0) {
    const payment = db.payments[paymentIndex];

    // Initialize transactions if not present
    if (!payment.transactions) {
      payment.transactions = [];
    }

    // Add new transaction
    payment.transactions.push({
      id: generateId(TRANSACTION_PREFIX),
      date: new Date().toISOString().split('T')[0],
      amount: amount
    });

    // Recalculate total paid from transactions (source of truth)
    const totalPaid = payment.transactions.reduce((sum, tx) => sum + tx.amount, 0);

    payment.amountPaid = totalPaid;
    payment.paidDate = new Date().toISOString().split('T')[0]; // Last payment date

    if (totalPaid >= payment.amount) {
      payment.status = 'PAID';
    } else {
      payment.status = calculatePaymentStatus(payment.amount, totalPaid, payment.dueDate);
    }

    await writeDb(db);
    revalidatePayments(payment.leaseId);
  }
}

export async function generateMonthlyPayments(revalidate = true) {
  const db = await readDb();
  const today = new Date();
  const currentMonth = today.getMonth(); // 0-11
  const currentYear = today.getFullYear();

  // Format: YYYY-MM-01
  const dueDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;

  let createdCount = 0;
  let changesMade = false;

  for (const lease of db.leases) {
    if (lease.status !== 'ACTIVE') continue;

    // Check if lease is physically expired
    if (dueDate > lease.endDate) continue;

    // Check if payment already exists for this month/year for this lease
    const exists = db.payments.some(p =>
      p.leaseId === lease.id && p.dueDate === dueDate
    );

    if (!exists) {
      db.payments.push({
        id: generateUniqueId(PAYMENT_PREFIX),
        leaseId: lease.id,
        dueDate: dueDate,
        amount: lease.monthlyRent,
        amountPaid: 0,
        status: 'PENDING',
        paidDate: null
      });
      createdCount++;
      changesMade = true;
    }
  }

  if (changesMade) {
    await writeDb(db);
    if (revalidate) {
      revalidatePayments();
    }
  }

  return {
    created: createdCount,
    message: createdCount > 0
      ? `Successfully generated ${createdCount} new payments for this month.`
      : `No new payments generated. All active leases already have payments for this month.`
  };
}

export async function updatePayment(paymentId: string, data: { amount: number; dueDate: string }) {
  const db = await readDb();
  const paymentIndex = db.payments.findIndex(p => p.id === paymentId);

  if (paymentIndex >= 0) {
    const payment = db.payments[paymentIndex];
    payment.amount = data.amount;
    payment.dueDate = data.dueDate;

    // Recalculate status in case amount changed
    const totalPaid = payment.amountPaid || 0;
    payment.status = calculatePaymentStatus(payment.amount, totalPaid, payment.dueDate);

    await writeDb(db);
    revalidatePayments(payment.leaseId);
  }
}

export async function deletePayment(paymentId: string) {
  const db = await readDb();
  const paymentIndex = db.payments.findIndex(p => p.id === paymentId);

  if (paymentIndex >= 0) {
    const payment = db.payments[paymentIndex];
    db.payments.splice(paymentIndex, 1);
    await writeDb(db);
    revalidatePayments(payment.leaseId);
  }
}

export async function deleteTransaction(paymentId: string, transactionId: string) {
  const db = await readDb();
  const paymentIndex = db.payments.findIndex(p => p.id === paymentId);

  if (paymentIndex >= 0) {
    const payment = db.payments[paymentIndex];

    if (payment.transactions) {
      payment.transactions = payment.transactions.filter(tx => tx.id !== transactionId);

      // Recalculate total paid
      const totalPaid = payment.transactions.reduce((sum, tx) => sum + tx.amount, 0);
      payment.amountPaid = totalPaid;

      // Recalculate status
      payment.status = calculatePaymentStatus(payment.amount, totalPaid, payment.dueDate);

      // Update paidDate if no transactions left
      if (totalPaid === 0) {
        payment.paidDate = null;
      } else {
        // Set paidDate to the date of the last remaining transaction
        const lastTx = payment.transactions[payment.transactions.length - 1];
        payment.paidDate = lastTx ? lastTx.date : null;
      }

      await writeDb(db);
      revalidatePayments(payment.leaseId);
    }
  }
}
