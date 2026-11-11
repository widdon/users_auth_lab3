import { NextResponse } from 'next/server';
import { auth } from '@/auth';

/**
 * Proxy (бывший middleware) выполняется до рендера страницы.
 * Здесь только удобный ранний редирект анонимного пользователя на /login —
 * это НЕ единственный уровень защиты: страницы, Server Functions, Route Handlers
 * и сервисный слой проверяют сессию и роль ещё раз сами.
 */
export const proxy = auth((request) => {
  if (request.auth?.user) return NextResponse.next();

  const loginUrl = new URL('/login', request.nextUrl.origin);
  loginUrl.searchParams.set('callbackUrl', `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
});

export const config = {
  // Закрытые от анонимного пользователя страницы: создание и редактирование
  matcher: ['/users/new', '/users/:id/edit'],
};
