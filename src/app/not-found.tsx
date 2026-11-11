import Link from 'next/link';
import { EmptyState } from '@/components/ui/EmptyState';
import { ArrowLeftIcon, SearchIcon } from '@/components/ui/Icons';

export default function NotFound() {
  return (
    <EmptyState
      icon={<SearchIcon className="size-7" />}
      title="Страница не найдена"
      description="Проверьте адрес или вернитесь к списку пользователей."
    >
      <Link href="/users" className="btn btn-primary">
        <ArrowLeftIcon />К списку
      </Link>
    </EmptyState>
  );
}
