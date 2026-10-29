"use client";

import React from "react";
import { RotateCcw, Volume2, VolumeX } from "lucide-react";

interface HeaderProps {
  onRestart?: () => void;
  showRestart?: boolean;
  sessionDuration?: string;
  turnCount?: number;
  lastLatencyMs?: number | null;
}

export const Header: React.FC<HeaderProps> = ({
  onRestart,
  showRestart = false,
  sessionDuration = "00:00",
  turnCount = 0,
  lastLatencyMs,
}) => {
  return (
    <header className="sticky top-0 inset-x-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-surface-container-high shadow-[0_1px_8px_rgba(0,0,0,0.03)] transition-all">
      <div className="h-16 max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-surface-container-lowest border border-outline-variant/40 shadow-sm flex items-center justify-center">
            <span className="font-mono font-bold text-xs text-primary tracking-wider">
              RB
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-sans font-bold text-base tracking-[0.12em] uppercase text-on-surface leading-none">
                BASHA
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-primary/10 text-primary uppercase tracking-wider">
                Voice AI
              </span>
            </div>
            <span className="font-mono text-[11px] tracking-[0.04em] text-on-surface-variant uppercase mt-1 leading-none">
              Shaik Rameez Basha
            </span>
          </div>
        </div>

        {/* Live System Diagnostics & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Latency Pill */}
          <div className="hidden md:flex items-center gap-1.5 bg-surface-container-lowest px-3 py-1.5 rounded-full border border-surface-container-high shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] text-tertiary">
              {lastLatencyMs ? `${lastLatencyMs}ms turnaround` : "< 450ms Latency"}
            </span>
            <span className="text-outline-variant font-mono text-[10px]">•</span>
            <span className="font-mono text-[11px] text-on-surface-variant font-medium">
              Duplex PCM
            </span>
          </div>

          {/* Session Timer & Turn Counter */}
          <div className="flex items-center gap-1.5 bg-surface-container px-2.5 py-1 rounded-full text-tertiary font-mono text-[11px]">
            <span>{sessionDuration}</span>
            {turnCount > 0 && (
              <>
                <span className="text-outline-variant">•</span>
                <span className="text-on-surface font-medium">
                  {turnCount} {turnCount === 1 ? "turn" : "turns"}
                </span>
              </>
            )}
          </div>

          {/* Reset / New Session */}
          {showRestart && onRestart && (
            <button
              onClick={onRestart}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest hover:bg-surface-container-high border border-outline-variant/50 text-on-surface font-sans text-xs font-medium transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Reset conversation state"
            >
              <RotateCcw className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
