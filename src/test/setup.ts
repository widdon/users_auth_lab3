import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  sessionStorage.clear();
});

// jsdom не реализует showModal()/close() у <dialog> — добавляем минимальную замену
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
  };
}

// Маршрутизатор Next.js в тестах не нужен: подменяем хуки навигации заглушками
vi.mock('next/navigation', async () => {
  const { routerMock } = await import('./router-mock');
  return {
    useRouter: () => routerMock,
    usePathname: () => '/users',
    useSearchParams: () => new URLSearchParams(),
  };
});
