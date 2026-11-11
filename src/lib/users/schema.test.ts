import { describe, expect, it } from 'vitest';
import { EMPTY_FORM, validateUserForm, validateUserUpdate, type UserFormInput } from './schema';

const valid: UserFormInput = {
  ...EMPTY_FORM,
  firstName: ' Иван ',
  lastName: 'Петров',
  username: 'Ivan.P',
  email: 'IVAN@example.com',
  phone: '+7 900 123-45-67',
  birthDate: '2000-05-10',
};

describe('userCreateSchema', () => {
  it('нормализует корректные данные', () => {
    const result = validateUserForm(valid);
    expect(result).toEqual({ success: true, data: expect.objectContaining({ firstName: 'Иван', username: 'ivan.p', email: 'ivan@example.com' }) });
  });

  it('возвращает по одной ошибке на поле', () => {
    const result = validateUserForm({ ...valid, firstName: '', email: 'x', image: 'ftp://x' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors).toEqual({
        firstName: 'Укажите имя',
        email: 'Некорректный email',
        image: 'Ссылка должна начинаться с http:// или https://',
      });
    }
  });

  it('отдел без компании — ошибка у поля «Компания»', () => {
    const result = validateUserForm({ ...valid, department: 'Engineering' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors.companyName).toBe('Укажите компанию, к которой относится отдел');
  });

  it('отклоняет данные неверного типа, а не приводит их', () => {
    expect(validateUserForm({ ...valid, role: 'root' }).success).toBe(false);
    expect(validateUserForm(null).success).toBe(false);
  });
});

describe('userUpdateSchema (PATCH)', () => {
  it('принимает часть полей', () => {
    expect(validateUserUpdate({ lastName: 'Сидоров' })).toEqual({ success: true, data: { lastName: 'Сидоров' } });
  });

  it('запрещает пустое изменение и неизвестные поля', () => {
    const empty = validateUserUpdate({});
    expect(empty.success === false && empty.formError).toBe('Нет полей для изменения');
    const typo = validateUserUpdate({ emial: 'a@b.c' });
    expect(typo.success === false && typo.formError).toBe('Неизвестные поля: emial');
  });
});
