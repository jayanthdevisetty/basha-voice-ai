"use client";

import React, { useState } from "react";
import { useVoiceConversation } from "@/hooks/useVoiceConversation";
import { Header } from "@/components/Header";
import { VoiceVisualizer } from "@/components/VoiceVisualizer";
import { ConversationHistory } from "@/components/ConversationHistory";
import { SuggestedTopics } from "@/components/SuggestedTopics";
import { TextInputFallback } from "@/components/TextInputFallback";
import { MicPermissionBanner } from "@/components/MicPermissionBanner";
import { Mic, ArrowRight, ShieldCheck, Terminal, Brain, Sparkles, Cpu } from "lucide-react";

export default function Home() {
  const [hasStarted, setHasStarted] = useState(false);

  const {
    state,
    messages,
    interimTranscript,
    errorMessage,
    isSupported,
    micPermission,
    continuousMode,
    audioLevel,
    setContinuousMode,
    startConversation,
    endConversation,
    commitInterimSpeech,
    restartConversation,
    sendMessage,
    stopSpeaking,
    replayMessage,
  } = useVoiceConversation();

  const handleStartLanding = async () => {
    setHasStarted(true);
    await startConversation();
  };

  const handleEnd = () => {
    endConversation();
  };

  const handleReset = () => {
    restartConversation();
    setHasStarted(false);
  };

  const handleTopicClick = (topic: string) => {
    if (!hasStarted) {
      setHasStarted(true);
    }
    sendMessage(topic);
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100">
      <Header
        showRestart={hasStarted || messages.length > 0}
        onRestart={handleReset}
      />

      <main className="flex-1 flex flex-col justify-between max-w-4xl w-full mx-auto px-4 py-6 md:py-10">
        {!hasStarted && messages.length === 0 ? (
          /* ========================================================= */
          /* LANDING SCREEN (Section 18)                               */
          /* ========================================================= */
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-auto px-4 py-8">
            {/* Minimalist Profile Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400 mb-6 tracking-wide">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              SHAIK RAMEEZ BASHA
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white mb-3">
              Basha — Voice AI
            </h1>

            <p className="text-base sm:text-lg text-indigo-300/90 font-medium mb-4">
              AI/ML • GenAI • Full-Stack Engineering
            </p>

            <p className="text-sm sm:text-base text-zinc-400 max-w-lg mb-8 leading-relaxed">
              Have a natural conversation with my AI voice agent. Ask me about my
              engineering journey, how I solve problems, what I&apos;m building, or
              where I want to grow.
            </p>

            {/* Main Action Button */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center mb-10">
              <button
                onClick={handleStartLanding}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 font-medium text-sm transition-all shadow-lg hover:shadow-indigo-500/10 hover:scale-[1.02] active:scale-[0.99]"
              >
                <Mic className="w-4 h-4 text-zinc-950" />
                <span>Start Conversation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Context Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg text-left text-xs text-zinc-400 border-t border-zinc-900 pt-8">
              <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/60">
                <div className="flex items-center gap-1.5 text-zinc-200 font-medium mb-1">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  RotorDyn & Systems
                </div>
                Vibration AI analysis, FastAPI, Supabase, and distributed testing.
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/60">
                <div className="flex items-center gap-1.5 text-zinc-200 font-medium mb-1">
                  <Brain className="w-3.5 h-3.5 text-emerald-400" />
                  #1 Superpower
                </div>
                Turning ambiguous technical problems into concrete, testable systems.
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/60">
                <div className="flex items-center gap-1.5 text-zinc-200 font-medium mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Honest Growth
                </div>
                Scaling system architecture, disciplined shipping, and boundary-pushing.
              </div>
            </div>

            {/* Sample Prompts to Click Directly */}
            <div className="mt-8 w-full">
              <SuggestedTopics onSelectTopic={handleTopicClick} />
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* CONVERSATION SCREEN (Section 19)                          */
          /* ========================================================= */
          <div className="flex-1 flex flex-col justify-start w-full">
            {/* Identity Bar */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-wider text-zinc-500 font-medium">
                  Identity
                </span>
                <span className="text-xs text-zinc-300 font-semibold">
                  Shaik Rameez Basha
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleEnd}
                  className="text-xs text-zinc-400 hover:text-red-400 transition-colors"
                >
                  End Conversation
                </button>
              </div>
            </div>

            {/* Permission / Unsupported Warning Banner if needed */}
            <MicPermissionBanner
              micPermission={micPermission}
              isSupported={isSupported}
              errorMessage={errorMessage}
              onRetry={startConversation}
            />

            {/* Centerpiece Voice Visualizer */}
            <VoiceVisualizer
              state={state}
              interimTranscript={interimTranscript}
              audioLevel={audioLevel}
              onStart={startConversation}
              onStop={handleEnd}
              onInterrupt={stopSpeaking}
              onCommitSpeech={commitInterimSpeech}
            />

            {/* Conversation Transcript (Scrollable History) */}
            <ConversationHistory
              messages={messages}
              onReplay={replayMessage}
              onClear={restartConversation}
            />

            {/* Suggested Follow-up Questions */}
            <SuggestedTopics
              onSelectTopic={handleTopicClick}
              disabled={state === "thinking"}
            />

            {/* Accessible Text Fallback Input */}
            <TextInputFallback
              onSendMessage={sendMessage}
              state={state}
              continuousMode={continuousMode}
              onToggleContinuous={() => setContinuousMode(!continuousMode)}
            />
          </div>
        )}

        {/* Footer info & security badge */}
        <footer className="mt-10 pt-4 border-t border-zinc-900/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-2">
          <div className="flex items-center gap-2">
            <span>Stage 1 Assessment Submission</span>
            <span>•</span>
            <span className="text-zinc-400">100x AI Agent Team</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Server-Side API Protected
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 font-mono">
              <Terminal className="w-3 h-3" />
              Gemini 2.5 Flash
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
