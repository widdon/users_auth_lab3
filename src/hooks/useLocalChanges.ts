'use client';

import { useShallow } from 'zustand/react/shallow';
import type { LocalChanges } from '@/lib/users/local-changes';
import type { User } from '@/lib/users/types';
import { useUsersStore } from '@/store/users-store-provider';

/**
 * Локальные изменения из store.
 * useShallow: селектор возвращает новый объект, и без поверхностного сравнения
 * компонент перерисовывался бы при любом изменении store.
 */
export function useLocalChanges(): LocalChanges {
  return useUsersStore(
    useShallow((state) => ({ created: state.created, updated: state.updated, deletedIds: state.deletedIds })),
  );
}

export type LocalUserState =
  | { kind: 'pending' } // store ещё не прочитан из sessionStorage
  | { kind: 'deleted' }
  | { kind: 'local'; user: User; isCreated: boolean }
  | { kind: 'none' };

/** Есть ли у пользователя с данным id локальная версия (создан, изменён или удалён в этой сессии). */
export function useLocalUser(id: number): LocalUserState {
  const hasHydrated = useUsersStore((s) => s.hasHydrated);
  const created = useUsersStore((s) => s.created.find((u) => u.id === id));
  const updated = useUsersStore((s) => s.updated[id]);
  const isDeleted = useUsersStore((s) => s.deletedIds.includes(id));

  if (!hasHydrated) return { kind: 'pending' };
  if (isDeleted) return { kind: 'deleted' };
  if (created) return { kind: 'local', user: created, isCreated: true };
  if (updated) return { kind: 'local', user: updated, isCreated: false };
  return { kind: 'none' };
}
