import { getUserPosts } from '@/lib/users/api';
import { PostsList } from './PostsList';

interface UserPostsProps {
  userId: number;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Асинхронный серверный компонент: сам загружает данные, на клиент уходит только HTML.
 * Страница оборачивает его в <Suspense> — профиль показывается сразу,
 * а посты «догружаются» потоком (streaming), пока виден плейсхолдер.
 *
 * Параметр ?simulate=posts-error имитирует сбой, чтобы показать
 * локальный error boundary: ломается только эта секция, а не вся страница.
 */
export async function UserPosts({ userId, searchParams }: UserPostsProps) {
  const { simulate } = await searchParams;
  if (simulate === 'posts-error') {
    throw new Error('Сервис постов временно недоступен (симуляция ошибки)');
  }

  const { posts, total } = await getUserPosts(userId);
  return <PostsList posts={posts} total={total} />;
}
