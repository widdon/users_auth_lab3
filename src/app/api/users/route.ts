import { revalidateTag } from 'next/cache';
import { checkAccess } from '@/lib/auth/session';
import { ApiError, getUsersPage, USERS_TAG } from '@/lib/users/api';
import { MAX_PAGE_SIZE, PAGE_SIZE } from '@/lib/users/constants';
import { accessDenied, fromServiceResult, jsonError, readJsonBody } from '@/lib/users/http';
import { intParam } from '@/lib/users/params';
import { parseUsersQuery } from '@/lib/users/query';
import { createUserFromInput } from '@/lib/users/service';

/**
 * Route Handler /api/users — HTTP API приложения поверх DummyJSON.
 *
 * GET  /api/users?q=&role=&sort=&skip=&limit=  — страница списка (доступно всем)
 * POST /api/users                                — создание (нужен вход: иначе 401)
 *
 * Параметры запроса разбираются Zod-схемами (usersQuerySchema, intParam),
 * тело POST — той же схемой, что и форма.
 */

const skipSchema = intParam(0, 10_000, 0);
const limitSchema = intParam(1, MAX_PAGE_SIZE, PAGE_SIZE);

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const query = parseUsersQuery(searchParams);
  const skip = skipSchema.parse(searchParams.get('skip') ?? undefined);
  const limit = limitSchema.parse(searchParams.get('limit') ?? undefined);

  try {
    const page = await getUsersPage({ ...query, skip, limit });
    return Response.json(page);
  } catch (error) {
    if (error instanceof ApiError) return jsonError(error.status, error.message);
    return jsonError(500, 'Не удалось получить список пользователей');
  }
}

export async function POST(request: Request) {
  const access = await checkAccess('user:create');
  if (!access.ok) return accessDenied(access);

  const body = await readJsonBody(request);
  const result = await createUserFromInput(access.user, body);

  // В Route Handler используется revalidateTag (stale-while-revalidate),
  // updateTag доступен только внутри Server Functions
  if (result.ok) revalidateTag(USERS_TAG, 'max');
  return fromServiceResult(result, 201);
}
