"use client";

import React, { useState } from "react";
import { useVoiceConversation, ConversationState } from "@/hooks/useVoiceConversation";
import { Header } from "@/components/Header";
import { VoiceVisualizer } from "@/components/VoiceVisualizer";
import { ConversationHistory } from "@/components/ConversationHistory";
import { SuggestedTopics } from "@/components/SuggestedTopics";
import { TextInputFallback } from "@/components/TextInputFallback";
import { MicPermissionBanner } from "@/components/MicPermissionBanner";
import { Mic, MicOff, Square, Shield, Cpu, Activity, Play, Zap } from "lucide-react";

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

  // Allow manual state simulation for testing the Stitch state pill switcher
  const handleSimulateState = (targetState: ConversationState) => {
    if (targetState === "speaking") {
      replayMessage("My biggest strength is turning ambiguous technical problems into concrete architectures that I can build, test, and ship.");
    } else if (targetState === "listening") {
      startConversation();
    } else if (targetState === "idle") {
      endConversation();
    } else if (targetState === "thinking") {
      sendMessage("Can you explain how you handle ambiguous engineering tasks?");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed font-sans antialiased">
      <Header
        showRestart={hasStarted || messages.length > 0}
        onRestart={handleReset}
        sessionDuration={sessionDuration}
        turnCount={Math.ceil(messages.length / 2)}
        lastLatencyMs={lastLatencyMs}
      />

      <main className="flex-1 flex flex-col justify-between max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8">
        {!hasStarted && messages.length === 0 ? (
          /* ========================================================= */
          /* STITCH WELCOME SCREEN (Precision Editorial Voice AI)      */
          /* ========================================================= */
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-auto px-2 py-4">
            {/* Candidate Intelligence Agent Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-low shadow-xs border border-surface-container-high/60">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-on-surface-variant font-medium">
                Candidate Intelligence Agent
              </span>
              <span className="text-outline-variant font-medium">•</span>
              <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-primary font-semibold">
                Stage 1 Assessment
              </span>
            </div>

            {/* Headline and Subtitle */}
            <div className="mt-6 flex flex-col items-center gap-2">
              <h1 className="font-headline-xl text-3xl sm:text-5xl text-on-surface font-semibold tracking-[-0.035em]">
                Talk to my AI.
              </h1>
              <p className="font-body-lg text-base sm:text-lg text-secondary max-w-[500px] leading-relaxed">
                Ask about my journey, how I solve problems, what I’m building, or where I’m growing.
              </p>
            </div>

            {/* Stitch Concentric Acoustic Pulse Node */}
            <div
              onClick={handleStartLanding}
              className="my-10 relative flex items-center justify-center group cursor-pointer select-none"
              title="Click to initialize voice session"
            >
              <div className="absolute w-44 h-44 rounded-full bg-surface-container-low/70 transition-transform duration-500 ease-out group-hover:scale-110" />
              <div className="absolute w-36 h-36 rounded-full bg-surface-container transition-transform duration-300 ease-out group-hover:scale-105" />
              <div className="absolute w-28 h-28 rounded-full bg-surface-container-high transition-transform duration-200" />
              <button
                aria-label="Toggle voice recording"
                className="relative z-10 w-20 h-20 rounded-full bg-surface-container-lowest shadow-xl flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:shadow-2xl active:scale-95"
              >
                <Mic className="w-8 h-8 text-on-surface transition-colors duration-300 group-hover:text-on-primary" />
              </button>
              <div className="absolute -bottom-8 flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest shadow-xs border border-surface-container-high/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="font-mono text-[11px] uppercase tracking-wider text-secondary font-medium">
                  Acoustic Model Primed
                </span>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="w-full flex flex-col items-center gap-3">
              <button
                onClick={handleStartLanding}
                className="w-full sm:w-auto min-w-[280px] px-8 py-3.5 rounded-full bg-on-background hover:bg-inverse-surface text-on-primary flex items-center justify-center gap-3 shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <Activity className="w-4 h-4 text-primary-fixed" />
                <span className="font-sans text-sm sm:text-base font-semibold tracking-[-0.01em]">
                  Start conversation
                </span>
                <span className="font-mono text-[10px] bg-surface-container-highest/30 text-on-primary px-2 py-0.5 rounded-full uppercase tracking-wider opacity-90">
                  Live
                </span>
              </button>
              <div className="flex items-center gap-2 text-on-surface-variant font-mono text-[11px]">
                <span>Press</span>
                <kbd className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-mono text-[11px] shadow-xs">
                  Space
                </kbd>
                <span>or click to speak</span>
              </div>
            </div>

            {/* Architectural Highlights Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full max-w-xl text-left border-t border-surface-container-high pt-6 mt-8">
              <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs">
                <div className="text-[10px] font-mono text-tertiary uppercase tracking-wider mb-1">
                  System 01
                </div>
                <div className="text-xs font-semibold text-on-surface mb-0.5">
                  RotorDyn Platform
                </div>
                <div className="text-[11px] text-secondary leading-snug">
                  FastAPI, Supabase, and real-time industrial vibration analysis.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs">
                <div className="text-[10px] font-mono text-tertiary uppercase tracking-wider mb-1">
                  Superpower 02
                </div>
                <div className="text-xs font-semibold text-on-surface mb-0.5">
                  Deconstruction & Execution
                </div>
                <div className="text-[11px] text-secondary leading-snug">
                  Turning ambiguous problems into testable, working code.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs">
                <div className="text-[10px] font-mono text-tertiary uppercase tracking-wider mb-1">
                  Reliability 03
                </div>
                <div className="text-xs font-semibold text-on-surface mb-0.5">
                  AfterQuery Engine
                </div>
                <div className="text-[11px] text-secondary leading-snug">
                  Async caching, distributed reconciliation, and policy validation.
                </div>
              </div>
            </div>

            {/* Suggested Prompt Chips */}
            <div className="mt-6 w-full">
              <SuggestedTopics onSelectTopic={handleTopicClick} />
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* STITCH CONVERSATION INTERFACE                             */
          /* ========================================================= */
          <div className="flex-1 flex flex-col justify-start w-full">
            {/* Identity Status Bar */}
            <div className="flex items-center justify-between border-b border-surface-container-high pb-2 mb-2 text-[11px] font-mono">
              <div className="flex items-center gap-2">
                <span className="text-tertiary">REPRESENTING:</span>
                <span className="text-on-surface font-semibold">
                  Shaik Rameez Basha
                </span>
                <span className="text-outline-variant">•</span>
                <span className="text-primary font-medium">First-Person Voice</span>
              </div>
              <div>
                <button
                  onClick={handleEnd}
                  className="text-tertiary hover:text-error transition-colors cursor-pointer"
                >
                  End Session [Esc]
                </button>
              </div>
            </div>

            {/* Mic Permission Banner */}
            <MicPermissionBanner
              micPermission={micPermission}
              isSupported={isSupported}
              errorMessage={errorMessage}
              onRetry={startConversation}
            />

            {/* Voice Visualizer Telemetry & Oscilloscope */}
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
              onSimulateState={handleSimulateState}
            />

            {/* Editorial Transcript Axis */}
            <ConversationHistory
              messages={messages}
              onReplay={replayMessage}
              onClear={restartConversation}
            />

            {/* Quick Prompt Chips */}
            <SuggestedTopics
              onSelectTopic={handleTopicClick}
              disabled={state === "thinking"}
            />

            {/* Bottom Center Voice Control Hub (from Stitch conversation.html) */}
            <div className="w-full my-6 flex flex-col items-center">
              {/* Concentric Acoustic Pulse Node */}
              <div className="relative flex items-center justify-center p-4">
                <div
                  className={`absolute w-28 h-28 rounded-full bg-primary/10 transition-all duration-700 ease-out ${
                    state === "speaking" || state === "listening"
                      ? "animate-ping opacity-40"
                      : "opacity-0"
                  }`}
                />
                <div
                  className={`absolute w-20 h-20 rounded-full bg-primary/15 transition-all duration-500 ${
                    state === "speaking" || state === "listening" ? "scale-105" : "scale-100"
                  }`}
                />
                <button
                  onClick={() => {
                    if (state === "speaking") {
                      stopSpeaking();
                    } else if (state === "listening") {
                      endConversation();
                    } else {
                      startConversation();
                    }
                  }}
                  className="relative z-10 w-16 h-16 rounded-full bg-surface-container-lowest text-primary shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer border border-surface-container-high/60"
                  title={
                    state === "speaking"
                      ? "Tap to interrupt Basha"
                      : state === "listening"
                      ? "Listening... tap to pause"
                      : "Tap to speak"
                  }
                  type="button"
                >
                  {state === "speaking" ? (
                    <Square className="w-6 h-6 fill-current text-primary" />
                  ) : state === "listening" ? (
                    <Mic className="w-7 h-7 text-primary animate-pulse" />
                  ) : (
                    <Mic className="w-7 h-7 text-tertiary" />
                  )}
                </button>
              </div>

              {/* Dynamic State Indicator Text */}
              <div className="flex flex-col items-center gap-1 text-center mt-1">
                <p className="font-sans text-sm font-medium text-on-surface">
                  {state === "speaking"
                    ? "Basha is speaking... tap to interrupt or speak"
                    : state === "listening"
                    ? "Listening... speak naturally"
                    : state === "thinking"
                    ? "Thinking... synthesizing answer"
                    : "Tap mic or press Space to converse"}
                </p>
                <span className="font-mono text-[11px] text-tertiary">
                  Full-duplex audio stream active • 16-bit 48kHz
                </span>
              </div>
            </div>

            {/* Fallback Text Input Drawer */}
            <TextInputFallback
              onSendMessage={sendMessage}
              state={state}
              continuousMode={continuousMode}
              onToggleContinuous={() => setContinuousMode(!continuousMode)}
            />
          </div>
        )}

        {/* Minimal Engineering Footer */}
        <footer className="mt-8 pt-4 border-t border-surface-container-high flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-tertiary gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-on-surface">100x AI Agent Team</span>
            <span>•</span>
            <span>Stage 1 Assessment Submission</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Shield className="w-3 h-3 text-primary" />
              <span>Server-Side Isolated</span>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Cpu className="w-3 h-3 text-primary" />
              <span>Gemini 3.5 Flash Lite</span>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Activity className="w-3 h-3 text-primary" />
              <span>WebAudio 44.1kHz</span>
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
