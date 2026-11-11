import type { User } from './types';

/**
 * Форматирование без Intl и без зависимости от часового пояса:
 * сервер и браузер должны получить одинаковую строку, иначе будет
 * ошибка гидратации (hydration mismatch).
 */

const MONTHS = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

/** DummyJSON отдаёт даты без ведущих нулей ("1996-5-30") — приводим к YYYY-MM-DD. */
export function normalizeDate(value: string): string {
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return value;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export function formatDate(value: string): string {
  const [year, month, day] = normalizeDate(value).split('-').map(Number);
  if (!year || !month || !day || month > 12) return value;
  return `${day} ${MONTHS[month - 1]} ${year} г.`;
}

/** Возраст в полных годах. Вызывать только вне рендера (валидация, Server Function). */
export function calcAge(birthDate: string, today: Date = new Date()): number {
  const [year, month, day] = normalizeDate(birthDate).split('-').map(Number);
  if (!year || !month || !day) return 0;
  let age = today.getFullYear() - year;
  const hadBirthday = today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day);
  if (!hadBirthday) age -= 1;
  return age;
}

/** 21 год, 23 года, 30 лет */
export function pluralizeYears(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} год`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} года`;
  return `${n} лет`;
}

export function getFullName(user: Pick<User, 'firstName' | 'lastName'>): string {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}
