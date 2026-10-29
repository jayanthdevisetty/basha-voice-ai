"use client";

import React from "react";
import { RotateCcw, Clock } from "lucide-react";

interface HeaderProps {
  onRestart?: () => void;
  showRestart?: boolean;
  sessionDuration?: string;
  turnCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onRestart,
  showRestart = false,
  sessionDuration = "00:00",
  turnCount = 0,
}) => {
  return (
    <header className="w-full border-b border-zinc-900 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded border border-zinc-800 bg-zinc-900 flex items-center justify-center font-mono font-medium text-xs text-zinc-200">
            RB
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-tight text-zinc-100">
                Shaik Rameez Basha
              </span>
              <span className="text-zinc-600">/</span>
              <span className="text-xs font-mono text-zinc-400">Voice AI</span>
            </div>
          </div>
        </div>

        {/* Telemetry & Actions */}
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded border border-zinc-900 bg-zinc-900/40 text-zinc-400">
            <Clock className="w-3 h-3 text-zinc-500" />
            <span>{sessionDuration}</span>
          </div>

          {turnCount > 0 && (
            <div className="hidden sm:flex items-center px-2 py-1 rounded border border-zinc-900 bg-zinc-900/40 text-zinc-400">
              <span>TURNS: {turnCount.toString().padStart(2, "0")}</span>
            </div>
          )}

          {showRestart && onRestart && (
            <button
              onClick={onRestart}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
              title="Reset conversation state"
            >
              <RotateCcw className="w-3 h-3 text-zinc-400" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
