import { z } from 'zod';

/**
 * Zod-схемы ответов DummyJSON — проверка внешней границы приложения.
 *
 * TypeScript ничего не знает о том, что на самом деле пришло по сети:
 * `await response.json()` имеет тип `any`, и приведение `as ApiUser` лишь
 * «обещает» компилятору нужную форму. Схема же проверяет ответ во время работы:
 * если API изменится или вернёт мусор, мы получим понятную ошибку на границе,
 * а не `undefined` где-то глубоко в компонентах.
 *
 * Поля необязательные: с ?select=... DummyJSON возвращает только часть полей,
 * а ответ на POST /users/add содержит только то, что мы отправили.
 * Неизвестные поля (bank, crypto, ...) z.object отбрасывает.
 */

const text = z.string().optional();
const num = z.number().optional();

export const apiUserSchema = z.object({
  id: z.number().int(),
  firstName: text,
  lastName: text,
  age: z.number().nullable().optional(),
  gender: text,
  email: text,
  phone: text,
  username: text,
  birthDate: text,
  image: text,
  role: text,
  bloodGroup: text,
  height: z.number().nullable().optional(),
  weight: z.number().nullable().optional(),
  eyeColor: text,
  university: text,
  address: z
    .object({ address: text, city: text, state: text, country: text })
    .partial()
    .optional(),
  company: z.object({ name: text, department: text, title: text }).partial().optional(),
});

export const apiUsersResponseSchema = z.object({
  users: z.array(apiUserSchema),
  total: z.number().int().nonnegative(),
  skip: z.number().int().nonnegative(),
  limit: z.number().int().nonnegative(),
});

export const apiDeletedUserSchema = apiUserSchema.extend({
  isDeleted: z.literal(true),
  deletedOn: z.string(),
});

export const apiPostSchema = z.object({
  id: z.number().int(),
  title: text,
  body: text,
  tags: z.array(z.string()).optional(),
  reactions: z.object({ likes: num, dislikes: num }).optional(),
  views: num,
  userId: num,
});

export const apiPostsResponseSchema = z.object({
  posts: z.array(apiPostSchema),
  total: z.number().int().nonnegative(),
  skip: z.number().int().nonnegative(),
  limit: z.number().int().nonnegative(),
});

/** Тело ошибки DummyJSON: { message: "..." } */
export const apiErrorSchema = z.object({ message: z.string() });

export type ApiUser = z.infer<typeof apiUserSchema>;
export type ApiUsersResponse = z.infer<typeof apiUsersResponseSchema>;
export type ApiPost = z.infer<typeof apiPostSchema>;

/** Тело запросов POST /users/add и PUT /users/:id (формируем сами, поэтому это просто тип). */
export interface ApiUserPayload {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  birthDate: string;
  age: number;
  gender: string;
  role: string;
  image: string;
  university: string;
  address: { address: string; city: string; state: string; country: string };
  company: { name: string; department: string; title: string };
}
