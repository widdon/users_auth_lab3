'use client';

import Link from 'next/link';
import { usePermissions } from '@/hooks/usePermissions';
import type { User } from '@/lib/users/types';
import { PencilIcon } from '../ui/Icons';
import { DeleteUserButton } from './DeleteUserButton';

interface UserActionsProps {
  user: User;
  /** card — карточка в списке, table — строка таблицы, page — страница профиля. */
  variant?: 'card' | 'table' | 'page';
}

/**
 * Действия над записью с учётом прав: «Изменить» — для вошедших пользователей,
 * «Удалить» — только для администратора. Недоступные действия не показываются вовсе.
 * Сервер всё равно проверит права ещё раз при вызове Server Function.
 */
export function UserActions({ user, variant = 'card' }: UserActionsProps) {
  const { can } = usePermissions();
  const canEdit = can('user:update');
  const canDelete = can('user:delete');

  if (!canEdit && !canDelete) return null;

  const editClass = {
    card: 'btn btn-ghost btn-sm',
    table: 'btn btn-ghost btn-sm btn-square',
    page: 'btn btn-primary btn-sm',
  }[variant];

  return (
    <>
      {canEdit && (
        <Link href={`/users/${user.id}/edit`} className={editClass} aria-label={variant === 'table' ? 'Изменить' : undefined}>
          <PencilIcon />
          {variant !== 'table' && 'Изменить'}
        </Link>
      )}
      {canDelete && <DeleteUserButton user={user} variant={variant === 'page' ? 'page' : 'card'} />}
    </>
  );
}
