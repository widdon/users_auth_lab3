import 'server-only';

import { can, canAssignRole, ROLE_ASSIGN_ERROR, type Action } from '../auth/permissions';
import { FORBIDDEN_MESSAGE, UNAUTHORIZED_MESSAGE, type CurrentUser } from '../auth/session';
import { ApiError, createUser, deleteUser, getUser, updateUser } from './api';
import type { ApiUserPayload } from './api-schemas';
import { calcAge } from './format';
import { mapApiUser } from './mappers';
import {
  userToFormInput,
  validateUserForm,
  validateUserUpdate,
  type FieldErrors,
  type UserFormData,
  type UserUpdateData,
} from './schema';
import type { User, UserRole } from './types';

/**
 * Бизнес-логика мутаций: права → валидация входных данных → запрос к API → результат.
 *
 * Этот модуль вызывают и Server Functions (app/users/actions.ts), и Route Handlers
 * (app/api/users/...), поэтому логика не дублируется. Отличаются только «обёртки»:
 * Server Function возвращает объект состояния формы, Route Handler — HTTP-ответ.
 */

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string; fieldErrors?: FieldErrors };

type Failure = Extract<ServiceResult<never>, { ok: false }>;

/**
 * Последний рубеж проверки прав — прямо перед мутацией.
 * Server Function и Route Handler уже проверили доступ, но сервисный слой
 * не полагается на это: если кто-то вызовет его из нового места и забудет
 * проверку, запрос всё равно будет отклонён.
 */
function authorize(actor: CurrentUser | null, action: Action): { ok: true; actor: CurrentUser } | Failure {
  if (!actor) return { ok: false, status: 401, message: UNAUTHORIZED_MESSAGE };
  if (!can(actor.role, action)) return { ok: false, status: 403, message: FORBIDDEN_MESSAGE };
  return { ok: true, actor };
}

function roleDenied(actor: CurrentUser, from: UserRole | null, to: UserRole): Failure | null {
  if (canAssignRole(actor.role, from, to)) return null;
  return { ok: false, status: 403, message: ROLE_ASSIGN_ERROR, fieldErrors: { role: ROLE_ASSIGN_ERROR } };
}

function invalid(fieldErrors: FieldErrors, formError?: string): Failure {
  return { ok: false, status: 422, message: formError ?? INVALID_FORM_MESSAGE, fieldErrors };
}

const INVALID_FORM_MESSAGE = 'Проверьте правильность заполнения формы';

/** Данные формы → тело запроса DummyJSON. Вложенные поля дополняются из текущей версии записи. */
function toPayload(data: UserFormData, base?: User): ApiUserPayload {
  return {
    firstName: data.firstName,
    lastName: data.lastName,
    username: data.username,
    email: data.email,
    phone: data.phone,
    birthDate: data.birthDate,
    age: calcAge(data.birthDate),
    gender: data.gender,
    role: data.role,
    image: data.image,
    university: data.university,
    address: {
      address: base?.address.address ?? '',
      state: base?.address.state ?? '',
      city: data.city,
      country: data.country,
    },
    company: {
      name: data.companyName,
      department: data.department,
      title: data.title,
    },
  };
}

async function run<T>(operation: () => Promise<T>): Promise<ServiceResult<T>> {
  try {
    return { ok: true, data: await operation() };
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, status: error.status, message: error.message };
    console.error(error);
    return { ok: false, status: 500, message: 'Внутренняя ошибка сервера' };
  }
}

export async function createUserFromInput(actor: CurrentUser | null, input: unknown): Promise<ServiceResult<User>> {
  const access = authorize(actor, 'user:create');
  if (!access.ok) return access;

  const parsed = validateUserForm(input);
  if (!parsed.success) return invalid(parsed.fieldErrors, parsed.formError);

  const roleError = roleDenied(access.actor, null, parsed.data.role);
  if (roleError) return roleError;

  return run(() => createUser(toPayload(parsed.data)));
}

interface UpdateOptions {
  /**
   * Запись создана в этой сессии и существует только на клиенте.
   * DummyJSON вернёт для неё 404, поэтому запрос не отправляем:
   * проверяем данные и возвращаем новую версию, а клиент обновит свою копию.
   */
  local?: { previousRole: UserRole };
  /** PATCH: во входных данных только изменённые поля (схема userUpdateSchema). */
  partial?: boolean;
}

export async function updateUserFromInput(
  actor: CurrentUser | null,
  id: number,
  input: unknown,
  { local, partial = false }: UpdateOptions = {},
): Promise<ServiceResult<User>> {
  const access = authorize(actor, 'user:update');
  if (!access.ok) return access;

  if (local) {
    const parsed = validateUserForm(input);
    if (!parsed.success) return invalid(parsed.fieldErrors, parsed.formError);
    const roleError = roleDenied(access.actor, local.previousRole, parsed.data.role);
    if (roleError) return roleError;
    return { ok: true, data: mapApiUser({ id, ...toPayload(parsed.data) }) };
  }

  // Частичное изменение сначала проверяется своей схемой (только присланные поля)
  let patch: UserUpdateData = {};
  if (partial) {
    const parsedPatch = validateUserUpdate(input);
    if (!parsedPatch.success) return invalid(parsedPatch.fieldErrors, parsedPatch.formError);
    patch = parsedPatch.data;
  }

  let current: User | null;
  try {
    current = await getUser(id);
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, status: error.status, message: error.message };
    throw error;
  }
  if (!current) return { ok: false, status: 404, message: `Пользователь с id ${id} не найден` };

  // Итоговая запись (текущая версия + изменения) должна пройти полную схему,
  // в том числе правила, связывающие поля между собой
  const parsed = validateUserForm(partial ? { ...userToFormInput(current), ...patch } : input);
  if (!parsed.success) return invalid(parsed.fieldErrors, parsed.formError);

  const roleError = roleDenied(access.actor, current.role, parsed.data.role);
  if (roleError) return roleError;

  return run(async () => {
    const updated = await updateUser(id, toPayload(parsed.data, current));
    // DummyJSON не возвращает поля, которых не было в запросе, — дополняем из текущей версии
    return { ...current, ...updated, address: updated.address, company: updated.company };
  });
}

interface DeleteOptions {
  /** Запись есть только на клиенте: проверяем права, но в DummyJSON не обращаемся. */
  local?: boolean;
}

export async function deleteUserById(
  actor: CurrentUser | null,
  id: number,
  { local = false }: DeleteOptions = {},
): Promise<ServiceResult<{ id: number }>> {
  const access = authorize(actor, 'user:delete');
  if (!access.ok) return access;
  if (local) return { ok: true, data: { id } };

  return run(async () => {
    const { id: deletedId } = await deleteUser(id);
    return { id: deletedId };
  });
}
