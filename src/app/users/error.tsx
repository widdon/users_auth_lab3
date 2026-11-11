'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { startTransition, useEffect } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { CloudOffIcon, RefreshIcon } from '@/components/ui/Icons';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Граница ошибок для раздела /users (обязательно клиентский компонент).
 * Ловит ошибки рендера страниц /users, /users/[id], /users/new и т. д.
 * Header и layout продолжают работать — заменяется только содержимое раздела.
 */
export default function UsersError({ error, reset }: ErrorPageProps) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  const retry = () =>
    // Ошибка серверного компонента: нужно заново запросить данные (refresh)
    // и сбросить состояние границы ошибок (reset)
    startTransition(() => {
      router.refresh();
      reset();
    });

  return (
    <EmptyState
      tone="error"
      icon={<CloudOffIcon className="size-7" />}
      title="Что-то пошло не так"
      description={error.message || 'Не удалось загрузить данные. Попробуйте ещё раз.'}
    >
      <button type="button" className="btn btn-primary" onClick={retry}>
        <RefreshIcon />
        Повторить
      </button>
      <Link href="/users" className="btn btn-ghost">
        К списку
      </Link>
    </EmptyState>
  );
}
