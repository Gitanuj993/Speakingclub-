/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { ShieldCheck, Cloud, Lock } from 'lucide-react';

export interface ConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({
  isOpen,
  onAccept,
  onDecline,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onDecline}
      title="Speech Recognition & Privacy Notice"
      description="Transparent guidance on how speech-to-text operates in this sanctum."
      maxWidth="md"
      footer={
        <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:justify-end">
          <Button
            variant="outline"
            onClick={onDecline}
            className="w-full sm:w-auto"
          >
            Practice without transcription
          </Button>
          <Button
            variant="primary"
            onClick={onAccept}
            className="w-full sm:w-auto"
          >
            Enable transcription
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F5EBDD] dark:bg-[#2A2420] border border-[#E8D5B5] dark:border-[#3D352F]">
          <Cloud className="w-5 h-5 text-[#C66A18] dark:text-[#E68A24] shrink-0 mt-0.5" />
          <p className="text-xs text-[#201B18] dark:text-[#FFF9EF] leading-relaxed">
            In modern browsers (such as Google Chrome and Microsoft Edge), the built-in
            Web Speech API streams speech audio to the browser vendor’s speech servers
            for real-time transcription. SpeakLab does not host, monetize, or retain this data.
          </p>
        </div>

        <div className="space-y-2.5 text-xs text-[#6B5E55] dark:text-[#E8D5B5]">
          <div className="flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-[#77764B] dark:text-[#D4AF65] shrink-0 mt-0.5" />
            <span>
              <strong>Your local sanctity is protected:</strong> Recorded audio is
              kept in memory and discarded when leaving the exercise unless you
              explicitly opt in to store it locally on your device.
            </span>
          </div>

          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#C66A18] dark:text-[#D4AF65] shrink-0 mt-0.5" />
            <span>
              If you decline transcription, you can still record, replay, use the
              self-review checklist, and track all your speaking progress. You can
              change this preference anytime in your Profile settings.
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
