import NextAuth, { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { AuthServiceError, loginWithDummyJson } from '@/lib/auth/dummyjson-auth';
import { loginSchema } from '@/lib/auth/login-schema';
import { accessRoleSchema } from '@/lib/auth/permissions';

/**
 * Конфигурация Auth.js (next-auth v5).
 *
 * Аутентификация — Credentials provider: логин и пароль проверяет DummyJSON.
 * Сессия — стратегия 'jwt': после входа Auth.js кладёт данные пользователя
 * в зашифрованный JWT (JWE, ключ — AUTH_SECRET) и сохраняет его в cookie
 * `authjs.session-token` с флагами httpOnly, sameSite=lax и secure (на https).
 * JavaScript страницы этот cookie прочитать не может, в localStorage ничего не пишется.
 * Браузер сам отправляет cookie с каждым запросом, поэтому после обновления
 * страницы сессия сохраняется, а сервер узнаёт пользователя в каждом запросе.
 */

class InvalidCredentials extends CredentialsSignin {
  code = 'invalid_credentials';
}

class ServiceUnavailable extends CredentialsSignin {
  code = 'service_unavailable';
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Секрет Auth.js берёт из переменной окружения AUTH_SECRET
  // (её наличие и длину при старте сервера проверяет Zod — см. instrumentation.ts)
  // Приложение запускается на localhost через `next start`, без прокси Vercel
  trustHost: true,
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Логин' },
        password: { label: 'Пароль', type: 'password' },
      },
      async authorize(credentials) {
        // Повторная проверка на сервере: в authorize можно попасть и без нашей формы
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) throw new InvalidCredentials();

        try {
          const user = await loginWithDummyJson(parsed.data);
          if (!user) throw new InvalidCredentials();
          return user;
        } catch (error) {
          if (error instanceof AuthServiceError) {
            console.error('Ошибка входа через DummyJSON:', error.message);
            throw new ServiceUnavailable();
          }
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    /** Вызывается при входе (есть user) и при каждом чтении сессии (только token). */
    jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    /** Что попадёт в объект сессии (auth() на сервере, useSession() на клиенте). */
    session({ session, token }) {
      const role = accessRoleSchema.safeParse(token.role);
      session.user.id = typeof token.uid === 'string' ? token.uid : '';
      session.user.username = typeof token.username === 'string' ? token.username : '';
      // Если в токене неизвестная роль — права минимальные
      session.user.role = role.success ? role.data : 'user';
      return session;
    },
  },
});
