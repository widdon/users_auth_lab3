import Link from 'next/link';
import { EmptyState } from '@/components/ui/EmptyState';
import { ArrowLeftIcon, UsersIcon } from '@/components/ui/Icons';

/** Показывается при вызове notFound() — например, для /users/abc. */
export default function UserNotFound() {
  return (
    <EmptyState
      icon={<UsersIcon className="size-7" />}
      title="Пользователь не найден"
      description="Проверьте адрес: идентификатор должен быть положительным числом."
    >
      <Link href="/users" className="btn btn-primary">
        <ArrowLeftIcon />К списку
      </Link>
    </EmptyState>
  );
}
