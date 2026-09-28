'use client';

import { useState, useTransition } from 'react';
import { Ban } from 'lucide-react';
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
import { terminateLease } from '@/lib/actions';
import { notify } from '@/lib/action-toast';
import { todayISO } from '@/lib/billing';
import { useI18n } from '@/lib/i18n/client';

export function TerminateLeaseDialog({ leaseId }: { leaseId: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [pending, startTransition] = useTransition();

  const confirm = () =>
    startTransition(async () => {
      if (notify(await terminateLease(leaseId, date), t, t.leases.terminated)) setOpen(false);
    });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive">
          <Ban className="mr-2 h-4 w-4" aria-hidden /> {t.leases.terminate}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t.leases.terminateTitle}</DialogTitle>
          <DialogDescription>{t.leases.terminateConfirm}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="terminationDate">{t.leases.terminationDate}</Label>
          <Input id="terminationDate" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            {t.common.cancel}
          </Button>
          <Button variant="destructive" onClick={confirm} disabled={pending}>
            {t.leases.confirmTerminate}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
