'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { PropertyFields } from '@/components/PropertyFields';
import { createProperty } from '@/lib/actions';
import { notify } from '@/lib/action-toast';
import { useI18n } from '@/lib/i18n/client';

export function NewPropertyForm() {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const submit = (formData: FormData) =>
    startTransition(async () => {
      if (notify(await createProperty(formData), t, t.properties.created)) router.push('/properties');
    });

  return (
    <form action={submit} className="space-y-6">
      <PropertyFields />
      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" asChild>
          <Link href="/properties">{t.common.cancel}</Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? t.common.saving : t.properties.create}
        </Button>
      </div>
    </form>
  );
}
