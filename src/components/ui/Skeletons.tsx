/** Плейсхолдеры на время загрузки. Серверные компоненты: состояния и событий нет. */

export function UserCardSkeleton() {
  return (
    <div className="card border border-base-300 bg-base-100 p-5" aria-hidden="true">
      <div className="flex items-center gap-4">
        <div className="skeleton size-14 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-2">
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-5/6" />
        <div className="skeleton h-3 w-2/3" />
      </div>
    </div>
  );
}

export function UsersGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Загрузка пользователей">
      {Array.from({ length: count }, (_, i) => (
        // Статичный список, который никогда не меняется, — индекс как key здесь допустим
        <UserCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ToolbarSkeleton() {
  return (
    <div className="rounded-box border border-base-300 bg-base-100 p-4" aria-hidden="true">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="skeleton h-10 w-full lg:max-w-sm" />
        <div className="skeleton h-10 w-full lg:w-40" />
        <div className="skeleton h-10 w-full lg:w-40" />
        <div className="skeleton h-10 w-full lg:ml-auto lg:w-36" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3" aria-busy="true" aria-label="Загрузка профиля">
      <div className="card border border-base-300 bg-base-100 p-6 lg:col-span-1">
        <div className="flex flex-col items-center gap-3">
          <div className="skeleton size-24 rounded-full" />
          <div className="skeleton h-5 w-40" />
          <div className="skeleton h-4 w-24" />
          <div className="skeleton mt-4 h-9 w-full" />
        </div>
      </div>
      <div className="card border border-base-300 bg-base-100 p-6 lg:col-span-2">
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="skeleton h-3 w-24" />
              <div className="skeleton h-4 w-40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PostsSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Загрузка постов">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="rounded-box border border-base-300 bg-base-100 p-4">
          <div className="skeleton h-4 w-2/3" />
          <div className="skeleton mt-3 h-3 w-full" />
          <div className="skeleton mt-2 h-3 w-5/6" />
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="card border border-base-300 bg-base-100 p-6" aria-busy="true" aria-label="Загрузка формы">
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="skeleton h-3 w-20" />
            <div className="skeleton h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
