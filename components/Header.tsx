"use client";

import React from "react";
import { Sparkles, RotateCcw } from "lucide-react";

interface HeaderProps {
  onRestart?: () => void;
  showRestart?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onRestart, showRestart = false }) => {
  return (
    <header className="w-full border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center font-mono font-semibold text-xs text-zinc-100 shadow-inner">
            RB
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-tight text-zinc-100">
                Basha — Voice AI
              </h1>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Have a conversation with my AI voice agent.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showRestart && onRestart && (
            <button
              onClick={onRestart}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors"
              title="Restart session"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-zinc-500 font-mono px-2 py-1 rounded bg-zinc-900/50 border border-zinc-800/50">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>100x AI Assessment</span>
          </div>
        </div>
      </div>
    </header>
  );
};
