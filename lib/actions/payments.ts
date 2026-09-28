'use server';

import { prisma } from '@/lib/prisma';
import { requireOwner } from '@/lib/auth';
import { generateMonthlyCharges } from '@/lib/charges';
import {
  centsToDecimalString,
  isoToDate,
  summarizeTransactions,
  toCents,
  todayISO,
  dateToISO,
} from '@/lib/billing';
import { parse, registerPaymentSchema, updatePaymentSchema } from '@/lib/validation';
import { revalidatePayments } from '@/lib/revalidation';
import type { Prisma } from '@prisma/client';
import type { ActionResult } from '@/lib/types';
import { ActionError, fail, ok, run } from './result';

/** Recomputes amountPaid and paidDate from the payment's transactions. */
async function syncTotals(tx: Prisma.TransactionClient, paymentId: string) {
  const transactions = await tx.paymentTransaction.findMany({ where: { paymentId } });
  const { paidCents, lastPaidAt } = summarizeTransactions(
    transactions.map((t) => ({ amountCents: toCents(t.amount), paidAt: dateToISO(t.paidAt) })),
  );
  await tx.payment.update({
    where: { id: paymentId },
    data: {
      amountPaid: centsToDecimalString(paidCents),
      paidDate: lastPaidAt ? isoToDate(lastPaidAt) : null,
    },
  });
}

export async function registerPayment(paymentId: string, amount: string): Promise<ActionResult> {
  const ownerId = await requireOwner();
  const input = parse(registerPaymentSchema, { paymentId, amount });
  if (!input.ok) return fail('validation', input.fields);

  return run(async () => {
    const leaseId = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({ where: { id: paymentId, ownerId } });
      if (!payment) throw new ActionError('notFound');
      const pendingCents = toCents(payment.amount) - toCents(payment.amountPaid);
      if (toCents(input.data.amount) > pendingCents) throw new ActionError('overpayment');

      await tx.paymentTransaction.create({
        data: {
          paymentId,
          amount: input.data.amount,
          paidAt: isoToDate(input.data.paidAt ?? todayISO()),
        },
      });
      await syncTotals(tx, paymentId);
      return payment.leaseId;
    });
    revalidatePayments(leaseId);
    return ok();
  });
}

export async function deleteTransaction(paymentId: string, transactionId: string): Promise<ActionResult> {
  const ownerId = await requireOwner();
  return run(async () => {
    const leaseId = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({ where: { id: paymentId, ownerId } });
      if (!payment) throw new ActionError('notFound');
      const { count } = await tx.paymentTransaction.deleteMany({
        where: { id: transactionId, paymentId },
      });
      if (count === 0) throw new ActionError('notFound');
      await syncTotals(tx, paymentId);
      return payment.leaseId;
    });
    revalidatePayments(leaseId);
    return ok();
  });
}

export async function updatePayment(
  paymentId: string,
  values: { amount: string; dueDate: string },
): Promise<ActionResult> {
  const ownerId = await requireOwner();
  const input = parse(updatePaymentSchema, { paymentId, ...values });
  if (!input.ok) return fail('validation', input.fields);

  return run(async () => {
    const payment = await prisma.payment.findFirst({ where: { id: paymentId, ownerId } });
    if (!payment) throw new ActionError('notFound');
    await prisma.payment.update({
      where: { id: paymentId },
      data: { amount: input.data.amount, dueDate: isoToDate(input.data.dueDate) },
    });
    revalidatePayments(payment.leaseId);
    return ok();
  });
}

export async function deletePayment(paymentId: string): Promise<ActionResult> {
  const ownerId = await requireOwner();
  return run(async () => {
    const payment = await prisma.payment.findFirst({ where: { id: paymentId, ownerId } });
    if (!payment) throw new ActionError('notFound');
    // Transactions are removed by the ON DELETE CASCADE relation.
    await prisma.payment.delete({ where: { id: paymentId } });
    revalidatePayments(payment.leaseId);
    return ok();
  });
}

export async function generateMonthlyPayments(): Promise<ActionResult<{ created: number }>> {
  const ownerId = await requireOwner();
  return run(async () => {
    const result = await generateMonthlyCharges({ ownerId });
    revalidatePayments();
    return ok(result);
  });
}
