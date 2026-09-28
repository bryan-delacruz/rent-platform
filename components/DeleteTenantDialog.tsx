'use client';

import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { deleteTenant } from '@/lib/actions';
import { interpolate } from '@/lib/i18n';
import { useI18n } from '@/lib/i18n/client';

export function DeleteTenantDialog({ tenantId, tenantName }: { tenantId: string; tenantName: string }) {
  const { t } = useI18n();
  return (
    <ConfirmDeleteDialog
      title={t.tenants.deleteTitle}
      description={interpolate(t.tenants.deleteConfirm, { name: tenantName })}
      successMessage={t.tenants.deleted}
      label={`${t.common.delete}: ${tenantName}`}
      onConfirm={() => deleteTenant(tenantId)}
    />
  );
}
