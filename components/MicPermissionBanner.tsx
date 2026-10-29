"use client";

import React from "react";
import { AlertCircle, Mic } from "lucide-react";

interface MicPermissionBannerProps {
  micPermission: "granted" | "denied" | "prompt";
  isSupported: boolean;
  errorMessage: string | null;
  onRetry: () => void;
}

export const MicPermissionBanner: React.FC<MicPermissionBannerProps> = ({
  micPermission,
  isSupported,
  errorMessage,
  onRetry,
}) => {
  if (micPermission !== "denied" && isSupported && !errorMessage) {
    return null;
  }

  return (
    <div className="w-full max-w-3xl mx-auto my-3 px-1 font-sans">
      <div className="bg-error-container/40 border border-error/30 rounded-xl p-4 text-xs text-on-surface flex items-start gap-3 shadow-xs">
        <AlertCircle className="w-4 h-4 text-error mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-error text-sm">
            {!isSupported
              ? "Speech Recognition is not available in this browser"
              : micPermission === "denied"
              ? "Microphone access blocked"
              : "Voice interaction notice"}
          </p>
          <p className="mt-1 text-secondary leading-relaxed text-xs">
            {!isSupported
              ? "Your browser doesn't expose native SpeechRecognition. Chrome and Edge offer the best direct voice experience. You can also use the text input below anytime!"
              : micPermission === "denied"
              ? "To converse with voice, please click the lock/settings icon next to your URL bar, allow Microphone permission, and click Enable Microphone."
              : errorMessage}
          </p>
          {isSupported && micPermission === "denied" && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-medium transition-all shadow-xs hover:bg-primary-container cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5" />
              Enable Microphone
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
