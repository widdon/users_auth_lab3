import Link from 'next/link';
import type { ReactNode } from 'react';
import { GENDER_LABELS } from '@/lib/users/constants';
import { formatDate, getFullName, pluralizeYears } from '@/lib/users/format';
import type { User } from '@/lib/users/types';
import { Avatar } from '../ui/Avatar';
import { BriefcaseIcon, CakeIcon, MailIcon, MapPinIcon, PhoneIcon } from '../ui/Icons';
import { RoleBadge } from '../ui/RoleBadge';
import { UserActions } from './UserActions';

function InfoRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex min-w-0 items-center gap-2.5">
      <span className="shrink-0 text-base-content/40">{icon}</span>
      <span className="truncate">{children}</span>
    </li>
  );
}

interface UserCardProps {
  user: User;
  /** Пользователь создан или изменён в этой сессии — показываем пометку. */
  isLocal?: boolean;
}

/**
 * Карточка пользователя. Компонент без директивы: собственного состояния
 * и обработчиков у него нет. Он рендерится внутри клиентского списка, поэтому
 * попадает в клиентский бандл; интерактивные части (Avatar, UserActions) —
 * отдельные клиентские компоненты.
 */
export function UserCard({ user, isLocal = false }: UserCardProps) {
  const fullName = getFullName(user);
  const location = [user.address.city, user.address.country].filter(Boolean).join(', ');
  const job = [user.company.title, user.company.name].filter(Boolean).join(' · ');

  return (
    <article className="card h-full border border-base-300 bg-base-100 shadow-sm transition-shadow hover:shadow-md">
      <div className="card-body gap-4 p-5">
        <header className="flex items-start gap-4">
          <Avatar src={user.image} name={fullName} size="lg" />
          <div className="min-w-0 flex-1">
            <h2 className="card-title truncate text-base leading-tight">
              <Link href={`/users/${user.id}`} className="link link-hover">
                {fullName}
              </Link>
            </h2>
            <p className="truncate text-sm text-base-content/60">@{user.username}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <RoleBadge role={user.role} />
              <span className="badge badge-ghost badge-sm">{GENDER_LABELS[user.gender]}</span>
              {user.age > 0 && <span className="badge badge-ghost badge-sm">{pluralizeYears(user.age)}</span>}
              {isLocal && <span className="badge badge-warning badge-soft badge-sm">изменено локально</span>}
            </div>
          </div>
        </header>

        <ul className="space-y-1.5 text-sm">
          <InfoRow icon={<MailIcon />}>{user.email}</InfoRow>
          <InfoRow icon={<PhoneIcon />}>{user.phone}</InfoRow>
          {user.birthDate && <InfoRow icon={<CakeIcon />}>{formatDate(user.birthDate)}</InfoRow>}
          {location && <InfoRow icon={<MapPinIcon />}>{location}</InfoRow>}
          {job && <InfoRow icon={<BriefcaseIcon />}>{job}</InfoRow>}
        </ul>

        <div className="card-actions mt-auto min-h-8 justify-end border-t border-base-200 pt-3">
          <UserActions user={user} />
        </div>
      </div>
    </article>
  );
}
