import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  onConfirm,
  onCancel,
}) => (
  <Modal open={open} onClose={onCancel} title={title}>
    <div className="flex flex-col items-center gap-4 text-center py-4">
      <div className="p-3 bg-rose-950/50 text-rose-500 rounded-2xl border border-rose-900/40">
        <AlertTriangle size={28} aria-hidden="true" />
      </div>
      <p className="text-sm text-slate-300 leading-relaxed">{message}</p>
      <div className="flex gap-3 w-full max-w-xs">
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirm} className="flex-1">
          {confirmLabel}
        </Button>
      </div>
    </div>
  </Modal>
);
