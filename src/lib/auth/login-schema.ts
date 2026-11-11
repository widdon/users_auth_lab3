import { z } from 'zod';

/**
 * Схемы для входа. Общие для клиента (форма) и сервера (authorize в auth.ts).
 */
export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Введите логин').max(50, 'Слишком длинный логин'),
  password: z.string().min(1, 'Введите пароль').max(100, 'Слишком длинный пароль'),
});

export type LoginInput = z.input<typeof loginSchema>;
export type LoginField = keyof LoginInput;

/**
 * Адрес возврата после входа (?callbackUrl=...). Принимаем только относительный путь
 * внутри приложения: иначе ссылка вида /login?callbackUrl=https://evil.example
 * после входа отправила бы пользователя на чужой сайт (open redirect).
 */
export const callbackUrlSchema = z
  .string()
  .startsWith('/')
  .refine((url) => !url.startsWith('//') && !url.startsWith('/\\') && !url.startsWith('/login'))
  .catch('/users');

export function safeCallbackUrl(value: unknown): string {
  return callbackUrlSchema.parse(Array.isArray(value) ? value[0] : value);
}

/** Коды ошибок входа, которые authorize передаёт клиенту. */
export const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Неверный логин или пароль',
  service_unavailable: 'Сервис входа DummyJSON сейчас недоступен. Попробуйте позже',
};
export const DEFAULT_LOGIN_ERROR = 'Не удалось войти. Попробуйте ещё раз';
