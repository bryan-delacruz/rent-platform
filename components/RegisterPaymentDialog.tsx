'use client';

import { useState, useTransition } from 'react';
import { DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerPayment } from '@/lib/actions';
import { notify } from '@/lib/action-toast';
import { balanceCents, centsToDecimalString, toCents } from '@/lib/billing';
import { formatMoney } from '@/lib/format';
import { useI18n } from '@/lib/i18n/client';
import type { Currency, Payment } from '@/lib/types';

export function RegisterPaymentDialog({ payment, currency }: { payment: Payment; currency: Currency }) {
  const { locale, t } = useI18n();
  const pending = balanceCents(toCents(payment.amount), toCents(payment.amountPaid));
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(centsToDecimalString(pending));
  const [saving, startTransition] = useTransition();
  const money = (value: number) => formatMoney(value, currency, locale);

  const confirm = () =>
    startTransition(async () => {
      if (notify(await registerPayment(payment.id, amount), t, t.payments.registered)) setOpen(false);
    });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" aria-label={t.payments.register} title={t.payments.register}>
          <DollarSign className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t.payments.registerTitle}</DialogTitle>
          <DialogDescription>{t.payments.registerHint}</DialogDescription>
        </DialogHeader>
        <dl className="grid grid-cols-2 gap-2 py-2 text-sm">
          <dt className="text-muted-foreground">{t.payments.total}</dt>
          <dd className="text-right font-medium">{money(payment.amount)}</dd>
          <dt className="text-muted-foreground">{t.payments.paid}</dt>
          <dd className="text-right font-medium text-green-700">{money(payment.amountPaid)}</dd>
          <dt className="text-muted-foreground">{t.payments.pending}</dt>
          <dd className="text-right font-medium text-red-700">{money(pending / 100)}</dd>
        </dl>
        <div className="space-y-2">
          <Label htmlFor={`amount-${payment.id}`}>{t.payments.amountToPay}</Label>
          <Input
            id={`amount-${payment.id}`}
            type="number"
            min="0.01"
            step="0.01"
            max={pending / 100}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            {t.common.cancel}
          </Button>
          <Button onClick={confirm} disabled={saving}>
            {saving ? t.common.saving : t.payments.register}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
