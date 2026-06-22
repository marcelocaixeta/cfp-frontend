import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { X } from 'lucide-react';
import type { ReactElement } from 'react';

type ConfirmDialogVariant = 'danger' | 'primary';

type ConfirmDialogProps = {
  cancelLabel?: string;
  confirmLabel: string;
  description: string;
  onConfirm: () => void;
  title: string;
  trigger: ReactElement;
  variant?: ConfirmDialogVariant;
};

export function ConfirmDialog({
  cancelLabel = 'Cancelar',
  confirmLabel,
  description,
  onConfirm,
  title,
  trigger,
  variant = 'primary',
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="confirm-dialog__overlay" />
        <AlertDialog.Content className="confirm-dialog__content">
          <AlertDialog.Cancel asChild>
            <button className="confirm-dialog__close" type="button" aria-label="Fechar">
              <X size={18} aria-hidden="true" />
            </button>
          </AlertDialog.Cancel>
          <AlertDialog.Title className="confirm-dialog__title">{title}</AlertDialog.Title>
          <AlertDialog.Description className="confirm-dialog__description">
            {description}
          </AlertDialog.Description>
          <div className="confirm-dialog__actions">
            <AlertDialog.Cancel asChild>
              <button className="button button--secondary" type="button">
                {cancelLabel}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button className={`button button--${variant}`} onClick={onConfirm} type="button">
                {confirmLabel}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
