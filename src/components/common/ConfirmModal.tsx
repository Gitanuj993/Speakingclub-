/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      maxWidth="sm"
      footer={
        <div className="flex gap-2.5 justify-end w-full">
          <Button variant="ghost" onClick={onCancel} size="sm">
            {cancelLabel}
          </Button>
          <Button
            variant={isDestructive ? 'danger' : 'primary'}
            onClick={onConfirm}
            size="sm"
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-3 py-1">
        {isDestructive && (
          <div className="w-8 h-8 rounded-full bg-[#FBECE9] dark:bg-[#C64B32]/25 text-[#C64B32] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
        )}
        <p className="text-xs text-[#6B5E55] dark:text-[#E8D5B5] leading-relaxed">
          {message}
        </p>
      </div>
    </Modal>
  );
};
