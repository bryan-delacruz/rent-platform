'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/lib/i18n/client';
import type { Property } from '@/lib/types';

/** Fields shared by the create and edit property forms. */
export function PropertyFields({ property, isOccupied = false }: { property?: Property; isOccupied?: boolean }) {
  const { t } = useI18n();
  const f = t.properties.fields;

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">{f.name}</Label>
        <Input id="name" name="name" defaultValue={property?.name} placeholder={f.namePlaceholder} required maxLength={80} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">{f.type}</Label>
          <Select name="type" required defaultValue={property?.type ?? 'ROOM'}>
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ROOM">{t.propertyType.ROOM}</SelectItem>
              <SelectItem value="COMMERCIAL">{t.propertyType.COMMERCIAL}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">{f.location}</Label>
          <Input id="location" name="location" defaultValue={property?.location} placeholder={f.locationPlaceholder} required maxLength={120} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="floor">{f.floor}</Label>
          <Input id="floor" name="floor" type="number" min={-5} max={200} step={1} defaultValue={property?.floor ?? 1} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">{f.price}</Label>
          <Input id="price" name="price" type="number" min="0.01" step="0.01" defaultValue={property?.price} placeholder="850" required />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="currency">{f.currency}</Label>
          <Select name="currency" required defaultValue={property?.currency ?? 'PEN'}>
            <SelectTrigger id="currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PEN">{t.currency.PEN}</SelectItem>
              <SelectItem value="USD">{t.currency.USD}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {property && (
          <div className="space-y-2">
            <Label htmlFor="status">{f.status}</Label>
            {isOccupied ? (
              <Input id="status" disabled value={t.propertyStatus.occupiedByLease} />
            ) : (
              <Select name="status" defaultValue={property.status === 'MAINTENANCE' ? 'MAINTENANCE' : 'AVAILABLE'}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">{t.propertyStatus.AVAILABLE}</SelectItem>
                  <SelectItem value="MAINTENANCE">{t.propertyStatus.MAINTENANCE}</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
