import type { Post } from '@/lib/users/types';
import { EmptyState } from '../ui/EmptyState';
import { EyeIcon, HeartIcon } from '../ui/Icons';

interface PostsListProps {
  posts: Post[];
  total: number;
}

/** Список постов — чистая разметка без состояния; данные загружает UserPosts. */
export function PostsList({ posts, total }: PostsListProps) {
  if (posts.length === 0) {
    return <EmptyState compact icon={<EyeIcon className="size-5" />} title="Постов пока нет" />;
  }

  return (
    <div className="flex flex-col gap-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {total > posts.length && (
        <p className="text-center text-sm text-base-content/50">
          Показаны последние {posts.length} из {total}
        </p>
      )}
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  return (
    <article className="rounded-box border border-base-300 bg-base-100 p-4">
      <h3 className="font-semibold">{post.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-base-content/70">{post.body}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-base-content/60">
        {post.tags.map((tag) => (
          <span key={tag} className="badge badge-ghost badge-sm">
            #{tag}
          </span>
        ))}
        <span className="ml-auto inline-flex items-center gap-1">
          <HeartIcon className="size-3.5" />
          {post.likes}
        </span>
        <span className="inline-flex items-center gap-1">
          <EyeIcon className="size-3.5" />
          {post.views}
        </span>
      </div>
    </article>
  );
}
