import { revalidateTag } from 'next/cache';
import { checkAccess } from '@/lib/auth/session';
import { getUser, USERS_TAG, userTag } from '@/lib/users/api';
import { accessDenied, fromServiceResult, jsonError, readJsonBody } from '@/lib/users/http';
import { parseUserId } from '@/lib/users/params';
import { deleteUserById, updateUserFromInput } from '@/lib/users/service';

/**
 * Route Handler /api/users/:id
 *
 * GET    — получить пользователя (доступно всем)
 * PATCH  — изменить часть полей (нужен вход: 401; тело проверяет userUpdateSchema)
 * DELETE — удалить (только администратор: 401 без входа, 403 для обычного пользователя)
 */

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function readId(context: RouteContext): Promise<number | null> {
  const { id } = await context.params;
  return parseUserId(id);
}

export async function GET(_request: Request, context: RouteContext) {
  const id = await readId(context);
  if (id === null) return jsonError(400, 'Некорректный идентификатор');

  try {
    const user = await getUser(id);
    return user ? Response.json(user) : jsonError(404, `Пользователь с id ${id} не найден`);
  } catch {
    return jsonError(502, 'Не удалось получить пользователя');
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  // Сначала доступ, потом всё остальное: анониму не сообщаем даже, есть ли такая запись
  const access = await checkAccess('user:update');
  if (!access.ok) return accessDenied(access);

  const id = await readId(context);
  if (id === null) return jsonError(400, 'Некорректный идентификатор');

  const result = await updateUserFromInput(access.user, id, await readJsonBody(request), { partial: true });
  if (result.ok) {
    revalidateTag(USERS_TAG, 'max');
    revalidateTag(userTag(id), 'max');
  }
  return fromServiceResult(result);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const access = await checkAccess('user:delete');
  if (!access.ok) return accessDenied(access);

  const id = await readId(context);
  if (id === null) return jsonError(400, 'Некорректный идентификатор');

  const result = await deleteUserById(access.user, id);
  if (result.ok) {
    revalidateTag(USERS_TAG, 'max');
    revalidateTag(userTag(id), 'max');
  }
  return fromServiceResult(result);
}
