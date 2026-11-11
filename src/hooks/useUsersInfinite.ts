'use client';

import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { PAGE_SIZE } from '@/lib/users/constants';
import { isSameQuery, toSearchParams, usersKeys, type UsersQuery } from '@/lib/users/query';
import { z } from 'zod';
import { usersPageSchema, type UsersPage } from '@/lib/users/types';

const errorBodySchema = z.object({ message: z.string() });

/** Запрос следующей порции через наш Route Handler /api/users. */
async function fetchUsersPage(query: UsersQuery, skip: number, signal: AbortSignal): Promise<UsersPage> {
  const params = toSearchParams(query);
  params.set('skip', String(skip));
  params.set('limit', String(PAGE_SIZE));

  const response = await fetch(`/api/users?${params}`, { signal });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = errorBodySchema.safeParse(body);
    throw new Error(error.success ? error.data.message : 'Не удалось загрузить пользователей');
  }
  // Ответ сети проверяется схемой, а не приводится через `as UsersPage`
  const page = usersPageSchema.safeParse(body);
  if (!page.success) throw new Error('Сервер вернул список в неожиданном формате');
  return page.data;
}

/** Следующий skip или undefined, если список закончился. */
export function getNextSkip(lastPage: UsersPage): number | undefined {
  const next = lastPage.skip + lastPage.users.length;
  return lastPage.users.length > 0 && next < lastPage.total ? next : undefined;
}

interface InitialData {
  query: UsersQuery;
  page: UsersPage;
}

/**
 * Infinite query для списка пользователей.
 *
 * - Первая страница приходит с сервера (Server Component) и кладётся в кэш как initialData —
 *   клиент не делает повторный запрос после гидратации.
 * - Следующие страницы запрашиваются через /api/users с параметрами skip и limit.
 * - placeholderData: keepPreviousData — при смене поиска/фильтра старый список остаётся
 *   на экране, пока грузится новый (состояние «повторная загрузка при показанных данных»).
 */
export function useUsersInfinite(query: UsersQuery, initial?: InitialData) {
  const initialData =
    initial && isSameQuery(initial.query, query) ? { pages: [initial.page], pageParams: [0] } : undefined;

  return useInfiniteQuery({
    queryKey: usersKeys.list(query),
    queryFn: ({ pageParam, signal }) => fetchUsersPage(query, pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: getNextSkip,
    // Функция, а не значение: для других параметров initialData нет (undefined),
    // и тогда хук честно проходит через состояние pending
    initialData: () => initialData,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}
