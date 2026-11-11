'use client';

import { useTransition } from 'react';
import { deleteUserAction } from '@/app/users/actions';
import { getFullName } from '@/lib/users/format';
import type { User } from '@/lib/users/types';
import { useUsersStore } from '@/store/users-store-provider';

interface DeleteOptions {
  /**
   * true — оптимистичное удаление: запись исчезает из интерфейса сразу,
   * а если сервер ответит ошибкой, возвращается обратно (откат).
   * false — ждём ответа сервера и только потом убираем запись.
   */
  optimistic?: boolean;
}

/** Удаление пользователя через Server Function с оптимистичным обновлением store. */
export function useDeleteUser() {
  const [isPending, startTransition] = useTransition();
  const markDeleted = useUsersStore((s) => s.markDeleted);
  const restoreDeleted = useUsersStore((s) => s.restoreDeleted);
  const isLocalUser = useUsersStore((s) => s.isLocalUser);
  const pushToast = useUsersStore((s) => s.pushToast);

  const deleteUser = (user: User, { optimistic = true }: DeleteOptions = {}) =>
    new Promise<boolean>((resolve) => {
      const name = getFullName(user);

      startTransition(async () => {
        // Пользователя, созданного в этой сессии, в DummyJSON нет — удаляем только локально,
        // но право на удаление всё равно подтверждает сервер
        const local = isLocalUser(user.id);

        if (optimistic) markDeleted(user.id);

        const result = await deleteUserAction(user.id, { local });

        if (result.ok) {
          if (!optimistic) markDeleted(user.id);
          pushToast(`Пользователь ${name} удалён`, 'info');
        } else {
          if (optimistic) restoreDeleted(user.id);
          // 401 — сессия закончилась, 403 — у роли нет права удалять
          const hint = result.code === 'unauthorized' ? ' Войдите заново.' : '';
          pushToast(`Не удалось удалить ${name}: ${result.message}.${hint}`, 'error');
        }
        resolve(result.ok);
      });
    });

  return { deleteUser, isPending };
}
