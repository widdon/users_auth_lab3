import { ROLE_LABELS } from '@/lib/users/constants';
import type { UserRole } from '@/lib/users/types';

const ROLE_CLASSES: Record<UserRole, string> = {
  admin: 'badge-primary',
  moderator: 'badge-secondary',
  user: 'badge-info',
};

export function RoleBadge({ role }: { role: UserRole }) {
  return <span className={`badge badge-soft badge-sm ${ROLE_CLASSES[role]}`}>{ROLE_LABELS[role]}</span>;
}
