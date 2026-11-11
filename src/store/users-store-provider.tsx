'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useStore } from 'zustand';
import { createUsersStore, type UsersStore, type UsersStoreApi } from './users-store';

/**
 * Context передаёт вниз не сами данные, а экземпляр store.
 * Компоненты подписываются только на нужную часть состояния через селектор,
 * поэтому изменение, например, уведомлений не перерисовывает список.
 */
const UsersStoreContext = createContext<UsersStoreApi | null>(null);

export function UsersStoreProvider({ children }: { children: ReactNode }) {
  // Ленивая инициализация: store создаётся один раз на всё время жизни провайдера
  const [store] = useState(createUsersStore);

  // Гидратация store из sessionStorage — только после первого рендера,
  // чтобы разметка совпала с серверной
  useEffect(() => {
    void store.persist.rehydrate();
  }, [store]);

  return <UsersStoreContext value={store}>{children}</UsersStoreContext>;
}

export function useUsersStore<T>(selector: (state: UsersStore) => T): T {
  const store = useContext(UsersStoreContext);
  if (!store) throw new Error('useUsersStore должен использоваться внутри <UsersStoreProvider>');
  return useStore(store, selector);
}
