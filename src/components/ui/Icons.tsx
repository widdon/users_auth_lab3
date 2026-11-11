import type { SVGProps } from 'react';

/**
 * Набор простых SVG-иконок (контуры в стиле Lucide).
 * Все иконки — обычные функциональные компоненты, принимающие стандартные props <svg>.
 */
type IconProps = SVGProps<SVGSVGElement>;

function BaseIcon({ children, className = 'size-4', ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
}

export const UsersIcon = (p: IconProps) => (
  <BaseIcon {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </BaseIcon>
);

export const PlusIcon = (p: IconProps) => (
  <BaseIcon {...p}>
    <path d="M12 5v14M5 12h14" />
  </BaseIcon>
);

export const SearchIcon = (p: IconProps) => (
  <BaseIcon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </BaseIcon>
);

export const PencilIcon = (p: IconProps) => (
  <BaseIcon {...p}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </BaseIcon>
);

export const TrashIcon = (p: IconProps) => (
  <BaseIcon {...p}>
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
  </BaseIcon>
);

export const MailIcon = (p: IconProps) => (
  <BaseIcon {...p}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 6L2 7" />
  </BaseIcon>
);

export const PhoneIcon = (p: IconProps) => (
  <BaseIcon {...p}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.1 9.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
  </BaseIcon>
);

export const MapPinIcon = (p: IconProps) => (
  <BaseIcon {...p}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </BaseIcon>
);

export const BriefcaseIcon = (p: IconProps) => (
  <BaseIcon {...p}>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </BaseIcon>
);

export const CakeIcon = (p: IconProps) => (
  <BaseIcon {...p}>
    <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1M2 21h20M7 8v3M12 8v3M17 8v3M7 4h.01M12 4h.01M17 4h.01" />
  </BaseIcon>
);

export const SunIcon = (p: IconProps) => (
  <BaseIcon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </BaseIcon>
);

export const MoonIcon = (p: IconProps) => (
  <BaseIcon {...p}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </BaseIcon>
);

export const RotateIcon = (p: IconProps) => (
  <BaseIcon {...p}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </BaseIcon>
);

export const XIcon = (p: IconProps) => (
  <BaseIcon {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </BaseIcon>
);

export const FilterXIcon = (p: IconProps) => (
  <BaseIcon {...p}>
    <path d="M13 13v8l-4-2v-6L3 4h18l-3.5 4.5" />
    <path d="m22 9-5 5M17 9l5 5" />
  </BaseIcon>
);

export const ArrowLeftIcon = (p: IconProps) => (
  <BaseIcon {...p}>
    <path d="m12 19-7-7 7-7M19 12H5" />
  </BaseIcon>
);

export const RefreshIcon = (p: IconProps) => (
  <BaseIcon {...p}>
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M3 21v-5h5M21 3v5h-5" />
  </BaseIcon>
);

export const GridIcon = (p: IconProps) => (
  <BaseIcon {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </BaseIcon>
);

export const ListIcon = (p: IconProps) => (
  <BaseIcon {...p}>
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
  </BaseIcon>
);

export const AlertIcon = (p: IconProps) => (
  <BaseIcon {...p}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
    <path d="M12 9v4M12 17h.01" />
  </BaseIcon>
);

export const GraduationIcon = (p: IconProps) => (
  <BaseIcon {...p}>
    <path d="M22 10 12 5 2 10l10 5 10-5Z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </BaseIcon>
);

export const HeartIcon = (p: IconProps) => (
  <BaseIcon {...p}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </BaseIcon>
);

export const EyeIcon = (p: IconProps) => (
  <BaseIcon {...p}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </BaseIcon>
);

export const CloudOffIcon = (p: IconProps) => (
  <BaseIcon {...p}>
    <path d="m2 2 20 20" />
    <path d="M5.78 5.78A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 1.31-.2" />
    <path d="M21.53 16.53A4.5 4.5 0 0 0 17.5 10h-1.79A7 7 0 0 0 9.5 5.05" />
  </BaseIcon>
);

export const LogInIcon = (p: IconProps) => (
  <BaseIcon {...p}>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" x2="3" y1="12" y2="12" />
  </BaseIcon>
);

export const LogOutIcon = (p: IconProps) => (
  <BaseIcon {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </BaseIcon>
);

export const LockIcon = (p: IconProps) => (
  <BaseIcon {...p}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </BaseIcon>
);

export const ShieldIcon = (p: IconProps) => (
  <BaseIcon {...p}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
  </BaseIcon>
);
