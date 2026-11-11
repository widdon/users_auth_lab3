'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useLocalUser } from '@/hooks/useLocalChanges';
import { EmptyState } from '../ui/EmptyState';
import { ArrowLeftIcon, TrashIcon, UsersIcon } from '../ui/Icons';
import { ProfileSkeleton } from '../ui/Skeletons';
import { UserProfile } from './UserProfile';

interface UserDetailsProps {
  id: number;
  /** Есть ли пользователь на сервере (DummyJSON). */
  existsOnServer: boolean;
  /** Профиль, уже отрисованный на сервере. */
  children?: ReactNode;
  /** Дополнительные секции (посты). Скрываются, если пользователь удалён. */
  sections?: ReactNode;
}

/**
 * Выбирает, какую версию профиля показать:
 *  - удалён в этой сессии → сообщение об удалении;
 *  - есть локальная версия (создан или изменён) → профиль из store;
 *  - иначе → серверная разметка из children (без лишнего JS на клиенте).
 */
export function UserDetails({ id, existsOnServer, children, sections }: UserDetailsProps) {
  const local = useLocalUser(id);

  if (local.kind === 'deleted') {
    return (
      <EmptyState
        icon={<TrashIcon className="size-7" />}
        title="Пользователь удалён"
        description="Запись удалена в этой сессии. Чтобы вернуть её, сбросьте локальные изменения."
      >
        <Link href="/users" className="btn btn-primary">
          <ArrowLeftIcon />К списку
        </Link>
      </EmptyState>
    );
  }

  if (local.kind === 'local') {
    return (
      <>
        <UserProfile user={local.user} isLocal />
        {sections}
      </>
    );
  }

  if (existsOnServer) {
    return (
      <>
        {children}
        {sections}
      </>
    );
  }

  // Пользователя нет на сервере: возможно, он создан в этой сессии,
  // но store ещё не прочитан из sessionStorage
  if (local.kind === 'pending') return <ProfileSkeleton />;

  return (
    <EmptyState
      icon={<UsersIcon className="size-7" />}
      title="Пользователь не найден"
      description={`Пользователя с id ${id} нет ни в DummyJSON, ни среди созданных в этой сессии.`}
    >
      <Link href="/users" className="btn btn-primary">
        <ArrowLeftIcon />К списку
      </Link>
    </EmptyState>
  );
}
