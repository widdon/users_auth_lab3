import { matchesQuery, type UsersQuery } from './query';
import type { User, UsersPage } from './types';

/**
 * DummyJSON имитирует создание, изменение и удаление, но ничего не сохраняет.
 * Поэтому результаты успешных мутаций хранятся на клиенте (Zustand store)
 * и накладываются на данные, пришедшие с сервера. Здесь — чистые функции для этого.
 */
export interface LocalChanges {
  /** Созданные в этой сессии пользователи (на сервере их нет). */
  created: User[];
  /** Изменённые пользователи с сервера: id → новая версия. */
  updated: Record<number, User>;
  /** id удалённых пользователей с сервера. */
  deletedIds: number[];
}

export const EMPTY_CHANGES: LocalChanges = { created: [], updated: {}, deletedIds: [] };

/**
 * Склеивает загруженные страницы в один список без дублей.
 * Дубли возможны, если между запросами страниц на сервере изменился порядок записей.
 */
export function flattenPages(pages: UsersPage[]): User[] {
  const byId = new Map<number, User>();
  for (const page of pages) {
    for (const user of page.users) {
      if (!byId.has(user.id)) byId.set(user.id, user);
    }
  }
  return [...byId.values()];
}

/** Итоговый список для отображения: серверные данные + локальные изменения. */
export function applyLocalChanges(serverUsers: User[], changes: LocalChanges, query: UsersQuery): User[] {
  const deleted = new Set(changes.deletedIds);
  const seen = new Set<number>();
  const result: User[] = [];

  const push = (user: User) => {
    if (deleted.has(user.id) || seen.has(user.id)) return;
    seen.add(user.id);
    result.push(user);
  };

  // Новые записи — сверху, самые свежие первыми
  for (let i = changes.created.length - 1; i >= 0; i -= 1) {
    const user = changes.created[i]!;
    if (matchesQuery(user, query)) push(user);
  }

  for (const user of serverUsers) {
    const local = changes.updated[user.id];
    if (!local) push(user);
    else if (matchesQuery(local, query)) push(local);
  }

  return result;
}

export function countLocalChanges(changes: LocalChanges): number {
  return changes.created.length + Object.keys(changes.updated).length + changes.deletedIds.length;
}
