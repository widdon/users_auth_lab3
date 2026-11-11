'use client';

import { THEME_STORAGE_KEY } from '@/lib/theme';
import { MoonIcon, SunIcon } from './Icons';

/**
 * Кнопка не хранит тему в состоянии React: на сервере тема неизвестна,
 * и разное состояние на сервере и клиенте дало бы ошибку гидратации.
 * Нужная иконка выбирается через CSS по атрибуту data-theme.
 */
export function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // storage недоступен — тема просто не запомнится
    }
  };

  return (
    <button type="button" className="btn btn-square btn-ghost btn-sm" onClick={toggle} title="Сменить тему" aria-label="Сменить тему">
      <MoonIcon className="size-4 dark:hidden" />
      <SunIcon className="hidden size-4 dark:block" />
    </button>
  );
}
