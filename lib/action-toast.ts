'use client';

import { toast } from 'sonner';
import type { Dictionary } from '@/lib/i18n';
import type { ActionResult } from '@/lib/types';

/** Shows the translated outcome of a server action; returns whether it worked. */
export function notify<T>(result: ActionResult<T>, t: Dictionary, success?: string): result is { ok: true; data: T } {
  if (result.ok) {
    if (success) toast.success(success);
    return true;
  }
  toast.error(t.errors[result.error]);
  return false;
}
