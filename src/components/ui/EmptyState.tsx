import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  /** neutral — пустой результат (не ошибка!), error — ошибка загрузки. */
  tone?: 'neutral' | 'error';
  compact?: boolean;
  children?: ReactNode;
}

/**
 * Заглушка для пустого результата и для ошибок.
 * Пустой список оформлен нейтрально (серым), ошибка — красным,
 * чтобы пользователь не путал «ничего не нашлось» и «что-то сломалось».
 */
export function EmptyState({ icon, title, description, tone = 'neutral', compact = false, children }: EmptyStateProps) {
  const toneClasses =
    tone === 'error'
      ? 'border-error/40 bg-error/5 [&_.empty-icon]:bg-error/10 [&_.empty-icon]:text-error'
      : 'border-base-300 bg-base-100 [&_.empty-icon]:bg-base-200 [&_.empty-icon]:text-base-content/50';

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex flex-col items-center justify-center rounded-box border border-dashed text-center ${toneClasses} ${
        compact ? 'px-4 py-8' : 'px-6 py-16'
      }`}
    >
      <div className={`empty-icon mb-4 grid place-items-center rounded-full ${compact ? 'size-12' : 'size-16'}`}>
        {icon}
      </div>
      <h2 className={`font-semibold ${compact ? 'text-base' : 'text-lg'}`}>{title}</h2>
      {description && <p className="mt-1 max-w-md text-sm text-base-content/60">{description}</p>}
      {children && <div className="mt-5 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  );
}
