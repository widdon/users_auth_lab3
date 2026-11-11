import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { makeSession, renderWithProviders } from '@/test/render';
import { UsersToolbar } from './UsersToolbar';

function renderToolbar(session: Parameters<typeof renderWithProviders>[1] = {}) {
  const handlers = {
    onSearchTextChange: vi.fn(),
    onRoleChange: vi.fn(),
    onSortChange: vi.fn(),
    onReset: vi.fn(),
    onRefresh: vi.fn(),
  };
  const result = renderWithProviders(
    <UsersToolbar searchText="" role="all" sort="default" canReset={false} isRefreshing={false} {...handlers} />,
    session,
  );
  return { ...result, handlers };
}

describe('UsersToolbar', () => {
  it('кнопку «Добавить» видит только вошедший пользователь', () => {
    const { unmount } = renderToolbar({ session: null });
    expect(screen.queryByRole('link', { name: /добавить/i })).not.toBeInTheDocument();
    unmount();

    renderToolbar({ session: makeSession('user') });
    expect(screen.getByRole('link', { name: /добавить/i })).toHaveAttribute('href', '/users/new');
  });

  it('передаёт выбранные фильтры родителю уже проверенными', async () => {
    const { user, handlers } = renderToolbar();

    await user.selectOptions(screen.getByRole('combobox', { name: 'Фильтр по роли' }), 'admin');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Сортировка' }), 'age-desc');
    await user.type(screen.getByRole('searchbox', { name: 'Поиск пользователей' }), 'a');

    expect(handlers.onRoleChange).toHaveBeenCalledWith('admin');
    expect(handlers.onSortChange).toHaveBeenCalledWith('age-desc');
    expect(handlers.onSearchTextChange).toHaveBeenCalledWith('a');
  });
});
