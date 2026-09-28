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
  DialogTrigger,
} from '@/components/ui/dialog';
import { notify } from '@/lib/action-toast';
import { useI18n } from '@/lib/i18n/client';
import type { ActionResult } from '@/lib/types';

/** Delete button with a confirmation dialog, shared by properties and tenants. */
export function ConfirmDeleteDialog({
  title,
  description,
  successMessage,
  label,
  onConfirm,
}: {
  title: string;
  description: string;
  successMessage: string;
  label: string;
  onConfirm: () => Promise<ActionResult>;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const confirm = () =>
    startTransition(async () => {
      if (notify(await onConfirm(), t, successMessage)) setOpen(false);
    });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="text-destructive" aria-label={label}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            {t.common.cancel}
          </Button>
          <Button variant="destructive" onClick={confirm} disabled={pending}>
            {pending ? t.common.deleting : t.common.delete}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
