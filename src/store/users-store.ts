import { z } from 'zod';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';
import { EMPTY_CHANGES, type LocalChanges } from '@/lib/users/local-changes';
import { userSchema, type User } from '@/lib/users/types';

/**
 * Общее клиентское состояние приложения (Zustand).
 *
 * Что здесь хранится и почему именно в store:
 *  1. Локальные изменения (created / updated / deletedIds). DummyJSON не сохраняет мутации,
 *     поэтому их результат нужно помнить на клиенте и применять и в списке, и на странице
 *     пользователя, и в форме редактирования — компонентам в разных частях дерева.
 *  2. Вид списка (карточки / таблица) — выбирается в панели инструментов, используется в списке.
 *  3. Уведомления — их создают кнопки и формы, а показывает Toaster в layout.
 * Передавать это через props пришлось бы через много уровней (prop drilling).
 *
 * Store создаётся фабрикой, а не на уровне модуля: так рекомендует документация Zustand
 * для Next.js — модульная переменная на сервере была бы общей для всех запросов.
 */

export type ListView = 'grid' | 'table';
export type ToastType = 'success' | 'info' | 'error';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

export interface UsersState extends LocalChanges {
  view: ListView;
  toasts: Toast[];
  /** Данные из sessionStorage уже прочитаны (см. UsersStoreProvider). */
  hasHydrated: boolean;
}

export interface UsersActions {
  /** Добавляет созданного пользователя и возвращает его с уникальным id. */
  addCreated: (user: User) => User;
  applyUpdate: (user: User) => void;
  markDeleted: (id: number) => void;
  /** Откат оптимистичного удаления, если сервер вернул ошибку. */
  restoreDeleted: (id: number) => void;
  resetLocalChanges: () => void;
  isLocalUser: (id: number) => boolean;
  setView: (view: ListView) => void;
  pushToast: (message: string, type?: ToastType) => void;
  dismissToast: (id: number) => void;
  setHasHydrated: () => void;
}

export type UsersStore = UsersState & UsersActions;

let toastCounter = 0;

/**
 * sessionStorage — тоже внешняя граница: данные мог изменить пользователь или
 * старая версия приложения. При восстановлении состояния проверяем их схемой,
 * а при несовпадении просто начинаем с пустых локальных изменений.
 */
const persistedSchema = z.object({
  created: z.array(userSchema),
  updated: z.record(z.string().regex(/^\d+$/), userSchema),
  deletedIds: z.array(z.number().int()),
  view: z.enum(['grid', 'table']),
});

export function createUsersStore() {
  return createStore<UsersStore>()(
    devtools(
      persist(
        (set, get) => ({
          ...EMPTY_CHANGES,
          view: 'grid',
          toasts: [],
          hasHydrated: false,

          addCreated: (user) => {
            // DummyJSON возвращает id = 209 для каждой новой записи, поэтому
            // делаем id уникальным, иначе в списке появятся одинаковые key
            const maxLocalId = get().created.reduce((max, u) => Math.max(max, u.id), 0);
            const stored = { ...user, id: Math.max(user.id, maxLocalId + 1) };
            set((state) => ({ created: [...state.created, stored] }), false, 'users/addCreated');
            return stored;
          },

          applyUpdate: (user) =>
            set(
              (state) =>
                state.created.some((u) => u.id === user.id)
                  ? { created: state.created.map((u) => (u.id === user.id ? { ...u, ...user } : u)) }
                  : { updated: { ...state.updated, [user.id]: user } },
              false,
              'users/applyUpdate',
            ),

          markDeleted: (id) =>
            set(
              (state) => {
                // Созданная локально запись просто удаляется из store
                if (state.created.some((u) => u.id === id)) {
                  return { created: state.created.filter((u) => u.id !== id) };
                }
                const updated = { ...state.updated };
                delete updated[id];
                return {
                  updated,
                  deletedIds: state.deletedIds.includes(id) ? state.deletedIds : [...state.deletedIds, id],
                };
              },
              false,
              'users/markDeleted',
            ),

          restoreDeleted: (id) =>
            set((state) => ({ deletedIds: state.deletedIds.filter((x) => x !== id) }), false, 'users/restoreDeleted'),

          resetLocalChanges: () => set({ ...EMPTY_CHANGES }, false, 'users/reset'),

          isLocalUser: (id) => get().created.some((u) => u.id === id),

          setView: (view) => set({ view }, false, 'ui/setView'),

          pushToast: (message, type = 'success') => {
            toastCounter += 1;
            const toast: Toast = { id: toastCounter, message, type };
            // храним не больше трёх уведомлений
            set((state) => ({ toasts: [...state.toasts.slice(-2), toast] }), false, 'ui/pushToast');
          },

          dismissToast: (id) =>
            set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }), false, 'ui/dismissToast'),

          setHasHydrated: () => set({ hasHydrated: true }, false, 'store/hydrated'),
        }),
        {
          name: 'users-next:store',
          // sessionStorage: изменения живут до закрытия вкладки — как «сессия» работы с API
          storage: createJSONStorage(() => sessionStorage),
          // сохраняем только данные, а не уведомления и служебные флаги
          partialize: (state) => ({
            created: state.created,
            updated: state.updated,
            deletedIds: state.deletedIds,
            view: state.view,
          }),
          // Не читаем storage при создании store: на сервере его нет, и первый рендер
          // на клиенте должен совпасть с серверным HTML. Чтение — в useEffect провайдера.
          skipHydration: true,
          merge: (persisted, current) => {
            const parsed = persistedSchema.safeParse(persisted);
            return parsed.success ? { ...current, ...parsed.data } : current;
          },
          onRehydrateStorage: () => (state) => state?.setHasHydrated(),
        },
      ),
      { name: 'UsersStore', enabled: process.env.NODE_ENV === 'development' },
    ),
  );
}

export type UsersStoreApi = ReturnType<typeof createUsersStore>;
