import 'server-only';

import { z } from 'zod';

/**
 * Переменные окружения сервера — ещё одна внешняя граница, которую проверяет Zod.
 * process.env — это просто словарь строк (или undefined): опечатка в .env.local
 * или пустой секрет иначе обнаружились бы только при первом запросе.
 *
 * Модуль помечен 'server-only': переменные без префикса NEXT_PUBLIC_ в браузер
 * не попадают, а этот импорт гарантирует, что и сам модуль не окажется в клиентском бандле.
 */
const envSchema = z.object({
  DUMMYJSON_URL: z
    .url({ protocol: /^https?$/, error: 'DUMMYJSON_URL должен быть http(s)-адресом' })
    .default('https://dummyjson.com')
    .transform((url) => url.replace(/\/+$/, '')),
  AUTH_SECRET: z
    .string({ error: 'Не задан AUTH_SECRET (см. .env.example)' })
    .min(32, 'AUTH_SECRET должен быть не короче 32 символов'),
});

export type ServerEnv = z.infer<typeof envSchema>;

function parseEnv<T>(schema: z.ZodType<T>): T {
  const result = schema.safeParse(process.env);
  if (!result.success) {
    throw new Error(`Некорректные переменные окружения:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

// Слою данных нужен только адрес API, а Auth.js — только секрет.
// Поэтому проверяем их по отдельности: сборка страниц не требует AUTH_SECRET.
let apiEnvCache: Pick<ServerEnv, 'DUMMYJSON_URL'> | undefined;
let authEnvCache: Pick<ServerEnv, 'AUTH_SECRET'> | undefined;

export function apiEnv() {
  apiEnvCache ??= parseEnv(envSchema.pick({ DUMMYJSON_URL: true }));
  return apiEnvCache;
}

export function authEnv() {
  authEnvCache ??= parseEnv(envSchema.pick({ AUTH_SECRET: true }));
  return authEnvCache;
}
