import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';
import { Toaster } from '@/components/ui/Toaster';
import { themeInitScript } from '@/lib/theme';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: { template: '%s — Users', default: 'Users — справочник пользователей' },
  description: 'Лабораторная работа №2: Next.js App Router и DummyJSON (вариант 5 — Users)',
};

/** Корневой layout — серверный компонент. Он общий для всех страниц и не перерисовывается при навигации. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-base-200 antialiased">
        <Providers>
          <Header />
          <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6">{children}</main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
