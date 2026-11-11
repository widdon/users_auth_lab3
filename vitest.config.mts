import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * Vitest: компонентные тесты в jsdom (браузерное окружение, эмулированное в Node).
 * Покрытие — @vitest/coverage-v8: `npm run test:coverage`, отчёт в ./coverage.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    // Одно окружение jsdom на поток (изоляция файлов сохраняется) — тесты идут быстрее
    pool: 'vmThreads',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/components/**', 'src/hooks/**', 'src/lib/**', 'src/store/**'],
      exclude: [
        'src/test/**',
        '**/*.test.{ts,tsx}',
        // Серверный код (запросы к DummyJSON, сессия, env) выполняется только в Node.js
        // внутри Next.js; его проверяли сквозным прогоном приложения, а не в jsdom
        'src/lib/users/api.ts',
        'src/lib/users/service.ts',
        'src/lib/users/http.ts',
        'src/lib/auth/session.ts',
        'src/lib/auth/dummyjson-auth.ts',
        'src/lib/env.ts',
      ],
    },
  },
});
