'use client';

import type { ReactNode } from 'react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  title: string;
  message: ReactNode;
  confirmLabel: string;
  pendingLabel?: string;
  isPending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  pendingLabel = 'Выполняется…',
  isPending = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={isPending ? () => {} : onClose}>
      <div className="text-base-content/80">{message}</div>
      <div className="modal-action">
        <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isPending} autoFocus>
          Отмена
        </button>
        <button type="button" className="btn btn-error" onClick={onConfirm} disabled={isPending}>
          {isPending && <span className="loading loading-spinner loading-sm" />}
          {isPending ? pendingLabel : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
