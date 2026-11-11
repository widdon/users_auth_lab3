'use server';

import { updateTag } from 'next/cache';
import { checkAccess } from '@/lib/auth/session';
import { USERS_TAG, userTag } from '@/lib/users/api';
import { USER_ROLES } from '@/lib/users/constants';
import { toErrorCode, type ActionResult, type UserFormState } from '@/lib/users/form-state';
import { parseUserId } from '@/lib/users/params';
import { createUserFromInput, deleteUserById, updateUserFromInput } from '@/lib/users/service';
import type { UserRole } from '@/lib/users/types';

/**
 * Server Functions (Server Actions) для мутаций из интерфейса.
 *
 * Директива 'use server' превращает экспортируемые функции в серверные эндпоинты:
 * клиент вызывает их как обычные async-функции, а Next.js отправляет POST-запрос.
 * Это публичные эндпоинты: вызвать их можно и в обход интерфейса, поэтому каждая
 * функция сама проверяет сессию и роль (checkAccess), а все аргументы — заново
 * проверяются Zod-схемами. Скрытая в интерфейсе кнопка защитой не является.
 *
 * После успешной мутации updateTag сбрасывает кэш 'use cache' по тегу.
 */

function fail(status: number, message: string) {
  return { code: toErrorCode(status), message };
}

function isUserRole(value: unknown): value is UserRole {
  return USER_ROLES.some((role) => role === value);
}

export async function createUserAction(_prev: UserFormState, input: unknown): Promise<UserFormState> {
  const access = await checkAccess('user:create');
  if (!access.ok) return { status: 'error', ...fail(access.status, access.message) };

  const result = await createUserFromInput(access.user, input);
  if (!result.ok) return { status: 'error', ...fail(result.status, result.message), fieldErrors: result.fieldErrors };

  updateTag(USERS_TAG);
  return { status: 'success', user: result.data };
}

/**
 * @param local если запись существует только на клиенте — её прежняя роль
 *              (нужна для правила «роль администратора назначает только администратор»)
 */
export async function updateUserAction(
  id: unknown,
  local: { previousRole: unknown } | null,
  _prev: UserFormState,
  input: unknown,
): Promise<UserFormState> {
  const access = await checkAccess('user:update');
  if (!access.ok) return { status: 'error', ...fail(access.status, access.message) };

  const userId = parseUserId(id);
  if (userId === null) return { status: 'error', ...fail(400, 'Некорректный идентификатор пользователя') };

  const previousRole = local && isUserRole(local.previousRole) ? local.previousRole : 'user';
  const result = await updateUserFromInput(access.user, userId, input, { local: local ? { previousRole } : undefined });
  if (!result.ok) return { status: 'error', ...fail(result.status, result.message), fieldErrors: result.fieldErrors };

  if (!local) {
    updateTag(USERS_TAG);
    updateTag(userTag(userId));
  }
  return { status: 'success', user: result.data };
}

export async function deleteUserAction(id: unknown, options?: { local?: unknown }): Promise<ActionResult> {
  // Удаление — только для администратора. Проверка здесь, а не только в интерфейсе
  const access = await checkAccess('user:delete');
  if (!access.ok) return { ok: false, ...fail(access.status, access.message) };

  const userId = parseUserId(id);
  if (userId === null) return { ok: false, ...fail(400, 'Некорректный идентификатор пользователя') };

  const local = options?.local === true;
  const result = await deleteUserById(access.user, userId, { local });
  if (!result.ok) return { ok: false, ...fail(result.status, result.message) };

  if (!local) {
    updateTag(USERS_TAG);
    updateTag(userTag(userId));
  }
  return { ok: true };
}
