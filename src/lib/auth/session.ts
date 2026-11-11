import 'server-only';

import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { cache } from 'react';
import { auth } from '@/auth';
import { can, type AccessRole, type Action } from './permissions';

/**
 * Серверный слой доступа к сессии (Data Access Layer).
 * Все серверные проверки прав идут через эти функции, а не через разрозненные
 * вызовы auth(): так правила в одном месте и их легко проверить.
 */

export interface CurrentUser {
  id: string;
  username: string;
  name: string;
  role: AccessRole;
}

/**
 * Текущий пользователь или null. Auth.js расшифровывает JWT из httpOnly-cookie.
 * React.cache — чтобы в рамках одного запроса cookie разбирался один раз.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  // Сессия своя у каждого запроса: явно отмечаем, что дальше — только время запроса
  // (без этого Next.js попытался бы выполнить расшифровку JWT при пререндеринге)
  await connection();
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    username: session.user.username,
    name: session.user.name ?? session.user.username,
    role: session.user.role,
  };
});

export type AccessResult =
  | { ok: true; user: CurrentUser }
  | { ok: false; status: 401 | 403; message: string };

export const UNAUTHORIZED_MESSAGE = 'Войдите в систему, чтобы выполнить это действие';
export const FORBIDDEN_MESSAGE = 'Недостаточно прав для этого действия';

/**
 * Проверка права для Server Functions и Route Handlers.
 * 401 — пользователь не вошёл (неизвестно, кто это);
 * 403 — пользователь известен, но этой роли действие запрещено.
 */
export async function checkAccess(action: Action): Promise<AccessResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, status: 401, message: UNAUTHORIZED_MESSAGE };
  if (!can(user.role, action)) return { ok: false, status: 403, message: FORBIDDEN_MESSAGE };
  return { ok: true, user };
}

/**
 * Проверка права для страниц. Анонимного пользователя отправляем на /login
 * и после входа возвращаем обратно (callbackUrl). Если вошёл, но прав нет —
 * возвращаем { allowed: false }, и страница показывает сообщение «нет доступа».
 */
export async function requirePageAccess(
  action: Action,
  callbackPath: string,
): Promise<{ allowed: true; user: CurrentUser } | { allowed: false; user: CurrentUser }> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent(callbackPath)}`);
  return can(user.role, action) ? { allowed: true, user } : { allowed: false, user };
}
