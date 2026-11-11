import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { ArrowLeftIcon } from '@/components/ui/Icons';
import { EditUserScreen } from '@/components/users/EditUserScreen';
import { requirePageAccess } from '@/lib/auth/session';
import { getUser } from '@/lib/users/api';
import { parseUserId } from '@/lib/users/params';

export const metadata: Metadata = {
  title: 'Редактирование пользователя',
};

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Данные для формы загружаются на сервере, сама форма — клиентский компонент.
 * Доступ проверяется до загрузки данных: анонима — на /login, без прав — «нет доступа».
 */
export default async function EditUserPage({ params }: EditUserPageProps) {
  const id = parseUserId((await params).id);
  if (id === null) notFound();

  const access = await requirePageAccess('user:update', `/users/${id}/edit`);
  const user = access.allowed ? await getUser(id) : null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <Link href={`/users/${id}`} className="btn btn-ghost btn-sm self-start">
        <ArrowLeftIcon />К профилю
      </Link>
      <h1 className="text-2xl font-bold">Редактирование пользователя</h1>
      {access.allowed ? <EditUserScreen id={id} serverUser={user} /> : <AccessDenied />}
    </div>
  );
}
