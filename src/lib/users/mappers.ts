import { z } from 'zod';
import type { ApiPost, ApiUser } from './api-schemas';
import { GENDERS, USER_ROLES } from './constants';
import { normalizeDate } from './format';
import type { Post, User } from './types';

// Неизвестное значение заменяется значением по умолчанию — без приведения `as`
const genderSchema = z.enum(GENDERS).catch('female');
const roleSchema = z.enum(USER_ROLES).catch('user');

/**
 * Ответ API → модель интерфейса.
 * Все поля получают значения по умолчанию, поэтому компоненты
 * не проверяют каждое поле на undefined.
 */
export function mapApiUser(raw: ApiUser): User {
  return {
    id: raw.id,
    firstName: raw.firstName ?? '',
    lastName: raw.lastName ?? '',
    age: raw.age ?? 0,
    gender: genderSchema.parse(raw.gender),
    email: raw.email ?? '',
    phone: raw.phone ?? '',
    username: raw.username ?? '',
    birthDate: raw.birthDate ? normalizeDate(raw.birthDate) : '',
    image: raw.image ?? '',
    role: roleSchema.parse(raw.role),
    bloodGroup: raw.bloodGroup ?? '',
    height: raw.height ?? 0,
    weight: raw.weight ?? 0,
    eyeColor: raw.eyeColor ?? '',
    university: raw.university ?? '',
    address: {
      address: raw.address?.address ?? '',
      city: raw.address?.city ?? '',
      state: raw.address?.state ?? '',
      country: raw.address?.country ?? '',
    },
    company: {
      name: raw.company?.name ?? '',
      department: raw.company?.department ?? '',
      title: raw.company?.title ?? '',
    },
  };
}

export function mapApiPost(raw: ApiPost): Post {
  return {
    id: raw.id,
    title: raw.title ?? '',
    body: raw.body ?? '',
    tags: raw.tags ?? [],
    likes: raw.reactions?.likes ?? 0,
    dislikes: raw.reactions?.dislikes ?? 0,
    views: raw.views ?? 0,
  };
}
