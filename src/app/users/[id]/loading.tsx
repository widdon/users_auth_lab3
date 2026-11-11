import { PostsSkeleton, ProfileSkeleton } from '@/components/ui/Skeletons';

export default function UserLoading() {
  return (
    <>
      <div className="skeleton h-8 w-28" />
      <ProfileSkeleton />
      <PostsSkeleton />
    </>
  );
}
