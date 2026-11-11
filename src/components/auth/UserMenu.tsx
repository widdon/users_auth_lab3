'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useTransition } from 'react';
import { ACCESS_ROLE_LABELS } from '@/lib/auth/permissions';
import { Avatar } from '../ui/Avatar';
import { LogInIcon, LogOutIcon } from '../ui/Icons';

/**
 * Текущий пользователь в шапке: имя и роль либо кнопка «Войти».
 * Данные берутся из useSession() — клиентский SessionProvider получает их
 * с сервера запросом /api/auth/session.
 */
export function UserMenu() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  if (status === 'loading') {
    return <div className="skeleton h-9 w-28" aria-label="Загрузка сессии" />;
  }

  if (!session?.user) {
    if (pathname === '/login') return null;
    const callbackUrl = encodeURIComponent(pathname || '/users');
    return (
      <Link href={`/login?callbackUrl=${callbackUrl}`} className="btn btn-primary btn-sm">
        <LogInIcon />
        Войти
      </Link>
    );
  }

  const { user } = session;
  const name = user.name ?? user.username;

  const handleSignOut = () =>
    startTransition(async () => {
      // signOut удаляет cookie сессии на сервере (POST /api/auth/signout с CSRF-токеном)
      await signOut({ redirectTo: '/users' });
    });

  return (
    <div className="flex items-center gap-2">
      <div className="hidden items-center gap-2 sm:flex" data-testid="current-user">
        <Avatar src={user.image ?? ''} name={name} />
        <div className="leading-tight">
          <p className="max-w-40 truncate text-sm font-medium">{name}</p>
          <p className="text-xs text-base-content/60">{ACCESS_ROLE_LABELS[user.role]}</p>
        </div>
      </div>
      <button type="button" className="btn btn-ghost btn-sm" onClick={handleSignOut} disabled={isPending}>
        {isPending ? <span className="loading loading-spinner loading-xs" /> : <LogOutIcon />}
        Выйти
      </button>
    </div>
  );
}
