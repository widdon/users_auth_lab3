import type { Metadata } from 'next';
import { UsersExplorer } from '@/components/users/UsersExplorer';
import { getUsersPage } from '@/lib/users/api';
import { PAGE_SIZE } from '@/lib/users/constants';
import { parseUsersQuery } from '@/lib/users/query';

export const metadata: Metadata = {
  title: 'Пользователи',
};

interface UsersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Страница списка — серверный компонент.
 *
 * На сервере: читаем параметры из URL, загружаем первую страницу (getUsersPage кэшируется
 * через 'use cache') и отдаём готовый HTML. Пока данные грузятся, Next.js показывает loading.tsx.
 * На клиенте: UsersExplorer продолжает работу — поиск, фильтры, «Загрузить ещё».
 *
 * ?simulate=error — имитация сбоя, чтобы показать error.tsx.
 */
export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  if (params.simulate === 'error') {
    throw new Error('Не удалось получить список пользователей (симуляция ошибки)');
  }

  const query = parseUsersQuery(params);
  const firstPage = await getUsersPage({ ...query, skip: 0, limit: PAGE_SIZE });

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold">Пользователи</h1>
        <p className="text-base-content/60">
          Данные DummyJSON: просмотр, поиск, добавление, изменение и удаление записей
        </p>
      </div>
      <UsersExplorer initialQuery={query} initialPage={firstPage} />
    </>
  );
}
