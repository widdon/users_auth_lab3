import { screen, waitFor } from '@testing-library/react';
import { signIn } from 'next-auth/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { routerMock } from '@/test/router-mock';
import { LoginForm } from './LoginForm';

// signIn отправляет запрос в Auth.js — в тесте это мок, остальное из next-auth/react настоящее
vi.mock('next-auth/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next-auth/react')>()),
  signIn: vi.fn(),
}));

const ok = { ok: true, error: undefined, code: undefined, status: 200, url: '/users' };

describe('LoginForm', () => {
  it('показывает сообщения Zod для пустых полей и не вызывает вход', async () => {
    const { user } = renderWithProviders(<LoginForm callbackUrl="/users" />);

    await user.click(screen.getByRole('button', { name: 'Войти' }));

    expect(screen.getByLabelText(/^Логин/)).toHaveAccessibleDescription('Введите логин');
    expect(screen.getByLabelText(/^Пароль/)).toHaveAccessibleDescription('Введите пароль');
    expect(signIn).not.toHaveBeenCalled();
  });

  it('при корректном вводе вызывает signIn и возвращает на исходную страницу', async () => {
    vi.mocked(signIn).mockResolvedValue(ok);
    const { user } = renderWithProviders(<LoginForm callbackUrl="/users/new" />);

    await user.type(screen.getByLabelText(/^Логин/), '  emilys ');
    await user.type(screen.getByLabelText(/^Пароль/), 'emilyspass');
    await user.click(screen.getByRole('button', { name: 'Войти' }));

    // Логин обрезан схемой (trim), redirect: false — переходим сами после ответа
    expect(signIn).toHaveBeenCalledWith('credentials', { username: 'emilys', password: 'emilyspass', redirect: false });
    await waitFor(() => expect(routerMock.replace).toHaveBeenCalledWith('/users/new'));
    expect(routerMock.refresh).toHaveBeenCalled();
    // Пароль не остаётся в поле после входа
    expect(screen.getByLabelText(/^Пароль/)).toHaveValue('');
  });

  it('сообщает о неверном логине или пароле', async () => {
    vi.mocked(signIn).mockResolvedValue({ ...ok, ok: false, error: 'CredentialsSignin', code: 'invalid_credentials', status: 401 });
    const { user } = renderWithProviders(<LoginForm callbackUrl="/users" />);

    await user.type(screen.getByLabelText(/^Логин/), 'emilys');
    await user.type(screen.getByLabelText(/^Пароль/), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Войти' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Неверный логин или пароль');
    expect(routerMock.replace).not.toHaveBeenCalled();
  });

  it('входит демо-учёткой одной кнопкой', async () => {
    vi.mocked(signIn).mockResolvedValue(ok);
    const { user } = renderWithProviders(
      <LoginForm callbackUrl="/users" demoAccounts={[{ label: 'Администратор', username: 'emilys', password: 'emilyspass' }]} />,
    );

    await user.click(screen.getByRole('button', { name: /Администратор/ }));

    expect(signIn).toHaveBeenCalledWith('credentials', { username: 'emilys', password: 'emilyspass', redirect: false });
  });
});
