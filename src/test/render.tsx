import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import type { ReactElement, ReactNode } from 'react';
import type { AccessRole } from '@/lib/auth/permissions';
import type { User } from '@/lib/users/types';
import { UsersStoreProvider } from '@/store/users-store-provider';

/** Сессия вошедшего пользователя с нужной ролью (как её отдаёт Auth.js). */
export function makeSession(role: AccessRole, overrides: Partial<Session['user']> = {}): Session {
  return {
    expires: '2099-01-01T00:00:00.000Z',
    user: {
      id: role === 'admin' ? '1' : '16',
      username: role === 'admin' ? 'emilys' : 'averyp',
      name: role === 'admin' ? 'Emily Johnson' : 'Avery Perez',
      email: 'test@example.com',
      role,
      ...overrides,
    },
  };
}

interface Options extends Omit<RenderOptions, 'wrapper'> {
  /** null — аноним; объект сессии — вошедший пользователь. */
  session?: Session | null;
}

/**
 * Рендер компонента с теми же провайдерами, что и в приложении:
 * SessionProvider (сессия передаётся сразу, без запроса к /api/auth/session)
 * и Zustand store. Возвращает и объект userEvent для действий пользователя.
 */
export function renderWithProviders(ui: ReactElement, { session = null, ...options }: Options = {}) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <SessionProvider session={session} refetchOnWindowFocus={false}>
        <UsersStoreProvider>{children}</UsersStoreProvider>
      </SessionProvider>
    );
  }
  return { user: userEvent.setup(), ...render(ui, { wrapper: Wrapper, ...options }) };
}

export const testUser: User = {
  id: 7,
  firstName: 'Alexander',
  lastName: 'Jones',
  age: 34,
  gender: 'male',
  email: 'alexander.jones@x.dummyjson.com',
  phone: '+61 260-824-4986',
  username: 'alexanderj',
  birthDate: '1990-10-09',
  image: '',
  role: 'moderator',
  bloodGroup: 'AB-',
  height: 175,
  weight: 70,
  eyeColor: 'Hazel',
  university: 'University of Colorado',
  address: { address: '1 Main St', city: 'Denver', state: 'Colorado', country: 'United States' },
  company: { name: 'Acme', department: 'Engineering', title: 'Engineer' },
};
