'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { startTransition, useActionState, useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { createUserAction, updateUserAction } from '@/app/users/actions';
import { usePermissions } from '@/hooks/usePermissions';
import { canAssignRole, ROLE_ASSIGN_ERROR } from '@/lib/auth/permissions';
import { GENDERS, GENDER_LABELS, ROLE_LABELS, USER_ROLES } from '@/lib/users/constants';
import { getFullName } from '@/lib/users/format';
import { IDLE_FORM_STATE, type UserFormState } from '@/lib/users/form-state';
import {
  EMPTY_FORM,
  isUserFormField,
  userToFormInput,
  validateUserForm,
  type FieldErrors,
  type UserFormField,
  type UserFormInput,
} from '@/lib/users/schema';
import type { User } from '@/lib/users/types';
import { useUsersStore } from '@/store/users-store-provider';
import { Avatar } from '../ui/Avatar';
import { fieldErrorId, FormField } from '../ui/FormField';
import { AlertIcon } from '../ui/Icons';

/** Порядок полей в форме — для фокуса на первой ошибке. */
const USER_FORM_ORDER: UserFormField[] = [
  'firstName', 'lastName', 'username', 'birthDate', 'gender', 'role', 'email', 'phone', 'image',
  'university', 'companyName', 'department', 'title', 'city', 'country',
];

interface UserFormProps {
  /** Редактируемый пользователь; если не передан — форма создания. */
  user?: User;
  /** Пользователь создан в этой сессии и существует только на клиенте. */
  isLocal?: boolean;
}

/**
 * Форма создания/редактирования.
 *
 * - Поля управляемые (controlled), значения — в useState.
 * - При отправке данные сначала проверяются той же zod-схемой, что и на сервере;
 *   ошибки показываются рядом с полями.
 * - Затем вызывается Server Function через useActionState: хук хранит результат
 *   последнего вызова (state) и флаг isPending — состояние «отправка мутации».
 * - Сервер проверяет данные и права ещё раз; его ошибки (422/401/403) тоже
 *   выводятся у полей или общим сообщением.
 * - Роль «Администратор» в списке ролей доступна только администратору.
 */
export function UserForm({ user, isLocal = false }: UserFormProps) {
  const isEdit = user !== undefined;
  const formId = useId();
  const router = useRouter();

  const addCreated = useUsersStore((s) => s.addCreated);
  const applyUpdate = useUsersStore((s) => s.applyUpdate);
  const pushToast = useUsersStore((s) => s.pushToast);

  const [values, setValues] = useState<UserFormInput>(() => (user ? userToFormInput(user) : EMPTY_FORM));
  const [errors, setErrors] = useState<FieldErrors>({});
  const formRef = useRef<HTMLFormElement>(null);

  const { role: actorRole } = usePermissions();
  const originalRole = user ? user.role : null;
  // Какие роли этот пользователь может выбрать для записи (то же правило проверяет сервер)
  const selectableRoles = USER_ROLES.filter((r) => canAssignRole(actorRole, originalRole, r));

  // Результат Server Function обрабатывается прямо в action, а не в useEffect:
  // так обновление состояния происходит один раз, без лишнего рендера
  const [state, submitAction, isPending] = useActionState(async (prev: UserFormState, input: UserFormInput) => {
    const result = user
      ? await updateUserAction(user.id, isLocal ? { previousRole: user.role } : null, prev, input)
      : await createUserAction(prev, input);

    if (result.status === 'error') {
      setErrors(result.fieldErrors ?? {});
      pushToast(result.message, 'error');
    }
    if (result.status === 'success') {
      // DummyJSON не сохраняет изменения — запоминаем результат в store
      if (isEdit) {
        applyUpdate(result.user);
        pushToast(`Изменения сохранены: ${getFullName(result.user)}`);
        router.push(`/users/${result.user.id}`);
      } else {
        const stored = addCreated(result.user);
        pushToast(`Пользователь ${getFullName(stored)} создан`);
        router.push('/users');
      }
    }
    return result;
  }, IDLE_FORM_STATE);

  const focusField = (field: string | undefined) => {
    if (field) formRef.current?.querySelector<HTMLElement>(`[name="${field}"]`)?.focus();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    if (!isUserFormField(name)) return;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Ошибку поля убираем, как только пользователь начал его исправлять
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = validateUserForm(values);
    const fieldErrors: FieldErrors = result.success ? {} : { ...result.fieldErrors };
    // Подсказка до отправки; окончательное решение всё равно за сервером
    if (!canAssignRole(actorRole, originalRole, values.role)) fieldErrors.role = ROLE_ASSIGN_ERROR;

    const firstInvalid = USER_FORM_ORDER.find((field) => fieldErrors[field]);
    if (firstInvalid) {
      setErrors(fieldErrors);
      focusField(firstInvalid);
      return;
    }

    setErrors({});
    // Вызов action вне <form action> нужно оборачивать в transition — тогда isPending работает
    startTransition(() => submitAction(values));
  };

  const fieldProps = (name: UserFormField) => ({
    id: `${formId}-${name}`,
    name,
    value: values[name],
    onChange: handleChange,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? fieldErrorId(`${formId}-${name}`) : undefined,
  });

  const inputClass = (name: UserFormField) => `input w-full ${errors[name] ? 'input-error' : ''}`;

  const field = (name: UserFormField, label: string, options: { required?: boolean; type?: string; placeholder?: string; hint?: string; className?: string } = {}) => (
    <FormField
      label={label}
      htmlFor={`${formId}-${name}`}
      required={options.required}
      error={errors[name]}
      hint={options.hint}
      className={options.className}
    >
      <input type={options.type ?? 'text'} className={inputClass(name)} placeholder={options.placeholder} {...fieldProps(name)} />
    </FormField>
  );

  const previewName = getFullName(values) || 'Новый пользователь';

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="card border border-base-300 bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="mb-2 flex items-center gap-4 rounded-box bg-base-200 p-4">
          <Avatar src={values.image} name={previewName} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{previewName}</p>
            <p className="truncate text-sm text-base-content/60">
              {values.username ? `@${values.username}` : 'логин не указан'}
            </p>
          </div>
        </div>

        {state.status === 'error' && !isPending && (
          <div role="alert" className="alert alert-error alert-soft">
            <AlertIcon />
            <span>{state.message}</span>
          </div>
        )}

        {/* fieldset disabled блокирует все поля, пока идёт отправка */}
        <fieldset disabled={isPending} className="contents">
          <h2 className="mt-2 text-sm font-semibold tracking-wide text-base-content/50 uppercase">Основное</h2>
          <div className="grid gap-x-4 sm:grid-cols-2">
            {field('firstName', 'Имя', { required: true, placeholder: 'Emily' })}
            {field('lastName', 'Фамилия', { required: true, placeholder: 'Johnson' })}
            {field('username', 'Логин', { required: true, placeholder: 'emilys' })}
            {field('birthDate', 'Дата рождения', { required: true, type: 'date' })}
            <FormField label="Пол" htmlFor={`${formId}-gender`} error={errors.gender}>
              <select className="select w-full" {...fieldProps('gender')}>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {GENDER_LABELS[g]}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Роль" htmlFor={`${formId}-role`} error={errors.role}>
              <select
                className="select w-full"
                {...fieldProps('role')}
                // Запись-администратора обычный пользователь не может «понизить»
                disabled={selectableRoles.length === 1 && selectableRoles[0] === values.role}
              >
                {USER_ROLES.map((r) => (
                  <option key={r} value={r} disabled={!selectableRoles.includes(r)}>
                    {ROLE_LABELS[r]}
                    {!selectableRoles.includes(r) ? ' — только администратор' : ''}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <h2 className="mt-4 text-sm font-semibold tracking-wide text-base-content/50 uppercase">Контакты</h2>
          <div className="grid gap-x-4 sm:grid-cols-2">
            {field('email', 'Email', { required: true, type: 'email', placeholder: 'name@example.com' })}
            {field('phone', 'Телефон', { required: true, type: 'tel', placeholder: '+7 900 123-45-67' })}
            {field('image', 'Ссылка на аватар', {
              type: 'url',
              placeholder: 'https://dummyjson.com/icon/emilys/128',
              hint: 'Необязательно. Без ссылки будут показаны инициалы',
              className: 'sm:col-span-2',
            })}
          </div>

          <h2 className="mt-4 text-sm font-semibold tracking-wide text-base-content/50 uppercase">Учёба, работа, адрес</h2>
          <div className="grid gap-x-4 sm:grid-cols-2">
            {field('university', 'Университет', { placeholder: 'ITMO University', className: 'sm:col-span-2' })}
            {field('companyName', 'Компания', { placeholder: 'Dooley, Kozey and Cronin' })}
            {field('department', 'Отдел', { placeholder: 'Engineering' })}
            {field('title', 'Должность', { placeholder: 'Frontend Developer', className: 'sm:col-span-2' })}
            {field('city', 'Город', { placeholder: 'Moscow' })}
            {field('country', 'Страна', { placeholder: 'Russia' })}
          </div>
        </fieldset>

        <div className="card-actions mt-6 justify-end">
          <Link
            href={isEdit ? `/users/${user.id}` : '/users'}
            className={`btn btn-ghost ${isPending ? 'btn-disabled' : ''}`}
            aria-disabled={isPending}
          >
            Отмена
          </Link>
          <button type="submit" className="btn btn-primary" disabled={isPending}>
            {isPending && <span className="loading loading-spinner loading-sm" />}
            {isPending ? 'Сохранение…' : isEdit ? 'Сохранить изменения' : 'Создать пользователя'}
          </button>
        </div>
      </div>
    </form>
  );
}
