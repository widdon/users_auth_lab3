import Link from 'next/link';
import { ArrowLeftIcon, LockIcon } from '../ui/Icons';
import { EmptyState } from '../ui/EmptyState';

interface AccessDeniedProps {
  title?: string;
  description?: string;
}

/** Сообщение «нет доступа» (403) для страниц: пользователь вошёл, но прав не хватает. */
export function AccessDenied({
  title = 'Нет доступа',
  description = 'У вашей роли нет прав на это действие. Обратитесь к администратору.',
}: AccessDeniedProps) {
  return (
    <EmptyState tone="error" icon={<LockIcon className="size-7" />} title={title} description={description}>
      <Link href="/users" className="btn btn-primary">
        <ArrowLeftIcon />К списку
      </Link>
    </EmptyState>
  );
}
