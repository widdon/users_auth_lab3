'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useId, useState, useTransition, type ChangeEvent, type FormEvent } from 'react';
import {
  DEFAULT_LOGIN_ERROR,
  LOGIN_ERROR_MESSAGES,
  loginSchema,
  type LoginField,
  type LoginInput,
} from '@/lib/auth/login-schema';
import { fieldErrorId, FormField } from '../ui/FormField';
import { AlertIcon, LogInIcon } from '../ui/Icons';

export interface DemoAccount {
  username: string;
  password: string;
  label: string;
}

interface LoginFormProps {
  /** Куда вернуться после входа (уже проверено схемой callbackUrlSchema). */
  callbackUrl: string;
  /** Учётные записи DummyJSON для быстрого входа на защите. */
  demoAccounts?: DemoAccount[];
}

type LoginErrors = Partial<Record<LoginField, string>>;

/**
 * Форма входа. Данные сначала проверяются Zod-схемой (те же правила повторит
 * сервер в authorize), затем signIn из next-auth/react отправляет их в Route Handler
 * Auth.js. При успехе сервер ставит httpOnly-cookie с сессией — пароль нигде не сохраняется.
 */
export function LoginForm({ callbackUrl, demoAccounts = [] }: LoginFormProps) {
  const formId = useId();
  const router = useRouter();
  const [values, setValues] = useState<LoginInput>({ username: '', password: '' });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleChange = (field: LoginField) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const submit = (input: LoginInput) => {
    const result = loginSchema.safeParse(input);
    if (!result.success) {
      const next: LoginErrors = {};
      for (const issue of result.error.issues) {
        const [key] = issue.path;
        if (key === 'username' || key === 'password') next[key] ??= issue.message;
      }
      setErrors(next);
      setFormError(null);
      return;
    }

    setErrors({});
    setFormError(null);
    startTransition(async () => {
      const response = await signIn('credentials', { ...result.data, redirect: false });
      if (!response || response.error) {
        setFormError(LOGIN_ERROR_MESSAGES[response?.code ?? ''] ?? DEFAULT_LOGIN_ERROR);
        return;
      }
      // Пароль больше не нужен: не держим его в состоянии формы. Next.js сохраняет
      // скрытой предыдущую страницу (Activity), и иначе он остался бы в памяти вкладки
      setValues((prev) => ({ ...prev, password: '' }));
      // Сессия установлена: переходим и просим сервер перерисовать страницы уже с пользователем
      router.replace(callbackUrl);
      router.refresh();
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit(values);
  };

  const loginAs = (account: DemoAccount) => {
    const input = { username: account.username, password: account.password };
    setValues(input);
    submit(input);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="card w-full border border-base-300 bg-base-100 shadow-sm">
      <div className="card-body gap-2">
        {formError && (
          <div role="alert" className="alert alert-error alert-soft">
            <AlertIcon />
            <span>{formError}</span>
          </div>
        )}

        <fieldset disabled={isPending} className="contents">
          <FormField label="Логин" htmlFor={`${formId}-username`} required error={errors.username}>
            <input
              id={`${formId}-username`}
              name="username"
              autoComplete="username"
              className={`input w-full ${errors.username ? 'input-error' : ''}`}
              value={values.username}
              onChange={handleChange('username')}
              aria-invalid={errors.username ? true : undefined}
              aria-describedby={errors.username ? fieldErrorId(`${formId}-username`) : undefined}
              placeholder="emilys"
            />
          </FormField>
          <FormField label="Пароль" htmlFor={`${formId}-password`} required error={errors.password}>
            <input
              id={`${formId}-password`}
              name="password"
              type="password"
              autoComplete="current-password"
              className={`input w-full ${errors.password ? 'input-error' : ''}`}
              value={values.password}
              onChange={handleChange('password')}
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={errors.password ? fieldErrorId(`${formId}-password`) : undefined}
            />
          </FormField>

          <button type="submit" className="btn btn-primary mt-2">
            {isPending ? <span className="loading loading-spinner loading-sm" /> : <LogInIcon />}
            {isPending ? 'Вход…' : 'Войти'}
          </button>
        </fieldset>

        {demoAccounts.length > 0 && (
          <div className="mt-4 border-t border-base-200 pt-4">
            <p className="mb-2 text-sm text-base-content/60">Демо-учётки DummyJSON:</p>
            <div className="flex flex-col gap-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.username}
                  type="button"
                  className="btn btn-outline btn-sm justify-between"
                  onClick={() => loginAs(account)}
                  disabled={isPending}
                >
                  <span>{account.label}</span>
                  <span className="font-mono text-xs opacity-70">
                    {account.username} / {account.password}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
