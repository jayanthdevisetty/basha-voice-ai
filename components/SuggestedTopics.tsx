"use client";

import React from "react";
import { Terminal } from "lucide-react";

interface SuggestedTopicsProps {
  onSelectTopic: (topic: string) => void;
  disabled?: boolean;
}

const TOPIC_PRESETS = [
  {
    category: "FOUNDATION",
    label: "Life story in a few sentences",
    query: "What should we know about your life story in a few sentences?",
  },
  {
    category: "EXECUTION",
    label: "#1 Superpower & problem breakdown",
    query: "What's your #1 superpower and how do you execute it?",
  },
  {
    category: "GROWTH",
    label: "Top 3 areas for engineering growth",
    query: "What are the top 3 areas you'd like to grow in?",
  },
  {
    category: "PERSPECTIVE",
    label: "Coworker misconceptions vs reality",
    query: "What misconception do your coworkers have about you?",
  },
  {
    category: "SYSTEMS",
    label: "RotorDyn industrial AI architecture",
    query: "Tell me about RotorDyn and the vibration telemetry architecture.",
  },
  {
    category: "LIMITS",
    label: "Pushing technical boundaries & limits",
    query: "How do you push your boundaries and limits in software engineering?",
  },
];

export const SuggestedTopics: React.FC<SuggestedTopicsProps> = ({
  onSelectTopic,
  disabled = false,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto my-4 font-sans">
      <div className="flex items-center gap-2 mb-2 px-1 text-[11px] font-mono uppercase tracking-wider text-zinc-500">
        <Terminal className="w-3 h-3 text-zinc-500" />
        <span>Evaluation Query Shortcuts</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {TOPIC_PRESETS.map((item, index) => (
          <button
            key={index}
            onClick={() => onSelectTopic(item.query)}
            disabled={disabled}
            className="flex items-center justify-between text-left p-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-400">
                [{item.category}]
              </span>
              <span className="text-zinc-300 group-hover:text-white mt-0.5 font-medium">
                {item.label}
              </span>
            </div>
            <span className="text-zinc-600 group-hover:text-zinc-400 font-mono text-[11px] ml-2">
              ↵
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
