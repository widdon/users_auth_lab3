'use client';

import Image from 'next/image';
import { useState } from 'react';
import { getInitials } from '@/lib/users/format';

interface AvatarProps {
  src: string;
  name: string;
  size?: 'md' | 'lg' | 'xl';
  priority?: boolean;
}

const SIZES = {
  md: { px: 40, className: 'w-10 text-sm' },
  lg: { px: 56, className: 'w-14 text-lg' },
  xl: { px: 96, className: 'w-24 text-3xl' },
} as const;

const PLACEHOLDER_COLORS = [
  'bg-primary text-primary-content',
  'bg-secondary text-secondary-content',
  'bg-accent text-accent-content',
  'bg-info text-info-content',
  'bg-success text-success-content',
  'bg-warning text-warning-content',
];

function pickColor(name: string): string {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return PLACEHOLDER_COLORS[Math.abs(hash) % PLACEHOLDER_COLORS.length]!;
}

/**
 * Клиентский компонент, потому что хранит состояние «картинка не загрузилась»
 * и реагирует на событие onError. При ошибке показываются инициалы.
 *
 * Картинки DummyJSON идут через next/image (оптимизация, домен разрешён в next.config.ts).
 * Для произвольной ссылки из формы используется обычный <img> — next/image
 * не пропустит домен, которого нет в remotePatterns.
 */
export function Avatar({ src, name, size = 'md', priority = false }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const { px, className } = SIZES[size];
  const showImage = Boolean(src) && failedSrc !== src;
  const isDummyJson = src.startsWith('https://dummyjson.com/');

  return (
    <div className={`avatar ${showImage ? '' : 'avatar-placeholder'}`}>
      <div className={`rounded-full ${className} ${showImage ? 'bg-base-200' : pickColor(name)}`}>
        {showImage ? (
          isDummyJson ? (
            <Image src={src} alt={name} width={px} height={px} priority={priority} onError={() => setFailedSrc(src)} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={name} width={px} height={px} onError={() => setFailedSrc(src)} />
          )
        ) : (
          <span className="font-semibold">{getInitials(name) || '?'}</span>
        )}
      </div>
    </div>
  );
}
