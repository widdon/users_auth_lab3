import type { DefaultSession } from 'next-auth';
import type { AccessRole } from '@/lib/auth/permissions';

/** Расширение типов Auth.js: в пользователе, сессии и JWT есть роль и логин. */
declare module 'next-auth' {
  interface User {
    username?: string;
    role?: AccessRole;
  }

  interface Session {
    user: {
      id: string;
      username: string;
      role: AccessRole;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    uid?: string;
    username?: string;
    role?: AccessRole;
  }
}
