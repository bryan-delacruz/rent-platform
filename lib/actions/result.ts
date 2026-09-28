import 'server-only';
import { Prisma } from '@prisma/client';
import type { ActionErrorCode, ActionResult } from '@/lib/types';

export class ActionError extends Error {
  constructor(public readonly code: ActionErrorCode) {
    super(code);
  }
}

export const ok = <T = undefined>(data?: T): ActionResult<T> => ({ ok: true, data: data as T });

export const fail = (error: ActionErrorCode, fields?: string[]): ActionResult<never> => ({
  ok: false,
  error,
  fields,
});

/**
 * Runs a mutation and turns expected failures into translated error codes.
 * Unexpected errors are logged and reported as `unknown` without leaking details.
 */
export async function run<T>(mutation: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    return await mutation();
  } catch (error) {
    if (error instanceof ActionError) return fail(error.code);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') return fail('duplicateDni');
      if (error.code === 'P2025') return fail('notFound');
    }
    console.error('[action] unexpected error', error);
    return fail('unknown');
  }
}
