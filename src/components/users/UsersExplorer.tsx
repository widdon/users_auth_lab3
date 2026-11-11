'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { usePermissions } from '@/hooks/usePermissions';
import { useLocalChanges } from '@/hooks/useLocalChanges';
import { useUsersInfinite } from '@/hooks/useUsersInfinite';
import { applyLocalChanges, flattenPages } from '@/lib/users/local-changes';
import { DEFAULT_QUERY, isDefaultQuery, toSearchParams, type SortKey, type UsersQuery } from '@/lib/users/query';
import type { UserRole, UsersPage } from '@/lib/users/types';
import { useUsersStore } from '@/store/users-store-provider';
import { EmptyState } from '../ui/EmptyState';
import { AlertIcon, CloudOffIcon, FilterXIcon, PlusIcon, SearchIcon, UsersIcon } from '../ui/Icons';
import { UserCardSkeleton, UsersGridSkeleton } from '../ui/Skeletons';
import { UserCard } from './UserCard';
import { UsersTable } from './UsersTable';
import { UsersToolbar } from './UsersToolbar';

interface UsersExplorerProps {
  /** Параметры из URL и первая страница данных — получены на сервере. */
  initialQuery: UsersQuery;
  initialPage: UsersPage;
}

/**
 * Интерактивная часть страницы списка: поиск, фильтры, infinite query.
 * Первая страница приходит готовой с сервера, поэтому пользователь сразу видит данные,
 * а дальше список «оживает» на клиенте (гидратация).
 */
export function UsersExplorer({ initialQuery, initialPage }: UsersExplorerProps) {
  const [searchText, setSearchText] = useState(initialQuery.q);
  const [role, setRole] = useState<UserRole | 'all'>(initialQuery.role);
  const [sort, setSort] = useState<SortKey>(initialQuery.sort);

  // Поиск применяется с задержкой, а очистка поля — сразу
  const debouncedText = useDebounce(searchText.trim(), 400);
  const q = searchText.trim() === '' ? '' : debouncedText;
  const query = useMemo<UsersQuery>(() => ({ q, role: q ? 'all' : role, sort }), [q, role, sort]);

  // Синхронизируем URL без серверной навигации: ссылкой на отфильтрованный список
  // можно поделиться, а данные при этом подгружаются на клиенте через Route Handler
  useEffect(() => {
    const params = toSearchParams(query).toString();
    window.history.replaceState(null, '', params ? `?${params}` : window.location.pathname);
  }, [query]);

  const {
    data,
    status,
    error,
    isFetching,
    isFetchingNextPage,
    isFetchNextPageError,
    isPlaceholderData,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useUsersInfinite(query, { query: initialQuery, page: initialPage });

  const changes = useLocalChanges();
  const { can } = usePermissions();
  const view = useUsersStore((s) => s.view);

  const serverUsers = useMemo(() => flattenPages(data?.pages ?? []), [data]);
  const users = useMemo(() => applyLocalChanges(serverUsers, changes, query), [serverUsers, changes, query]);
  const localIds = useMemo(
    () => new Set([...changes.created.map((u) => u.id), ...Object.keys(changes.updated).map(Number)]),
    [changes],
  );

  const total = data?.pages[0]?.total ?? 0;
  // Повторная загрузка, когда на экране уже есть данные: смена фильтра или обновление
  const isRefreshing = (isFetching && !isFetchingNextPage) || isPlaceholderData;

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    if (value.trim()) setRole('all');
  };
  const handleRoleChange = (value: UserRole | 'all') => {
    setRole(value);
    if (value !== 'all') setSearchText('');
  };
  const handleReset = () => {
    setSearchText(DEFAULT_QUERY.q);
    setRole(DEFAULT_QUERY.role);
    setSort(DEFAULT_QUERY.sort);
  };

  const renderContent = () => {
    // 1. Первая загрузка для нового набора параметров (данных ещё нет)
    if (status === 'pending') return <UsersGridSkeleton />;

    // 2. Ошибка, а показать нечего
    if (status === 'error' && users.length === 0) {
      return (
        <EmptyState
          tone="error"
          icon={<CloudOffIcon className="size-7" />}
          title="Не удалось загрузить пользователей"
          description={error?.message}
        >
          <button type="button" className="btn btn-primary" onClick={() => refetch()}>
            Повторить
          </button>
        </EmptyState>
      );
    }

    // 3. Успешный, но пустой результат — нейтральное оформление, это не ошибка
    if (users.length === 0) {
      return isDefaultQuery(query) ? (
        <EmptyState icon={<UsersIcon className="size-7" />} title="Пользователей пока нет">
          {can('user:create') && (
            <Link href="/users/new" className="btn btn-primary">
              <PlusIcon />
              Добавить пользователя
            </Link>
          )}
        </EmptyState>
      ) : (
        <EmptyState
          icon={<SearchIcon className="size-7" />}
          title="Никого не нашли"
          description="Попробуйте изменить запрос или сбросить фильтры."
        >
          <button type="button" className="btn btn-ghost" onClick={handleReset}>
            <FilterXIcon />
            Сбросить фильтры
          </button>
        </EmptyState>
      );
    }

    // 4. Данные получены
    return (
      <div className="flex flex-col gap-4">
        <div
          className={`relative transition-opacity ${isRefreshing ? 'pointer-events-none opacity-60' : ''}`}
          aria-busy={isRefreshing}
        >
          {view === 'grid' ? (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {/* key — стабильный id записи, а не индекс: порядок меняется при сортировке и удалении */}
              {users.map((user) => (
                <li key={user.id}>
                  <UserCard user={user} isLocal={localIds.has(user.id)} />
                </li>
              ))}
              {isFetchingNextPage &&
                Array.from({ length: 3 }, (_, i) => (
                  <li key={`skeleton-${i}`}>
                    <UserCardSkeleton />
                  </li>
                ))}
            </ul>
          ) : (
            <UsersTable users={users} localIds={localIds} />
          )}
        </div>

        {isFetchNextPageError && (
          <div role="alert" className="alert alert-error alert-soft">
            <AlertIcon />
            <span>Не удалось загрузить следующую часть списка.</span>
            <button type="button" className="btn btn-sm" onClick={() => fetchNextPage()}>
              Повторить
            </button>
          </div>
        )}

        <div className="flex flex-col items-center gap-2 py-2">
          {hasNextPage ? (
            <button
              type="button"
              className="btn btn-outline btn-wide"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage || isRefreshing}
            >
              {isFetchingNextPage && <span className="loading loading-spinner loading-sm" />}
              {isFetchingNextPage ? 'Загрузка…' : 'Загрузить ещё'}
            </button>
          ) : (
            <p className="text-sm text-base-content/50">Это все пользователи по текущему запросу</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <UsersToolbar
        searchText={searchText}
        role={query.role}
        sort={sort}
        onSearchTextChange={handleSearchChange}
        onRoleChange={handleRoleChange}
        onSortChange={setSort}
        onReset={handleReset}
        onRefresh={() => refetch()}
        canReset={!isDefaultQuery(query) || searchText !== ''}
        isRefreshing={isRefreshing}
      />

      <div className="flex min-h-6 items-center justify-between gap-2 text-sm text-base-content/60">
        <span>
          {status === 'success' && (
            <>
              Показано <b className="text-base-content">{users.length}</b> · найдено на сервере: {total}
            </>
          )}
        </span>
        {isRefreshing && status === 'success' && (
          <span className="badge badge-ghost gap-2">
            <span className="loading loading-spinner loading-xs" />
            Обновление…
          </span>
        )}
      </div>

      {renderContent()}
    </div>
  );
}
