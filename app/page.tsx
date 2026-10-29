"use client";

import React, { useState } from "react";
import { useVoiceConversation } from "@/hooks/useVoiceConversation";
import { Header } from "@/components/Header";
import { VoiceVisualizer } from "@/components/VoiceVisualizer";
import { ConversationHistory } from "@/components/ConversationHistory";
import { SuggestedTopics } from "@/components/SuggestedTopics";
import { TextInputFallback } from "@/components/TextInputFallback";
import { MicPermissionBanner } from "@/components/MicPermissionBanner";
import { Mic, ArrowRight, Shield, Cpu, Activity } from "lucide-react";

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
    volumeDb,
    lastLatencyMs,
    sessionDuration,
    activeModel,
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
    <div className="flex flex-col min-h-screen bg-[#09090b] text-zinc-100 selection:bg-zinc-800 selection:text-white font-sans antialiased">
      <Header
        showRestart={hasStarted || messages.length > 0}
        onRestart={handleReset}
        sessionDuration={sessionDuration}
        turnCount={Math.ceil(messages.length / 2)}
      />

      <main className="flex-1 flex flex-col justify-between max-w-4xl w-full mx-auto px-4 py-6 md:py-8">
        {!hasStarted && messages.length === 0 ? (
          /* ========================================================= */
          /* LANDING SCREEN (Restrained, Advanced, No AI Slop)         */
          /* ========================================================= */
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-auto px-2 py-6">
            {/* Engineer Profile Chip */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-zinc-800 bg-zinc-900/60 text-[11px] font-mono text-zinc-300 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>SHAIK RAMEEZ BASHA // SYSTEMS & AI</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-zinc-100 mb-2 font-sans">
              Basha — Voice AI
            </h1>

            <p className="text-sm font-mono text-zinc-400 mb-4 tracking-tight">
              Have a conversation with my AI voice agent.
            </p>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mb-8 leading-relaxed">
              Real-time conversational agent grounded in my engineering background.
              Ask me about my systems architecture, how I handle technical ambiguity,
              what I built on RotorDyn, or where I am growing.
            </p>

            {/* Main Action Trigger */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center mb-8">
              <button
                onClick={handleStartLanding}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs transition-all shadow-sm active:scale-[0.99]"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Initialize Voice Conversation</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 text-zinc-500" />
              </button>
            </div>

            {/* Architecture Telemetry Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full max-w-xl text-left border-t border-zinc-900 pt-6">
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-900">
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                  Architecture 01
                </div>
                <div className="text-xs font-semibold text-zinc-200 mb-0.5">
                  RotorDyn Platform
                </div>
                <div className="text-[11px] text-zinc-400 leading-snug">
                  FastAPI, Supabase, and real-time vibration telemetry diagnostics.
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-900">
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                  Execution 02
                </div>
                <div className="text-xs font-semibold text-zinc-200 mb-0.5">
                  Core Superpower
                </div>
                <div className="text-[11px] text-zinc-400 leading-snug">
                  Deconstructing ambiguous problems into testable, shipping systems.
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-900">
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                  Systems 03
                </div>
                <div className="text-xs font-semibold text-zinc-200 mb-0.5">
                  AfterQuery & Reliability
                </div>
                <div className="text-[11px] text-zinc-400 leading-snug">
                  Asynchronous caching, distributed reconciliation, and policy checks.
                </div>
              </div>
            </div>

            {/* Shortcut Queries */}
            <div className="mt-6 w-full">
              <SuggestedTopics onSelectTopic={handleTopicClick} />
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* CONVERSATION INTERFACE                                    */
          /* ========================================================= */
          <div className="flex-1 flex flex-col justify-start w-full">
            {/* Identity Status Bar */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-1 text-[11px] font-mono">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">REPRESENTING:</span>
                <span className="text-zinc-200 font-semibold">
                  Shaik Rameez Basha
                </span>
                <span className="text-zinc-600">·</span>
                <span className="text-zinc-400">First-Person Autonomous Voice</span>
              </div>
              <div>
                <button
                  onClick={handleEnd}
                  className="text-zinc-500 hover:text-red-400 transition-colors"
                >
                  End Session [Esc]
                </button>
              </div>
            </div>

            {/* Permission Banner */}
            <MicPermissionBanner
              micPermission={micPermission}
              isSupported={isSupported}
              errorMessage={errorMessage}
              onRetry={startConversation}
            />

            {/* Real Audio Canvas Oscilloscope & Volume Meter */}
            <VoiceVisualizer
              state={state}
              interimTranscript={interimTranscript}
              audioLevel={audioLevel}
              volumeDb={volumeDb}
              lastLatencyMs={lastLatencyMs}
              activeModel={activeModel}
              onStart={startConversation}
              onStop={handleEnd}
              onInterrupt={stopSpeaking}
              onCommitSpeech={commitInterimSpeech}
            />

            {/* Transcript Inspector */}
            <ConversationHistory
              messages={messages}
              onReplay={replayMessage}
              onClear={restartConversation}
            />

            {/* Short-cut query triggers */}
            <SuggestedTopics
              onSelectTopic={handleTopicClick}
              disabled={state === "thinking"}
            />

            {/* Terminal Fallback Input */}
            <TextInputFallback
              onSendMessage={sendMessage}
              state={state}
              continuousMode={continuousMode}
              onToggleContinuous={() => setContinuousMode(!continuousMode)}
            />
          </div>
        )}

        {/* Minimal Engineering Footer */}
        <footer className="mt-8 pt-4 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-zinc-500 gap-2">
          <div className="flex items-center gap-2">
            <span>100x AI Agent Team</span>
            <span>·</span>
            <span className="text-zinc-400">Stage 1 Assessment Submission</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Shield className="w-3 h-3 text-zinc-400" />
              <span>Server-Side Isolated</span>
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Cpu className="w-3 h-3 text-zinc-400" />
              <span>Gemini 3.5 Flash Lite</span>
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Activity className="w-3 h-3 text-zinc-400" />
              <span>WebAudio 44.1kHz</span>
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
