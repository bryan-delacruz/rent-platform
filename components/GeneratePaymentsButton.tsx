'use client';

import { useTransition } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { generateMonthlyPayments } from '@/lib/actions';
import { notify } from '@/lib/action-toast';
import { interpolate } from '@/lib/i18n';
import { useI18n } from '@/lib/i18n/client';

export function GeneratePaymentsButton() {
  const { t } = useI18n();
  const [pending, startTransition] = useTransition();

  const generate = () =>
    startTransition(async () => {
      const result = await generateMonthlyPayments();
      if (!notify(result, t)) return;
      if (result.data.created > 0) {
        toast.success(interpolate(t.payments.generated, { count: result.data.created }));
      } else {
        toast.info(t.payments.noneGenerated);
      }
    });

  return (
    <Button onClick={generate} disabled={pending}>
      <RefreshCw className={`mr-2 h-4 w-4 ${pending ? 'animate-spin' : ''}`} aria-hidden />
      {pending ? t.payments.generating : t.payments.generate}
    </Button>
  );
}
