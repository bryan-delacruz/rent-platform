'use client';

import { useState, useTransition } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PropertyFields } from '@/components/PropertyFields';
import { updateProperty } from '@/lib/actions';
import { notify } from '@/lib/action-toast';
import { useI18n } from '@/lib/i18n/client';
import type { Property } from '@/lib/types';

export function EditPropertyDialog({ property, isOccupied }: { property: Property; isOccupied: boolean }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const submit = (formData: FormData) =>
    startTransition(async () => {
      if (notify(await updateProperty(property.id, formData), t, t.properties.updated)) setOpen(false);
    });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" aria-label={`${t.common.edit}: ${property.name}`}>
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t.properties.editTitle}</DialogTitle>
        </DialogHeader>
        <form action={submit} className="grid gap-6 py-2">
          <PropertyFields property={property} isOccupied={isOccupied} />
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? t.common.saving : t.common.save}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
