'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionProvider } from 'next-auth/react';
import { useState, type ReactNode } from 'react';
import { UsersStoreProvider } from '@/store/users-store-provider';

/**
 * Клиентские провайдеры. Сам layout остаётся серверным компонентом и просто
 * оборачивает страницу в этот компонент; children при этом по-прежнему
 * рендерятся на сервере — «клиентская граница» не делает клиентским всё дерево ниже,
 * если серверные компоненты переданы через children.
 */
export function Providers({ children }: { children: ReactNode }) {
  // QueryClient создаётся один раз на вкладку (а не на каждый рендер)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    // SessionProvider даёт клиентским компонентам useSession(): сессию он получает
    // запросом к /api/auth/session (cookie httpOnly прочитать из JS нельзя, это делает сервер)
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <UsersStoreProvider>{children}</UsersStoreProvider>
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools buttonPosition="bottom-left" />}
      </QueryClientProvider>
    </SessionProvider>
  );
}
