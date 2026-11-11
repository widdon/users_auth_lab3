import type { FieldErrors } from './schema';
import type { User } from './types';

/**
 * Почему запрос отклонён: 401 — не вошёл (или сессия истекла), 403 — не хватает прав,
 * 422 — данные не прошли проверку. Клиент по коду решает, что показать.
 */
export type ErrorCode = 'unauthorized' | 'forbidden' | 'invalid' | 'failed';

export function toErrorCode(status: number): ErrorCode {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 400 || status === 422) return 'invalid';
  return 'failed';
}

/** Состояние формы, которое возвращают Server Functions (для useActionState). */
export type UserFormState =
  | { status: 'idle' }
  | { status: 'success'; user: User }
  | { status: 'error'; code: ErrorCode; message: string; fieldErrors?: FieldErrors };

export const IDLE_FORM_STATE: UserFormState = { status: 'idle' };

/** Результат простой мутации без формы (удаление). */
export type ActionResult = { ok: true } | { ok: false; code: ErrorCode; message: string };
