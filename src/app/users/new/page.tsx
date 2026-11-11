import type { Metadata } from 'next';
import Link from 'next/link';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { ArrowLeftIcon } from '@/components/ui/Icons';
import { UserForm } from '@/components/users/UserForm';
import { requirePageAccess } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Новый пользователь',
};

/**
 * Страница закрыта от анонимного пользователя. Proxy уже перенаправил бы анонима
 * на /login, но страница проверяет доступ сама — на proxy не полагаемся.
 * Чтение сессии (cookie) делает страницу динамической; пока идёт проверка,
 * показывается loading.tsx.
 */
export default async function NewUserPage() {
  const access = await requirePageAccess('user:create', '/users/new');

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <Link href="/users" className="btn btn-ghost btn-sm self-start">
        <ArrowLeftIcon />К списку
      </Link>
      <h1 className="text-2xl font-bold">Новый пользователь</h1>
      {access.allowed ? <UserForm /> : <AccessDenied />}
    </div>
  );
}
