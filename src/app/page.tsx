import { redirect } from 'next/navigation';

/** Главная страница — сразу ведём на список пользователей. */
export default function HomePage() {
  redirect('/users');
}
