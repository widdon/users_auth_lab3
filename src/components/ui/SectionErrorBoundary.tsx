'use client';

import { useRouter } from 'next/navigation';
import { startTransition, type ReactNode } from 'react';
import { EmptyState } from './EmptyState';
import { ErrorBoundary } from './ErrorBoundary';
import { AlertIcon, RefreshIcon } from './Icons';

interface SectionErrorBoundaryProps {
  title: string;
  children: ReactNode;
}

/**
 * Обёртка над ErrorBoundary для секций страницы.
 * Функцию fallback нельзя передать из серверного компонента (функции не сериализуются),
 * поэтому разметка запасного варианта задаётся здесь, в клиентском компоненте.
 */
export function SectionErrorBoundary({ title, children }: SectionErrorBoundaryProps) {
  const router = useRouter();

  return (
    <ErrorBoundary
      fallback={({ error, reset }) => (
        <EmptyState
          compact
          tone="error"
          icon={<AlertIcon className="size-6" />}
          title={`Не удалось загрузить: ${title.toLowerCase()}`}
          description={error.message || 'Остальная часть страницы работает.'}
        >
          <button
            type="button"
            className="btn btn-sm"
            onClick={() =>
              // Заново запрашиваем серверные данные страницы и сбрасываем ошибку
              startTransition(() => {
                router.refresh();
                reset();
              })
            }
          >
            <RefreshIcon />
            Повторить
          </button>
        </EmptyState>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
