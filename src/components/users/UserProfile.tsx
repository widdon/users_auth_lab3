import type { ReactNode } from 'react';
import { GENDER_LABELS } from '@/lib/users/constants';
import { formatDate, getFullName, pluralizeYears } from '@/lib/users/format';
import type { User } from '@/lib/users/types';
import { Avatar } from '../ui/Avatar';
import { BriefcaseIcon, GraduationIcon, MailIcon, MapPinIcon, PhoneIcon } from '../ui/Icons';
import { RoleBadge } from '../ui/RoleBadge';
import { UserActions } from './UserActions';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium tracking-wide text-base-content/50 uppercase">{label}</dt>
      <dd className="mt-1 truncate">{children || <span className="text-base-content/40">не указано</span>}</dd>
    </div>
  );
}

interface UserProfileProps {
  user: User;
  /** Версия из store (создана/изменена в этой сессии). */
  isLocal?: boolean;
}

/**
 * Профиль пользователя. Компонент без состояния и без директивы:
 * на странице /users/[id] он рендерится на сервере, а если у пользователя
 * есть локальная версия — тот же компонент рендерит клиентский UserDetails.
 */
export function UserProfile({ user, isLocal = false }: UserProfileProps) {
  const fullName = getFullName(user);
  const location = [user.address.address, user.address.city, user.address.state, user.address.country]
    .filter(Boolean)
    .join(', ');
  const physical = [
    user.height ? `${user.height} см` : '',
    user.weight ? `${user.weight} кг` : '',
    user.eyeColor ? `глаза: ${user.eyeColor}` : '',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body items-center text-center">
          <Avatar src={user.image} name={fullName} size="xl" priority />
          <h1 className="mt-2 text-2xl font-bold">{fullName}</h1>
          <p className="text-base-content/60">@{user.username}</p>
          <div className="mt-1 flex flex-wrap justify-center gap-1.5">
            <RoleBadge role={user.role} />
            {isLocal && <span className="badge badge-warning badge-soft badge-sm">изменено локально</span>}
          </div>
          <div className="mt-4 flex w-full flex-wrap justify-center gap-2">
            <UserActions user={user} variant="page" />
          </div>
        </div>
      </section>

      <section className="card border border-base-300 bg-base-100 shadow-sm lg:col-span-2">
        <div className="card-body">
          <h2 className="card-title text-lg">Сведения</h2>
          <dl className="mt-2 grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <Field label="Email">
              <a href={`mailto:${user.email}`} className="link link-hover inline-flex items-center gap-2">
                <MailIcon className="size-4 opacity-50" />
                {user.email}
              </a>
            </Field>
            <Field label="Телефон">
              <span className="inline-flex items-center gap-2">
                <PhoneIcon className="size-4 opacity-50" />
                {user.phone}
              </span>
            </Field>
            <Field label="Дата рождения">
              {user.birthDate && `${formatDate(user.birthDate)}${user.age ? ` (${pluralizeYears(user.age)})` : ''}`}
            </Field>
            <Field label="Пол">{GENDER_LABELS[user.gender]}</Field>
            <Field label="Адрес">
              {location && (
                <span className="inline-flex items-center gap-2">
                  <MapPinIcon className="size-4 shrink-0 opacity-50" />
                  <span className="truncate">{location}</span>
                </span>
              )}
            </Field>
            <Field label="Университет">
              {user.university && (
                <span className="inline-flex items-center gap-2">
                  <GraduationIcon className="size-4 shrink-0 opacity-50" />
                  <span className="truncate">{user.university}</span>
                </span>
              )}
            </Field>
            <Field label="Компания">
              {user.company.name && (
                <span className="inline-flex items-center gap-2">
                  <BriefcaseIcon className="size-4 shrink-0 opacity-50" />
                  <span className="truncate">{user.company.name}</span>
                </span>
              )}
            </Field>
            <Field label="Должность">
              {[user.company.title, user.company.department].filter(Boolean).join(', ')}
            </Field>
            <Field label="Группа крови">{user.bloodGroup}</Field>
            <Field label="Параметры">{physical}</Field>
          </dl>
        </div>
      </section>
    </div>
  );
}
