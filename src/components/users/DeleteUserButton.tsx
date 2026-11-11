'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDeleteUser } from '@/hooks/useDeleteUser';
import { getFullName } from '@/lib/users/format';
import type { User } from '@/lib/users/types';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { TrashIcon } from '../ui/Icons';

interface DeleteUserButtonProps {
  user: User;
  /**
   * card — кнопка в карточке списка: оптимистичное удаление, окно закрывается сразу.
   * page — кнопка на странице пользователя: ждём ответа сервера, затем переходим к списку.
   */
  variant?: 'card' | 'page';
}

/**
 * Клиентский «островок» внутри серверной разметки: кнопка, диалог подтверждения
 * и вызов Server Function. Пропс user сериализуется и передаётся с сервера.
 */
export function DeleteUserButton({ user, variant = 'card' }: DeleteUserButtonProps) {
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const { deleteUser, isPending } = useDeleteUser();
  const router = useRouter();
  const isPage = variant === 'page';

  const handleConfirm = async () => {
    if (!isPage) {
      setConfirmOpen(false);
      await deleteUser(user, { optimistic: true });
      return;
    }
    const ok = await deleteUser(user, { optimistic: false });
    setConfirmOpen(false);
    if (ok) router.push('/users');
  };

  return (
    <>
      <button
        type="button"
        className={isPage ? 'btn btn-outline btn-error btn-sm' : 'btn btn-ghost btn-sm text-error'}
        onClick={() => setConfirmOpen(true)}
        disabled={isPending}
      >
        {isPending ? <span className="loading loading-spinner loading-xs" /> : <TrashIcon />}
        Удалить
      </button>

      {isConfirmOpen && (
        <ConfirmDialog
          title="Удалить пользователя?"
          message={
            <>
              Пользователь <b>{getFullName(user)}</b> (@{user.username}) будет удалён. DummyJSON только имитирует
              удаление, поэтому после перезагрузки данных с сервера запись вернётся.
            </>
          }
          confirmLabel="Удалить"
          pendingLabel="Удаление…"
          isPending={isPending}
          onConfirm={handleConfirm}
          onClose={() => setConfirmOpen(false)}
        />
      )}
    </>
  );
}
