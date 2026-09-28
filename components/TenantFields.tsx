'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/lib/i18n/client';
import type { Tenant } from '@/lib/types';

export function TenantFields({ tenant }: { tenant?: Tenant }) {
  const { t } = useI18n();
  const f = t.tenants.fields;

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">{f.name}</Label>
        <Input id="name" name="name" defaultValue={tenant?.name} placeholder={f.namePlaceholder} required maxLength={120} autoComplete="off" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dni">{f.dni}</Label>
          <Input id="dni" name="dni" defaultValue={tenant?.dni} placeholder="45678912" required pattern="[0-9A-Za-z\-]{6,15}" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">{f.phone}</Label>
          <Input id="phone" name="phone" type="tel" defaultValue={tenant?.phone} placeholder="+51 987 654 321" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">{f.email}</Label>
        <Input id="email" name="email" type="email" defaultValue={tenant?.email} placeholder="jane@example.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">{f.address}</Label>
        <Input id="address" name="address" defaultValue={tenant?.address} placeholder={f.addressPlaceholder} required maxLength={200} />
      </div>
    </div>
  );
}
