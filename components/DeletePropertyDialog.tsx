'use client';

import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { deleteProperty } from '@/lib/actions';
import { interpolate } from '@/lib/i18n';
import { useI18n } from '@/lib/i18n/client';

export function DeletePropertyDialog({ propertyId, propertyName }: { propertyId: string; propertyName: string }) {
  const { t } = useI18n();
  return (
    <ConfirmDeleteDialog
      title={t.properties.deleteTitle}
      description={interpolate(t.properties.deleteConfirm, { name: propertyName })}
      successMessage={t.properties.deleted}
      label={`${t.common.delete}: ${propertyName}`}
      onConfirm={() => deleteProperty(propertyId)}
    />
  );
}
