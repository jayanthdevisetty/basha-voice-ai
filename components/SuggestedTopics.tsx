"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface SuggestedTopicsProps {
  onSelectTopic: (topic: string) => void;
  disabled?: boolean;
}

const TOPICS = [
  "What should we know about your life story in a few sentences?",
  "What's your #1 superpower?",
  "What are the top 3 areas you'd like to grow in?",
  "What misconception do your coworkers have about you?",
  "How do you push your boundaries and limits?",
  "Tell me about RotorDyn and your role in it.",
  "How do you handle tough distributed engineering bugs?",
];

export const SuggestedTopics: React.FC<SuggestedTopicsProps> = ({
  onSelectTopic,
  disabled = false,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto mt-6 px-3">
      <div className="flex items-center gap-1.5 mb-2.5 text-xs text-zinc-500 font-mono tracking-wider uppercase">
        <Sparkles className="w-3 h-3 text-indigo-400" />
        <span>Suggested Questions</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {TOPICS.map((topic, index) => (
          <button
            key={index}
            onClick={() => onSelectTopic(topic)}
            disabled={disabled}
            className="text-left text-xs text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 hover:border-zinc-700 px-3 py-1.5 rounded-full transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  );
};
