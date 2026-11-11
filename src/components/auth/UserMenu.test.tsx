import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { makeSession, renderWithProviders } from '@/test/render';
import { UserMenu } from './UserMenu';

describe('UserMenu', () => {
  it('анониму показывает ссылку «Войти» с возвратом на текущую страницу', () => {
    renderWithProviders(<UserMenu />, { session: null });

    expect(screen.getByRole('link', { name: 'Войти' })).toHaveAttribute('href', '/login?callbackUrl=%2Fusers');
    expect(screen.queryByRole('button', { name: 'Выйти' })).not.toBeInTheDocument();
  });

  it('показывает текущего пользователя, его роль и кнопку «Выйти»', () => {
    renderWithProviders(<UserMenu />, { session: makeSession('admin') });

    expect(screen.getByText('Emily Johnson')).toBeInTheDocument();
    expect(screen.getByText('Администратор')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Выйти' })).toBeEnabled();
  });
});
