import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  /** Сам элемент ввода (<input>, <select>) передаётся через children. */
  children: ReactNode;
}

/** id сообщения об ошибке — поле ссылается на него через aria-describedby. */
export const fieldErrorId = (htmlFor: string) => `${htmlFor}-error`;

/**
 * Подпись + поле + сообщение об ошибке или подсказка.
 * Ошибка связана с полем через aria-describedby: экранный диктор прочитает её
 * вместе с полем, а тест может проверить, что ошибка относится именно к этому полю.
 */
export function FormField({ label, htmlFor, required, error, hint, className = '', children }: FormFieldProps) {
  return (
    <div className={`fieldset py-0 ${className}`}>
      <label htmlFor={htmlFor} className="fieldset-legend pb-1">
        {label}
        {required && <span className="text-error">*</span>}
      </label>
      {children}
      {error ? (
        <p id={fieldErrorId(htmlFor)} className="label text-error" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="label">{hint}</p>
      )}
    </div>
  );
}
