'use client';

import { useLocalChanges } from '@/hooks/useLocalChanges';
import { countLocalChanges } from '@/lib/users/local-changes';
import { useUsersStore } from '@/store/users-store-provider';
import { RotateIcon } from '../ui/Icons';

/**
 * Индикатор локальных изменений в шапке.
 * Шапка — серверный компонент, а этот «островок» читает store: так шапка и список,
 * находящиеся в разных частях дерева, видят одно и то же состояние без prop drilling.
 */
export function LocalChangesBadge() {
  const changes = useLocalChanges();
  const hasHydrated = useUsersStore((s) => s.hasHydrated);
  const reset = useUsersStore((s) => s.resetLocalChanges);
  const pushToast = useUsersStore((s) => s.pushToast);

  const count = countLocalChanges(changes);
  if (!hasHydrated || count === 0) return null;

  return (
    <div className="flex items-center gap-1">
      <span className="badge badge-warning badge-soft hidden sm:inline-flex" title="Создано, изменено и удалено в этой сессии">
        Локальных изменений: {count}
      </span>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => {
          reset();
          pushToast('Локальные изменения сброшены — показаны данные DummyJSON', 'info');
        }}
        title="Сбросить локальные изменения"
      >
        <RotateIcon />
        <span className="hidden md:inline">Сбросить</span>
      </button>
    </div>
  );
}
