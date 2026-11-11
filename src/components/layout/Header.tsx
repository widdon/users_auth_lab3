import Link from 'next/link';
import { Suspense } from 'react';
import { UserMenu } from '../auth/UserMenu';
import { UsersIcon } from '../ui/Icons';
import { ThemeToggle } from '../ui/ThemeToggle';
import { LocalChangesBadge } from './LocalChangesBadge';

/**
 * Шапка — серверный компонент: статичная разметка рендерится один раз на сервере.
 * Интерактивные части (тема, счётчик локальных изменений, меню пользователя) — отдельные клиентские компоненты.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-base-300 bg-base-100/90 backdrop-blur">
      <div className="navbar mx-auto max-w-7xl gap-2 px-4">
        <Link href="/users" className="flex flex-1 items-center gap-3">
          <span className="grid size-10 place-items-center rounded-field bg-primary text-primary-content">
            <UsersIcon className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-bold">Users</span>
            <span className="hidden text-xs text-base-content/60 sm:block">Next.js · DummyJSON</span>
          </span>
        </Link>

        <LocalChangesBadge />
        <ThemeToggle />
        {/* UserMenu читает адрес страницы (usePathname) — это известно только при запросе,
            поэтому в статической оболочке на его месте заглушка, а меню приходит потоком */}
        <Suspense fallback={<div className="skeleton h-9 w-28" />}>
          <UserMenu />
        </Suspense>
      </div>
    </header>
  );
}
