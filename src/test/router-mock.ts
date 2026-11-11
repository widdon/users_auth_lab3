import { vi } from 'vitest';

/** Заглушка маршрутизатора Next.js: тест проверяет, куда компонент переходит. */
export const routerMock = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
};
