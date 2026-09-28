'use client';

import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n/client';
import type { LeaseStatus, PaymentStatus, PropertyStatus } from '@/lib/types';

const paymentVariant = {
  PAID: 'default',
  PARTIAL: 'outline',
  OVERDUE: 'destructive',
  PENDING: 'secondary',
} as const;

const leaseVariant = {
  ACTIVE: 'default',
  TERMINATED: 'destructive',
  EXPIRED: 'secondary',
  DRAFT: 'outline',
} as const;

const propertyVariant = {
  OCCUPIED: 'default',
  AVAILABLE: 'success',
  MAINTENANCE: 'warning',
} as const;

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { t } = useI18n();
  return <Badge variant={paymentVariant[status]}>{t.paymentStatus[status]}</Badge>;
}

export function LeaseStatusBadge({ status }: { status: LeaseStatus }) {
  const { t } = useI18n();
  return <Badge variant={leaseVariant[status]}>{t.leaseStatus[status]}</Badge>;
}

export function PropertyStatusBadge({ status }: { status: PropertyStatus }) {
  const { t } = useI18n();
  return <Badge variant={propertyVariant[status]}>{t.propertyStatus[status]}</Badge>;
}
