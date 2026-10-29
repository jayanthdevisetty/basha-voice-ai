"use client";

import React from "react";
import { AlertTriangle, Mic } from "lucide-react";

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
    <div className="w-full max-w-2xl mx-auto my-3 px-3">
      <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3.5 text-xs text-amber-200/90 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-amber-300">
            {!isSupported
              ? "Speech Recognition is not available in this browser"
              : micPermission === "denied"
              ? "Microphone access blocked"
              : "Voice interaction notice"}
          </p>
          <p className="mt-1 text-amber-200/80 leading-relaxed">
            {!isSupported
              ? "Your browser doesn't have native SpeechRecognition enabled (Chrome and Edge offer the best experience). You can still ask questions anytime using the text box below!"
              : micPermission === "denied"
              ? "To talk with your voice, please click the lock/settings icon next to your URL bar, allow Microphone permission, and click Enable Microphone."
              : errorMessage}
          </p>
          {isSupported && micPermission === "denied" && (
            <button
              onClick={onRetry}
              className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg text-amber-200 text-xs font-medium transition-colors"
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
