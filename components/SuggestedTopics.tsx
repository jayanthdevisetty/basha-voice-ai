"use client";

import React from "react";
import { ArrowRight, MessageSquare } from "lucide-react";

interface SuggestedTopicsProps {
  onSelectTopic: (topic: string) => void;
  disabled?: boolean;
}

const TOPIC_PRESETS = [
  {
    category: "JOURNEY",
    label: "Tell me about your life story in a few sentences",
    query: "What should we know about your life story in a few sentences?",
  },
  {
    category: "SUPERPOWER",
    label: "What is your #1 superpower as an engineer?",
    query: "What's your #1 superpower?",
  },
  {
    category: "GROWTH",
    label: "What are the top 3 areas you'd like to grow in?",
    query: "What are the top 3 areas you'd like to grow in?",
  },
  {
    category: "PERSPECTIVE",
    label: "What misconception do coworkers have about you?",
    query: "What misconception do your coworkers have about you?",
  },
  {
    category: "SYSTEMS",
    label: "Tell me about RotorDyn and your vibration AI platform",
    query: "Tell me about RotorDyn and how you built the vibration analysis platform.",
  },
  {
    category: "LIMITS",
    label: "How do you push your boundaries and limits?",
    query: "How do you push your boundaries and limits?",
  },
];

export const SuggestedTopics: React.FC<SuggestedTopicsProps> = ({
  onSelectTopic,
  disabled = false,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto my-3 font-sans">
      <div className="flex items-center gap-2 mb-2.5 px-1 text-tertiary font-mono text-[11px] uppercase tracking-wider">
        <MessageSquare className="w-3.5 h-3.5 text-primary" />
        <span>Try asking:</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
        {TOPIC_PRESETS.map((item, index) => (
          <button
            key={index}
            onClick={() => onSelectTopic(item.query)}
            disabled={disabled}
            className="text-left p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high/60 transition-all group shadow-xs flex items-center justify-between disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
          >
            <div className="flex flex-col pr-2">
              <span className="font-mono text-[10px] text-tertiary group-hover:text-primary transition-colors tracking-wide">
                [{item.category}]
              </span>
              <span className="font-sans text-xs sm:text-sm text-on-surface group-hover:text-primary transition-colors font-medium mt-0.5">
                {item.label}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-outline group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};
