'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Languages } from 'lucide-react';
import { setLocale } from '@/lib/i18n/actions';
import { useI18n } from '@/lib/i18n/client';
import { locales } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const LANGUAGE_NAMES = { en: 'English', es: 'Español' } as const;

export function LocaleSwitcher({ className }: { className?: string }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className={cn('flex items-center gap-2', className)} role="group" aria-label={t.nav.language}>
      <Languages className="h-4 w-4 text-muted-foreground" aria-hidden />
      {locales.map((code) => (
        <button
          key={code}
          type="button"
          disabled={pending}
          aria-pressed={locale === code}
          aria-label={LANGUAGE_NAMES[code]}
          lang={code}
          onClick={() =>
            startTransition(async () => {
              await setLocale(code);
              router.refresh();
            })
          }
          className={cn(
            'rounded px-2 py-1 text-xs font-semibold uppercase transition-colors',
            locale === code ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
          )}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
