'use client';

import Link from 'next/link';
import { useLocalUser } from '@/hooks/useLocalChanges';
import type { User } from '@/lib/users/types';
import { EmptyState } from '../ui/EmptyState';
import { ArrowLeftIcon, UsersIcon } from '../ui/Icons';
import { FormSkeleton } from '../ui/Skeletons';
import { UserForm } from './UserForm';

interface EditUserScreenProps {
  id: number;
  /** Версия с сервера или null, если DummyJSON такого пользователя не знает. */
  serverUser: User | null;
}

/** Выбирает, что редактировать: локальную версию из store или версию с сервера. */
export function EditUserScreen({ id, serverUser }: EditUserScreenProps) {
  const local = useLocalUser(id);

  if (local.kind === 'local') {
    // key: при смене версии форма создаётся заново с новыми начальными значениями
    return <UserForm key={`local-${id}`} user={local.user} isLocal={local.isCreated} />;
  }

  if (serverUser && local.kind !== 'deleted') {
    return <UserForm key={`server-${id}`} user={serverUser} />;
  }

  if (local.kind === 'pending') return <FormSkeleton />;

  return (
    <EmptyState
      icon={<UsersIcon className="size-7" />}
      title="Нечего редактировать"
      description={local.kind === 'deleted' ? 'Пользователь удалён в этой сессии.' : `Пользователь с id ${id} не найден.`}
    >
      <Link href="/users" className="btn btn-primary">
        <ArrowLeftIcon />К списку
      </Link>
    </EmptyState>
  );
}
