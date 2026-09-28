'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/lib/i18n/client';
import type { Currency, Lease } from '@/lib/types';

/** Dates, rent and deposits, shared by the new and edit lease forms. */
export function LeaseTermsFields({
  lease,
  isCommercial,
  defaultRent,
  defaultCurrency,
}: {
  lease?: Lease;
  isCommercial: boolean;
  defaultRent?: number;
  defaultCurrency?: Currency;
}) {
  const { t } = useI18n();
  const l = t.leases;

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">{l.startDate}</Label>
          <Input id="startDate" name="startDate" type="date" defaultValue={lease?.startDate} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">{l.endDate}</Label>
          <Input id="endDate" name="endDate" type="date" defaultValue={lease?.endDate} required />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="monthlyRent">{l.monthlyRent}</Label>
          <Input
            key={defaultRent}
            id="monthlyRent"
            name="monthlyRent"
            type="number"
            min="0.01"
            step="0.01"
            defaultValue={lease?.monthlyRent ?? defaultRent}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">{t.properties.fields.currency}</Label>
          <Select key={defaultCurrency} name="currency" required defaultValue={lease?.currency ?? defaultCurrency ?? 'PEN'}>
            <SelectTrigger id="currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PEN">{t.currency.PEN}</SelectItem>
              <SelectItem value="USD">{t.currency.USD}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="advanceMonths">{l.advanceMonths}</Label>
          <Input id="advanceMonths" name="advanceMonths" type="number" min="0" max="24" defaultValue={lease?.advanceMonths ?? 1} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="warrantyMonths">{l.warrantyMonths}</Label>
          <Input id="warrantyMonths" name="warrantyMonths" type="number" min="0" max="24" defaultValue={lease?.warrantyMonths ?? 1} required />
        </div>
      </div>

      {isCommercial && (
        <fieldset className="space-y-4 rounded-md border bg-muted/40 p-4">
          <legend className="px-1 text-sm font-semibold">{l.utilities}</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            {(['water', 'electricity', 'gas'] as const).map((key) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={`${key}Cost`}>{l[key]}</Label>
                <Input
                  id={`${key}Cost`}
                  name={`${key}Cost`}
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={lease?.utilityCosts?.[key] ?? ''}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  );
}
