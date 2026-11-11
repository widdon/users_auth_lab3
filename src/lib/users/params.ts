import { z } from 'zod';

/**
 * Параметры URL — тоже внешняя граница: их может написать кто угодно.
 * Динамический сегмент /users/[id] приходит строкой ("12", "abc", "-1", "1e3").
 * z.coerce приводит строку к числу, а правила оставляют только целые id > 0.
 */
export const userIdSchema = z.coerce
  .number({ error: 'Идентификатор должен быть числом' })
  .int('Идентификатор должен быть целым числом')
  .positive('Идентификатор должен быть больше нуля')
  .max(Number.MAX_SAFE_INTEGER);

/** id из URL или аргумента Server Function; null — если значение некорректно. */
export function parseUserId(value: unknown): number | null {
  // Пустая строка после coerce превратилась бы в 0 — отсекаем её явно
  if (value === '' || value === null || value === undefined) return null;
  const result = userIdSchema.safeParse(value);
  return result.success ? result.data : null;
}

/** Целое число из query-параметра в заданных пределах (skip, limit). */
export function intParam(min: number, max: number, fallback: number) {
  return z.coerce.number().int().min(min).max(max).catch(fallback);
}
