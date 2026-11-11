'use client';

import Link from 'next/link';
import { usePermissions } from '@/hooks/usePermissions';
import { ROLES, ROLE_LABELS } from '@/lib/users/constants';
import { roleFilterSchema, SORT_KEYS, SORT_LABELS, sortKeySchema, type SortKey } from '@/lib/users/query';
import type { UserRole } from '@/lib/users/types';
import { useUsersStore } from '@/store/users-store-provider';
import { FilterXIcon, GridIcon, ListIcon, PlusIcon, RefreshIcon, SearchIcon } from '../ui/Icons';

interface UsersToolbarProps {
  searchText: string;
  role: UserRole | 'all';
  sort: SortKey;
  onSearchTextChange: (value: string) => void;
  onRoleChange: (role: UserRole | 'all') => void;
  onSortChange: (sort: SortKey) => void;
  onReset: () => void;
  onRefresh: () => void;
  canReset: boolean;
  isRefreshing: boolean;
}

/**
 * Панель поиска и фильтров. Управляемый компонент: значения приходят из props,
 * изменения уходят в родителя через колбэки. Вид списка (карточки/таблица)
 * берётся из store — он нужен и здесь, и в самом списке.
 */
export function UsersToolbar({
  searchText,
  role,
  sort,
  onSearchTextChange,
  onRoleChange,
  onSortChange,
  onReset,
  onRefresh,
  canReset,
  isRefreshing,
}: UsersToolbarProps) {
  const { can } = usePermissions();
  const view = useUsersStore((s) => s.view);
  const setView = useUsersStore((s) => s.setView);

  return (
    <section className="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="input w-full lg:max-w-sm">
          <SearchIcon className="size-4 opacity-50" />
          <input
            type="search"
            placeholder="Имя, логин, email…"
            value={searchText}
            onChange={(e) => onSearchTextChange(e.target.value)}
            aria-label="Поиск пользователей"
          />
        </label>

        <div className="grid grid-cols-2 gap-3 lg:flex">
          <select
            className="select w-full lg:w-44"
            value={role}
            onChange={(e) => onRoleChange(roleFilterSchema.parse(e.target.value))}
            aria-label="Фильтр по роли"
          >
            <option value="all">Все роли</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>

          <select
            className="select w-full lg:w-44"
            value={sort}
            onChange={(e) => onSortChange(sortKeySchema.parse(e.target.value))}
            aria-label="Сортировка"
          >
            {SORT_KEYS.map((key) => (
              <option key={key} value={key}>
                {SORT_LABELS[key]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 lg:ml-auto">
          <div className="join" role="group" aria-label="Вид списка">
            {(
              [
                ['grid', 'Карточки', GridIcon],
                ['table', 'Таблица', ListIcon],
              ] as const
            ).map(([value, label, Icon]) => (
              <button
                key={value}
                type="button"
                className={`btn join-item btn-sm ${view === value ? 'btn-active' : ''}`}
                onClick={() => setView(value)}
                aria-pressed={view === value}
                title={label}
              >
                <Icon />
              </button>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-square btn-ghost btn-sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Обновить данные"
            aria-label="Обновить данные"
          >
            <RefreshIcon className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Создавать записи можно только после входа — анониму кнопку не показываем */}
          {can('user:create') && (
            <Link href="/users/new" className="btn btn-primary btn-sm ml-auto lg:ml-0">
              <PlusIcon />
              Добавить
            </Link>
          )}
        </div>
      </div>

      <div className="mt-3 flex min-h-6 flex-wrap items-center justify-between gap-2 text-xs text-base-content/60">
        <span>DummyJSON не совмещает поиск и фильтр: выбор роли очищает поиск, и наоборот.</span>
        {canReset && (
          <button type="button" className="btn btn-ghost btn-xs" onClick={onReset}>
            <FilterXIcon className="size-3.5" />
            Сбросить фильтры
          </button>
        )}
      </div>
    </section>
  );
}
