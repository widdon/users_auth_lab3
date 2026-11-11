import { screen, waitFor } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createUserAction, updateUserAction } from '@/app/users/actions';
import { makeSession, renderWithProviders, testUser } from '@/test/render';
import { routerMock } from '@/test/router-mock';
import { UserForm } from './UserForm';

vi.mock('@/app/users/actions', () => ({
  createUserAction: vi.fn(),
  updateUserAction: vi.fn(),
  deleteUserAction: vi.fn(),
}));

/** Заполняет обязательные поля корректными значениями. */
async function fillValidForm(user: UserEvent) {
  await user.type(screen.getByLabelText(/^Имя/), 'Иван');
  await user.type(screen.getByLabelText(/^Фамилия/), 'Петров');
  await user.type(screen.getByLabelText(/^Логин/), 'Ivan.Petrov');
  await user.type(screen.getByLabelText(/^Дата рождения/), '2000-05-10');
  await user.type(screen.getByLabelText(/^Email/), 'Ivan@Example.com');
  await user.type(screen.getByLabelText(/^Телефон/), '+7 900 123-45-67');
}

describe('UserForm', () => {
  it('показывает сообщение Zod рядом с полем при неверном email и не отправляет форму', async () => {
    const { user } = renderWithProviders(<UserForm />, { session: makeSession('user') });

    await fillValidForm(user);
    const email = screen.getByLabelText(/^Email/);
    await user.clear(email);
    await user.type(email, 'not-an-email');
    await user.click(screen.getByRole('button', { name: 'Создать пользователя' }));

    // Сообщение связано с полем через aria-describedby — то есть выводится именно у него
    expect(email).toHaveAccessibleDescription('Некорректный email');
    expect(email).toBeInvalid();
    expect(email).toHaveFocus();
    expect(createUserAction).not.toHaveBeenCalled();
  });

  it('проверяет правила предметной области: возраст и компанию для должности', async () => {
    const { user } = renderWithProviders(<UserForm />, { session: makeSession('user') });

    await fillValidForm(user);
    const birthDate = screen.getByLabelText(/^Дата рождения/);
    await user.clear(birthDate);
    await user.type(birthDate, '2020-01-01');
    await user.type(screen.getByLabelText(/^Должность/), 'Developer');
    await user.click(screen.getByRole('button', { name: 'Создать пользователя' }));

    expect(birthDate).toHaveAccessibleDescription('Возраст должен быть от 14 до 120 лет');
    expect(screen.getByLabelText(/^Компания/)).toHaveAccessibleDescription(
      'Укажите компанию, в которой указана должность',
    );
    expect(createUserAction).not.toHaveBeenCalled();
  });

  it('при корректном вводе вызывает Server Function создания и переходит к списку', async () => {
    vi.mocked(createUserAction).mockImplementation(async () => ({
      status: 'success',
      user: { ...testUser, id: 209, firstName: 'Иван', lastName: 'Петров' },
    }));
    const { user } = renderWithProviders(<UserForm />, { session: makeSession('user') });

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Создать пользователя' }));

    await waitFor(() => expect(createUserAction).toHaveBeenCalledTimes(1));
    // Второй аргумент — значения формы (как их ввёл пользователь; нормализует сервер)
    expect(vi.mocked(createUserAction).mock.calls[0]?.[1]).toMatchObject({
      firstName: 'Иван',
      lastName: 'Петров',
      username: 'Ivan.Petrov',
      email: 'Ivan@Example.com',
      birthDate: '2000-05-10',
      role: 'user',
    });
    await waitFor(() => expect(routerMock.push).toHaveBeenCalledWith('/users'));
  });

  it('показывает ошибки, которые вернул сервер (например, 403 за назначение роли)', async () => {
    vi.mocked(updateUserAction).mockResolvedValue({
      status: 'error',
      code: 'forbidden',
      message: 'Недостаточно прав для этого действия',
      fieldErrors: { email: 'Такой email уже занят' },
    });
    const { user } = renderWithProviders(<UserForm user={testUser} />, { session: makeSession('user') });

    await user.click(screen.getByRole('button', { name: 'Сохранить изменения' }));

    expect(await screen.findByText('Недостаточно прав для этого действия', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email/)).toHaveAccessibleDescription('Такой email уже занят');
    // Редактирование вызывает Server Function изменения: id записи и все значения формы
    expect(updateUserAction).toHaveBeenCalledWith(
      7,
      null,
      { status: 'idle' },
      expect.objectContaining({ email: 'alexander.jones@x.dummyjson.com', role: 'moderator' }),
    );
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it('обычному пользователю роль «Администратор» недоступна, администратору — доступна', () => {
    const { unmount } = renderWithProviders(<UserForm />, { session: makeSession('user') });
    expect(screen.getByRole('option', { name: /Администратор/ })).toBeDisabled();
    unmount();

    renderWithProviders(<UserForm />, { session: makeSession('admin') });
    expect(screen.getByRole('option', { name: 'Администратор' })).toBeEnabled();
  });
});
