import Link from 'next/link';
import { getFullName } from '@/lib/users/format';
import type { User } from '@/lib/users/types';
import { Avatar } from '../ui/Avatar';
import { RoleBadge } from '../ui/RoleBadge';
import { UserActions } from './UserActions';

interface UsersTableProps {
  users: User[];
  localIds: Set<number>;
}

/** Компактный табличный вид списка (переключается в панели инструментов). */
export function UsersTable({ users, localIds }: UsersTableProps) {
  return (
    <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100 shadow-sm">
      <table className="table">
        <thead>
          <tr>
            <th>Пользователь</th>
            <th className="hidden md:table-cell">Email</th>
            <th className="hidden lg:table-cell">Компания</th>
            <th>Роль</th>
            <th className="text-right">Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-base-200/50">
              <td>
                <div className="flex items-center gap-3">
                  <Avatar src={user.image} name={getFullName(user)} />
                  <div className="min-w-0">
                    <Link href={`/users/${user.id}`} className="link link-hover font-medium">
                      {getFullName(user)}
                    </Link>
                    <div className="text-xs text-base-content/60">
                      @{user.username}
                      {localIds.has(user.id) && <span className="ml-2 text-warning">• изменено</span>}
                    </div>
                  </div>
                </div>
              </td>
              <td className="hidden md:table-cell">{user.email}</td>
              <td className="hidden lg:table-cell">{user.company.name || '—'}</td>
              <td>
                <RoleBadge role={user.role} />
              </td>
              <td>
                <div className="flex justify-end gap-1">
                  <UserActions user={user} variant="table" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
