import 'server-only';

import type { AccessResult } from '../auth/session';
import type { ServiceResult } from './service';

/** Общие помощники для Route Handlers: единый формат ответов и ошибок. */

export function jsonError(status: number, message: string, extra?: Record<string, unknown>): Response {
  return Response.json({ message, ...extra }, { status });
}

export function fromServiceResult<T>(result: ServiceResult<T>, successStatus = 200): Response {
  if (result.ok) return Response.json(result.data, { status: successStatus });
  return jsonError(result.status, result.message, result.fieldErrors ? { fieldErrors: result.fieldErrors } : undefined);
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

/**
 * Ответ на запрещённый запрос. Для 401 добавляем заголовок WWW-Authenticate,
 * как требует спецификация HTTP: клиент узнаёт, что нужно аутентифицироваться.
 */
export function accessDenied(access: Extract<AccessResult, { ok: false }>): Response {
  const response = jsonError(access.status, access.message);
  if (access.status === 401) response.headers.set('WWW-Authenticate', 'Session realm="users"');
  return response;
}
