# Лабораторная работа №3 — валидация, аутентификация, права доступа и тесты

Вариант 5 — **Users** (справочник пользователей [DummyJSON](https://dummyjson.com/docs/users)).
Продолжение ЛР2 (Next.js App Router): добавлены Zod-валидация, вход через Auth.js, роли `user` / `admin`
с проверкой на сервере и компонентные тесты.

## Технологии

Next.js 16 (App Router, Cache Components), React 19, TypeScript, Auth.js (next-auth v5), Zod 4,
TanStack Query, Zustand, Tailwind CSS 4 + DaisyUI 5. Тесты — Vitest, React Testing Library, user-event,
покрытие — @vitest/coverage-v8.

## Запуск

Нужен Node.js 20.9+ и доступ в интернет (данные и вход — через DummyJSON).

```bash
npm install
npm run dev          # http://localhost:3000
# или production-сборка
npm run build && npm start
```

При первом `npm run dev` / `npm run build` скрипт `scripts/ensure-env.mjs` сам создаёт `.env.local`
со случайным `AUTH_SECRET` (шаблон — `.env.example`). Настраивать ничего не нужно.

## Тесты

```bash
npm test               # все тесты (Vitest)
npm run test:coverage  # тесты + отчёт о покрытии (в терминале и в coverage/index.html)
```

Проверка защиты API (401 / 403 / 422 / 200) — приложение должно работать в другом терминале (`npm run dev`):

```bash
npm run check:access
```

## Вход и роли

Вход по реальным учётным записям DummyJSON (на странице `/login` есть кнопки быстрого входа):

| Учётка | Пароль | Роль в DummyJSON | Роль в приложении |
| --- | --- | --- | --- |
| `emilys` | `emilyspass` | admin | **admin** |
| `averyp` | `averyppass` | user | **user** |
| `oliviaw` | `oliviawpass` | moderator | **user** |

| Кто | Права |
| --- | --- |
| Аноним | просмотр списка и профилей |
| `user` | + создание и изменение записей |
| `admin` | + удаление записей и назначение/снятие роли «Администратор» у записей |

Что проверить:
- без входа `/users/new` и `/users/:id/edit` перенаправляют на `/login`, кнопок «Добавить/Изменить/Удалить» нет;
- под `averyp` нет кнопки «Удалить», а запрос в обход интерфейса `DELETE /api/users/1` возвращает **403**;
- без входа `POST /api/users`, `PATCH`/`DELETE /api/users/:id` возвращают **401**;
- после обновления страницы сессия сохраняется (httpOnly-cookie Auth.js).

> DummyJSON только имитирует изменения и ничего не сохраняет, поэтому результаты мутаций хранятся
> локально (Zustand + sessionStorage). Сбросить их можно кнопкой «Сбросить» в шапке.

## Где что лежит

| Тема | Файлы |
| --- | --- |
| Zod-схемы записи (создание/изменение) | `src/lib/users/schema.ts` |
| Zod: ответы DummyJSON, URL-параметры, env, sessionStorage | `src/lib/users/api-schemas.ts`, `params.ts`, `query.ts`, `src/lib/env.ts`, `src/store/users-store.ts` |
| Auth.js | `src/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/lib/auth/dummyjson-auth.ts` |
| Права и роли | `src/lib/auth/permissions.ts`, `src/lib/auth/session.ts` |
| Проверки на сервере | `src/app/users/actions.ts`, `src/app/api/users/**`, `src/lib/users/service.ts`, страницы `new`/`edit` |
| Ранний редирект | `src/proxy.ts` |
| Вход/выход в интерфейсе | `src/app/login/page.tsx`, `src/components/auth/*` |
| Тесты | `src/**/*.test.ts(x)`, `vitest.config.mts`, `src/test/*` |
