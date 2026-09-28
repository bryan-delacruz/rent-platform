'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeaseTermsFields } from '@/components/LeaseTermsFields';
import { createLease } from '@/lib/actions';
import { notify } from '@/lib/action-toast';
import { formatMoney } from '@/lib/format';
import { useI18n } from '@/lib/i18n/client';
import type { Property, Tenant } from '@/lib/types';

export function NewLeaseForm({ properties, tenants }: { properties: Property[]; tenants: Tenant[] }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [propertyId, setPropertyId] = useState('');

  const available = properties.filter((property) => property.status === 'AVAILABLE');
  const selected = properties.find((property) => property.id === propertyId);
  const canSubmit = available.length > 0 && tenants.length > 0;

  const submit = (formData: FormData) =>
    startTransition(async () => {
      const result = await createLease(formData);
      if (notify(result, t, t.leases.created)) router.push(`/leases/${result.data.id}`);
    });

  return (
    <form action={submit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="propertyId">{t.leases.property}</Label>
        <Select name="propertyId" required onValueChange={setPropertyId} disabled={available.length === 0}>
          <SelectTrigger id="propertyId">
            <SelectValue placeholder={available.length ? t.leases.selectProperty : t.leases.noAvailable} />
          </SelectTrigger>
          <SelectContent>
            {available.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                {property.name} · {t.propertyType[property.type]} · {formatMoney(property.price, property.currency, locale)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tenantId">{t.leases.tenant}</Label>
        <Select name="tenantId" required disabled={tenants.length === 0}>
          <SelectTrigger id="tenantId">
            <SelectValue placeholder={tenants.length ? t.leases.selectTenant : t.leases.noTenants} />
          </SelectTrigger>
          <SelectContent>
            {tenants.map((tenant) => (
              <SelectItem key={tenant.id} value={tenant.id}>
                {tenant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <LeaseTermsFields
        isCommercial={selected?.type === 'COMMERCIAL'}
        defaultRent={selected?.price}
        defaultCurrency={selected?.currency}
      />

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" asChild>
          <Link href="/leases">{t.common.cancel}</Link>
        </Button>
        <Button type="submit" disabled={pending || !canSubmit}>
          {pending ? t.common.saving : t.leases.create}
        </Button>
      </div>
    </form>
  );
}
