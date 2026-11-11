'use client';

import { useSession } from 'next-auth/react';
import { can, type AccessRole, type Action } from '@/lib/auth/permissions';

export interface Permissions {
  /** 'loading' — сессия ещё не получена; в это время все действия скрыты. */
  status: 'loading' | 'authenticated' | 'unauthenticated';
  role: AccessRole | null;
  can: (action: Action) => boolean;
}

/**
 * Права текущего пользователя для интерфейса: какие кнопки показать.
 * Это только удобство — настоящая проверка выполняется на сервере.
 * Используется та же функция can(), что и на сервере, поэтому правила не расходятся.
 */
export function usePermissions(): Permissions {
  const { data, status } = useSession();
  const role = status === 'authenticated' ? (data?.user?.role ?? null) : null;
  return { status, role, can: (action) => can(role, action) };
}
