'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { XIcon } from './Icons';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: 'md' | 'lg';
}

/**
 * Обёртка над нативным <dialog> со стилями DaisyUI.
 *
 * Модалка открывается при монтировании и закрывается при размонтировании,
 * поэтому родитель управляет ей обычным условным рендерингом:
 *   {isOpen && <Modal ... />}
 *
 * useRef даёт доступ к DOM-узлу <dialog>, чтобы вызвать showModal() —
 * этого нельзя сделать декларативно через JSX.
 */
export function Modal({ title, onClose, children, size = 'md' }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="modal modal-bottom sm:modal-middle"
      aria-labelledby={titleId}
      // Esc: не даём браузеру закрыть диалог самостоятельно — решение принимает родитель
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className={`modal-box ${size === 'lg' ? 'sm:max-w-3xl' : ''}`}>
        <button
          type="button"
          className="btn btn-circle btn-ghost btn-sm absolute top-3 right-3"
          onClick={onClose}
          aria-label="Закрыть"
        >
          <XIcon />
        </button>
        <h3 id={titleId} className="pr-10 text-lg font-bold">
          {title}
        </h3>
        <div className="mt-4">{children}</div>
      </div>
      <div className="modal-backdrop">
        <button type="button" onClick={onClose} tabIndex={-1}>
          Закрыть
        </button>
      </div>
    </dialog>
  );
}
