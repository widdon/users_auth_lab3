import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginForm, type DemoAccount } from '@/components/auth/LoginForm';
import { ShieldIcon } from '@/components/ui/Icons';
import { safeCallbackUrl } from '@/lib/auth/login-schema';
import { getCurrentUser } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Вход',
};

interface LoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Реальные учётные записи DummyJSON с разными ролями (пароли публичны — это тестовый API). */
const DEMO_ACCOUNTS: DemoAccount[] = [
  { label: 'Администратор', username: 'emilys', password: 'emilyspass' },
  { label: 'Пользователь', username: 'averyp', password: 'averyppass' },
  { label: 'Модератор', username: 'oliviaw', password: 'oliviawpass' },
];

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  // callbackUrl — внешний ввод: принимаем только путь внутри приложения
  const callbackUrl = safeCallbackUrl(params.callbackUrl);

  // Уже вошли — форма не нужна
  if (await getCurrentUser()) redirect(callbackUrl);

  const fromProtectedPage = params.callbackUrl !== undefined;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 py-6">
      <div className="flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-field bg-primary/10 text-primary">
          <ShieldIcon className="size-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold">Вход</h1>
          <p className="text-sm text-base-content/60">Учётные записи DummyJSON</p>
        </div>
      </div>

      {fromProtectedPage && (
        <div role="status" className="alert alert-info alert-soft">
          <span>Войдите, чтобы продолжить: эта страница доступна только после входа.</span>
        </div>
      )}

      <LoginForm callbackUrl={callbackUrl} demoAccounts={DEMO_ACCOUNTS} />

      <div className="rounded-box border border-base-300 bg-base-100 p-4 text-sm text-base-content/70">
        <p className="font-medium text-base-content">Права ролей</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Без входа — только просмотр.</li>
          <li>Пользователь — просмотр, создание и изменение записей (роли user и moderator в DummyJSON).</li>
          <li>Администратор — всё то же, удаление записей и назначение роли «Администратор».</li>
        </ul>
      </div>
    </div>
  );
}
