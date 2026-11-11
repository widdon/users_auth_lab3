'use client';

import { useEffect } from 'react';
import { useUsersStore } from '@/store/users-store-provider';
import type { Toast, ToastType } from '@/store/users-store';
import { XIcon } from './Icons';

const ALERT_CLASSES: Record<ToastType, string> = {
  success: 'alert-success',
  info: 'alert-info',
  error: 'alert-error',
};

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useUsersStore((s) => s.dismissToast);

  useEffect(() => {
    const timer = window.setTimeout(() => dismiss(toast.id), toast.type === 'error' ? 6000 : 3500);
    return () => window.clearTimeout(timer);
  }, [toast.id, toast.type, dismiss]);

  return (
    <div role="status" className={`alert ${ALERT_CLASSES[toast.type]} shadow-lg`}>
      <span>{toast.message}</span>
      <button type="button" className="btn btn-circle btn-ghost btn-xs" onClick={() => dismiss(toast.id)} aria-label="Скрыть">
        <XIcon className="size-3.5" />
      </button>
    </div>
  );
}

/** Уведомления. Их добавляют любые компоненты через store, показываются они здесь. */
export function Toaster() {
  const toasts = useUsersStore((s) => s.toasts);
  if (toasts.length === 0) return null;

  return (
    <div className="toast toast-end toast-bottom z-50">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
