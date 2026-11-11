/**
 * Выполняется один раз при запуске сервера Next.js (не при сборке).
 * Проверяем переменные окружения Zod-схемой сразу: если AUTH_SECRET не задан
 * или адрес API некорректен, сервер не запустится и покажет понятную ошибку,
 * вместо того чтобы падать на первом входе пользователя.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const { apiEnv, authEnv } = await import('./lib/env');
  apiEnv();
  authEnv();
}
