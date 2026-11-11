import { ToolbarSkeleton, UsersGridSkeleton } from '@/components/ui/Skeletons';

/**
 * Первоначальная загрузка списка. Next.js автоматически оборачивает page.tsx
 * в <Suspense fallback={<Loading />}> и показывает эту разметку сразу,
 * пока сервер получает данные.
 */
export default function UsersLoading() {
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold">Пользователи</h1>
        <div className="skeleton mt-2 h-4 w-80 max-w-full" />
      </div>
      <ToolbarSkeleton />
      <UsersGridSkeleton count={9} />
    </>
  );
}
