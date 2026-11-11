import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowLeftIcon } from '@/components/ui/Icons';
import { SectionErrorBoundary } from '@/components/ui/SectionErrorBoundary';
import { PostsSkeleton } from '@/components/ui/Skeletons';
import { UserDetails } from '@/components/users/UserDetails';
import { UserPosts } from '@/components/users/UserPosts';
import { UserProfile } from '@/components/users/UserProfile';
import { DEFAULT_QUERY } from '@/lib/users/query';
import { getUser, getUsersPage } from '@/lib/users/api';
import { getFullName } from '@/lib/users/format';
import { parseUserId } from '@/lib/users/params';

interface UserPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Статическая генерация (SSG) страниц первых пользователей во время сборки.
 * Остальные id рендерятся по первому запросу и тоже кэшируются ('use cache' в getUser).
 */
export async function generateStaticParams() {
  const { users } = await getUsersPage({ ...DEFAULT_QUERY, skip: 0, limit: 12 });
  return users.map((user) => ({ id: String(user.id) }));
}

export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
  const id = parseUserId((await params).id);
  // Тот же вызов, что и в странице: благодаря React.cache запрос к API будет один
  const user = id === null ? null : await getUser(id);
  return { title: user ? getFullName(user) : 'Пользователь' };
}

/**
 * Страница пользователя (динамический маршрут /users/[id]) — серверный компонент.
 * Профиль рендерится на сервере, посты догружаются потоком внутри <Suspense>
 * и защищены собственным error boundary.
 */
export default async function UserPage({ params, searchParams }: UserPageProps) {
  const id = parseUserId((await params).id);
  if (id === null) notFound();

  const user = await getUser(id);

  return (
    <>
      <Link href="/users" className="btn btn-ghost btn-sm self-start">
        <ArrowLeftIcon />К списку
      </Link>

      {/* Если пользователь создан/изменён/удалён в этой сессии, клиентский
          UserDetails покажет локальную версию; иначе — серверную разметку.
          Профиль и секция постов рендерятся на сервере и передаются как props. */}
      <UserDetails
        id={id}
        existsOnServer={user !== null}
        sections={
          user && (
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold">Последние посты</h2>
              <SectionErrorBoundary title="Посты">
                <Suspense fallback={<PostsSkeleton />}>
                  <UserPosts userId={id} searchParams={searchParams} />
                </Suspense>
              </SectionErrorBoundary>
            </section>
          )
        }
      >
        {user && <UserProfile user={user} />}
      </UserDetails>
    </>
  );
}
