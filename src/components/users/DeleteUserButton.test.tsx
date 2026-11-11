import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { deleteUserAction } from '@/app/users/actions';
import { Toaster } from '@/components/ui/Toaster';
import { makeSession, renderWithProviders, testUser } from '@/test/render';
import { routerMock } from '@/test/router-mock';
import { DeleteUserButton } from './DeleteUserButton';

vi.mock('@/app/users/actions', () => ({
  createUserAction: vi.fn(),
  updateUserAction: vi.fn(),
  deleteUserAction: vi.fn(),
}));

describe('DeleteUserButton', () => {
  it('если сервер отказал (403), показывает причину', async () => {
    vi.mocked(deleteUserAction).mockResolvedValue({ ok: false, code: 'forbidden', message: 'Недостаточно прав для этого действия' });
    const { user } = renderWithProviders(
      <>
        <DeleteUserButton user={testUser} />
        <Toaster />
      </>,
      { session: makeSession('admin') },
    );

    await user.click(screen.getByRole('button', { name: /удалить/i }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Удалить' }));

    expect(await screen.findByText(/Не удалось удалить Alexander Jones: Недостаточно прав/)).toBeInTheDocument();
  });

  it('на странице профиля после удаления переходит к списку', async () => {
    vi.mocked(deleteUserAction).mockResolvedValue({ ok: true });
    const { user } = renderWithProviders(
      <>
        <DeleteUserButton user={testUser} variant="page" />
        <Toaster />
      </>,
      { session: makeSession('admin') },
    );

    await user.click(screen.getByRole('button', { name: /удалить/i }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Удалить' }));

    expect(await screen.findByText('Пользователь Alexander Jones удалён')).toBeInTheDocument();
    expect(routerMock.push).toHaveBeenCalledWith('/users');
  });
});
