'use client';

import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { deleteTransaction, updatePayment } from '@/lib/actions';
import { notify } from '@/lib/action-toast';
import { centsToDecimalString, toCents } from '@/lib/billing';
import { formatDate, formatMoney } from '@/lib/format';
import { useI18n } from '@/lib/i18n/client';
import type { Currency, Payment } from '@/lib/types';

export function EditPaymentDialog({
  open,
  onOpenChange,
  payment,
  currency,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment;
  currency: Currency;
}) {
  const { locale, t } = useI18n();
  const [amount, setAmount] = useState(centsToDecimalString(toCents(payment.amount)));
  const [dueDate, setDueDate] = useState(payment.dueDate);
  const [pending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      if (notify(await updatePayment(payment.id, { amount, dueDate }), t, t.payments.updated)) onOpenChange(false);
    });

  const removeTransaction = (transactionId: string) => {
    if (!window.confirm(t.payments.deleteTransactionConfirm)) return;
    startTransition(async () => {
      notify(await deleteTransaction(payment.id, transactionId), t);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t.payments.editTitle}</DialogTitle>
          <DialogDescription>{t.payments.editHint}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">{t.payments.details}</TabsTrigger>
            <TabsTrigger value="transactions">{t.payments.transactions}</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor={`edit-amount-${payment.id}`}>{t.payments.amount}</Label>
              <Input
                id={`edit-amount-${payment.id}`}
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-due-${payment.id}`}>{t.payments.dueDate}</Label>
              <Input
                id={`edit-due-${payment.id}`}
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>
            <DialogFooter>
              <Button onClick={save} disabled={pending}>
                {pending ? t.common.saving : t.common.save}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-2 py-4">
            {payment.transactions.length > 0 ? (
              payment.transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between rounded-md border p-2">
                  <div className="text-sm">
                    <p className="font-medium">{formatDate(tx.date, locale)}</p>
                    <p className="text-muted-foreground">{formatMoney(tx.amount, currency, locale)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t.common.delete}
                    onClick={() => removeTransaction(tx.id)}
                    disabled={pending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">{t.payments.noTransactions}</p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
