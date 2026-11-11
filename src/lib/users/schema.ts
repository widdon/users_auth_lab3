import { z } from 'zod';
import { GENDERS, MAX_AGE, MIN_AGE, USER_ROLES } from './constants';
import { calcAge } from './format';
import type { User } from './types';

/**
 * Zod-схемы данных пользователя (создание и изменение записи).
 *
 * Схема — это описание формы данных и правил, по которому Zod проверяет
 * значение во время выполнения программы. Одна и та же схема работает дважды:
 *  - в браузере (UserForm) — чтобы сразу показать ошибку рядом с полем;
 *  - на сервере (service.ts, его вызывают Server Functions и Route Handlers) —
 *    потому что данные с клиента можно подделать в обход формы.
 * TypeScript-типы не пишутся вручную, а выводятся из схем через z.input / z.infer.
 */

const PHONE_RE = /^\+?[\d\s()-]{7,20}$/;
const USERNAME_RE = /^[a-z0-9._]{3,20}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const personName = (emptyMessage: string) =>
  z.string().trim().min(1, emptyMessage).min(2, 'Минимум 2 символа').max(50, 'Не больше 50 символов');

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

const optionalText = z.string().trim().max(100, 'Не больше 100 символов');

/** Набор полей записи и правила для каждого поля по отдельности. */
const userFields = z.object({
  firstName: personName('Укажите имя'),
  lastName: personName('Укажите фамилию'),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Укажите логин')
    .regex(USERNAME_RE, '3–20 символов: латиница, цифры, точка, _'),
  email: z.string().trim().toLowerCase().min(1, 'Укажите email').pipe(z.email('Некорректный email')),
  phone: z.string().trim().min(1, 'Укажите телефон').regex(PHONE_RE, 'Например: +7 900 123-45-67'),
  // Правило предметной области № 1: возраст пользователя справочника — от 14 до 120 лет
  birthDate: z
    .string()
    .regex(DATE_RE, 'Укажите дату рождения')
    .refine((value) => {
      const age = calcAge(value);
      return age >= MIN_AGE && age <= MAX_AGE;
    }, `Возраст должен быть от ${MIN_AGE} до ${MAX_AGE} лет`),
  gender: z.enum(GENDERS, 'Выберите пол'),
  role: z.enum(USER_ROLES, 'Выберите роль'),
  image: z
    .string()
    .trim()
    .refine((value) => value === '' || isHttpUrl(value), 'Ссылка должна начинаться с http:// или https://'),
  university: optionalText,
  city: optionalText,
  country: optionalText,
  companyName: optionalText,
  department: optionalText,
  title: optionalText,
});

/**
 * Правило предметной области № 2 (зависит от нескольких полей):
 * должность и отдел имеют смысл только вместе с компанией.
 * superRefine получает весь объект и может привязать ошибку к конкретному полю (path).
 */
function companyRule(data: { companyName?: string; department?: string; title?: string }, ctx: z.RefinementCtx) {
  if (data.companyName) return;
  if (data.title) {
    ctx.addIssue({ code: 'custom', path: ['companyName'], message: 'Укажите компанию, в которой указана должность' });
  } else if (data.department) {
    ctx.addIssue({ code: 'custom', path: ['companyName'], message: 'Укажите компанию, к которой относится отдел' });
  }
}

/** Создание записи: все поля, плюс правила, связывающие поля между собой. */
export const userCreateSchema = userFields.superRefine(companyRule);

/**
 * Изменение записи (PATCH /api/users/:id): можно прислать только изменённые поля.
 * Неизвестные поля запрещены (.strict), чтобы опечатка в названии поля не «потерялась» молча.
 * После объединения с текущей версией записи результат ещё раз проверяется userCreateSchema.
 */
export const userUpdateSchema = userFields
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, 'Нет полей для изменения');

/** Форма редактирования отправляет запись целиком — та же схема, что и для создания. */
export const userFormSchema = userCreateSchema;

/** Значения полей формы (все — строки, как в <input>). */
export type UserFormInput = z.input<typeof userCreateSchema>;
/** Проверенные и нормализованные данные (после trim/toLowerCase). */
export type UserFormData = z.infer<typeof userCreateSchema>;
export type UserUpdateData = z.infer<typeof userUpdateSchema>;

export type UserFormField = keyof UserFormInput;
export type FieldErrors = Partial<Record<UserFormField, string>>;

export const USER_FORM_FIELDS = userFields.keyof().options;

/** Проверяет, что строка — имя поля формы (вместо приведения `as UserFormField`). */
export function isUserFormField(value: string): value is UserFormField {
  return userFields.keyof().safeParse(value).success;
}

export type ValidationResult<T> = { success: true; data: T } | { success: false; fieldErrors: FieldErrors; formError?: string };

/** Ошибки Zod → «первая ошибка каждого поля» для вывода рядом с полями. */
export function toFieldErrors(error: z.ZodError): { fieldErrors: FieldErrors; formError?: string } {
  const fieldErrors: FieldErrors = {};
  let formError: string | undefined;
  for (const issue of error.issues) {
    if (issue.code === 'unrecognized_keys') {
      formError ??= `Неизвестные поля: ${issue.keys.join(', ')}`;
      continue;
    }
    const [key] = issue.path;
    if (typeof key === 'string' && isUserFormField(key)) {
      fieldErrors[key] ??= issue.message;
    } else if (key === undefined) {
      formError ??= issue.message;
    } else {
      // Лишнее поле (.strict) или поле не из формы
      formError ??= `Поле «${String(key)}»: ${issue.message}`;
    }
  }
  return { fieldErrors, formError };
}

function validate<T>(schema: z.ZodType<T>, input: unknown): ValidationResult<T> {
  // safeParse не бросает исключение, а возвращает { success, data | error }
  const result = schema.safeParse(input);
  if (result.success) return { success: true, data: result.data };
  return { success: false, ...toFieldErrors(result.error) };
}

export function validateUserForm(input: unknown): ValidationResult<UserFormData> {
  return validate(userCreateSchema, input);
}

export function validateUserUpdate(input: unknown): ValidationResult<UserUpdateData> {
  return validate(userUpdateSchema, input);
}

export const EMPTY_FORM: UserFormInput = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  phone: '',
  birthDate: '',
  gender: 'female',
  role: 'user',
  image: '',
  university: '',
  city: '',
  country: '',
  companyName: '',
  department: '',
  title: '',
};

export function userToFormInput(user: User): UserFormInput {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    phone: user.phone,
    birthDate: user.birthDate,
    gender: user.gender,
    role: user.role,
    image: user.image,
    university: user.university,
    city: user.address.city,
    country: user.address.country,
    companyName: user.company.name,
    department: user.company.department,
    title: user.company.title,
  };
}
