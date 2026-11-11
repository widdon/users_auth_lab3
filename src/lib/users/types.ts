import { z } from 'zod';
import { GENDERS, USER_ROLES } from './constants';

/**
 * Модель пользователя, с которой работает интерфейс — подмножество полей
 * https://dummyjson.com/docs/users, все поля гарантированно заполнены (см. mappers.ts).
 *
 * Модель описана Zod-схемой, а TypeScript-тип выводится из неё через z.infer:
 * так тип и проверка не расходятся. Схема нужна там, где данные приходят «снаружи»
 * уже в формате модели: ответ нашего /api/users в браузере и данные из sessionStorage.
 */

export type { Gender, UserRole } from './constants';

export const userSchema = z.object({
  id: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  age: z.number(),
  gender: z.enum(GENDERS),
  email: z.string(),
  phone: z.string(),
  username: z.string(),
  birthDate: z.string(), // YYYY-MM-DD
  image: z.string(),
  role: z.enum(USER_ROLES),
  bloodGroup: z.string(),
  height: z.number(),
  weight: z.number(),
  eyeColor: z.string(),
  university: z.string(),
  address: z.object({ address: z.string(), city: z.string(), state: z.string(), country: z.string() }),
  company: z.object({ name: z.string(), department: z.string(), title: z.string() }),
});

/** Одна «страница» списка — как в ответе DummyJSON. */
export const usersPageSchema = z.object({
  users: z.array(userSchema),
  total: z.number().int().nonnegative(),
  skip: z.number().int().nonnegative(),
  limit: z.number().int().nonnegative(),
});

export type User = z.infer<typeof userSchema>;
export type Address = User['address'];
export type Company = User['company'];
export type UsersPage = z.infer<typeof usersPageSchema>;

export interface Post {
  id: number;
  title: string;
  body: string;
  tags: string[];
  likes: number;
  dislikes: number;
  views: number;
}

export interface PostsPage {
  posts: Post[];
  total: number;
}
