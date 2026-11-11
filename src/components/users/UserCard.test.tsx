import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { deleteUserAction } from '@/app/users/actions';
import { makeSession, renderWithProviders, testUser } from '@/test/render';
import { UserCard } from './UserCard';

// Server Functions выполняются на сервере — в компонентном тесте подменяем их моками,
// чтобы проверить, что интерфейс вызывает нужное действие с нужными аргументами
vi.mock('@/app/users/actions', () => ({
  createUserAction: vi.fn(),
  updateUserAction: vi.fn(),
  deleteUserAction: vi.fn(),
}));

describe('UserCard', () => {
  it('показывает переданные данные пользователя', () => {
    renderWithProviders(<UserCard user={testUser} />);

    expect(screen.getByRole('heading', { name: 'Alexander Jones' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Alexander Jones' })).toHaveAttribute('href', '/users/7');
    expect(screen.getByText('@alexanderj')).toBeInTheDocument();
    expect(screen.getByText('alexander.jones@x.dummyjson.com')).toBeInTheDocument();
    expect(screen.getByText('+61 260-824-4986')).toBeInTheDocument();
    expect(screen.getByText('Модератор')).toBeInTheDocument();
    expect(screen.getByText('Denver, United States')).toBeInTheDocument();
  });

  it('анониму не показывает ни изменения, ни удаления', () => {
    renderWithProviders(<UserCard user={testUser} />, { session: null });

    expect(screen.queryByRole('link', { name: /изменить/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /удалить/i })).not.toBeInTheDocument();
  });

  it('обычный пользователь видит «Изменить», но не видит «Удалить»', () => {
    renderWithProviders(<UserCard user={testUser} />, { session: makeSession('user') });

    expect(screen.getByRole('link', { name: /изменить/i })).toHaveAttribute('href', '/users/7/edit');
    expect(screen.queryByRole('button', { name: /удалить/i })).not.toBeInTheDocument();
  });

  it('администратор видит «Удалить» и может удалить запись после подтверждения', async () => {
    vi.mocked(deleteUserAction).mockResolvedValue({ ok: true });
    const { user } = renderWithProviders(<UserCard user={testUser} />, { session: makeSession('admin') });

    await user.click(screen.getByRole('button', { name: /удалить/i }));

    const dialog = screen.getByRole('dialog', { name: 'Удалить пользователя?' });
    expect(within(dialog).getByText('Alexander Jones')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Удалить' }));

    expect(deleteUserAction).toHaveBeenCalledTimes(1);
    expect(deleteUserAction).toHaveBeenCalledWith(7, { local: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('администратор может передумать: «Отмена» не вызывает удаление', async () => {
    const { user } = renderWithProviders(<UserCard user={testUser} />, { session: makeSession('admin') });

    await user.click(screen.getByRole('button', { name: /удалить/i }));
    await user.click(screen.getByRole('button', { name: 'Отмена' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(deleteUserAction).not.toHaveBeenCalled();
  });
});
