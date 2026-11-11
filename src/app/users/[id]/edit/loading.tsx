import { FormSkeleton } from '@/components/ui/Skeletons';

export default function EditUserLoading() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <div className="skeleton h-8 w-28" />
      <div className="skeleton h-8 w-72" />
      <FormSkeleton />
    </div>
  );
}
