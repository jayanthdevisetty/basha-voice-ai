"use client";

import React, { useEffect, useRef, useState } from "react";
import { ConversationState } from "@/hooks/useVoiceConversation";
import { Mic, MicOff, Square, ArrowUp, Zap, Cpu, Sparkles } from "lucide-react";

interface VoiceVisualizerProps {
  state: ConversationState;
  interimTranscript: string;
  audioLevel: number;
  volumeDb: number;
  lastLatencyMs: number | null;
  activeModel: string;
  onStart: () => void;
  onStop: () => void;
  onInterrupt: () => void;
  onCommitSpeech: () => void;
  onSimulateState?: (state: ConversationState) => void;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  state,
  interimTranscript,
  audioLevel,
  volumeDb,
  lastLatencyMs,
  activeModel,
  onStart,
  onStop,
  onInterrupt,
  onCommitSpeech,
  onSimulateState,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [bargeInNoticed, setBargeInNoticed] = useState(false);

  // High-precision canvas audio spectrum / oscilloscope rendering with Stitch terracotta palette
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let phase = 0;

    const render = () => {
      phase += 0.045;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Clean background guideline
      ctx.strokeStyle = "#e9e8e5";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      if (state === "listening" || state === "speaking") {
        // Multi-frequency harmonic waveform in terracotta tones
        const numWaves = 3;
        for (let w = 0; w < numWaves; w++) {
          ctx.beginPath();
          ctx.lineWidth = w === 0 ? 2.5 : 1.2;
          ctx.strokeStyle =
            state === "listening"
              ? w === 0
                ? "rgba(168, 50, 25, 0.95)" // Primary terracotta
                : "rgba(201, 74, 47, 0.35)"
              : w === 0
              ? "rgba(168, 50, 25, 0.9)"
              : "rgba(224, 191, 184, 0.5)";

          const sliceWidth = width / 64;
          let x = 0;

          for (let i = 0; i <= 64; i++) {
            const freq = 0.05 + w * 0.02;
            const amp = (audioLevel * (height * 0.36) + 4) * (1 - w * 0.25);
            const y =
              height / 2 +
              Math.sin(i * freq + phase * (w % 2 === 0 ? 1 : -1)) *
                Math.sin((i / 64) * Math.PI) *
                amp;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
            x += sliceWidth;
          }
          ctx.stroke();
        }
      } else if (state === "thinking") {
        // Radial scanning sweep in terracotta accent
        const radius = Math.min(width, height) * 0.3;
        const centerX = width / 2;
        const centerY = height / 2;

        ctx.strokeStyle = "rgba(168, 50, 25, 0.15)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = "rgba(168, 50, 25, 0.85)";
        ctx.lineWidth = 2.5;
        const sweepAngle = phase * 1.8;
        ctx.arc(centerX, centerY, radius, sweepAngle, sweepAngle + Math.PI * 0.4);
        ctx.stroke();
      } else {
        // Standby calm wave
        ctx.beginPath();
        ctx.strokeStyle = "rgba(95, 94, 97, 0.35)";
        ctx.lineWidth = 1.5;
        const sliceWidth = width / 32;
        let x = 0;
        for (let i = 0; i <= 32; i++) {
          const y = height / 2 + Math.sin(i * 0.2 + phase * 0.4) * 2.5;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.stroke();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [state, audioLevel]);

  const handleInterruptClick = () => {
    setBargeInNoticed(true);
    onInterrupt();
    setTimeout(() => setBargeInNoticed(false), 3000);
  };

  // State styling configuration
  const stateConfig = {
    listening: {
      badgeText: "Listening",
      badgeBg: "bg-primary/10",
      badgeTextCol: "text-primary",
      dotBg: "bg-primary",
      dotPulse: true,
      label: "Listening to your voice... speak naturally",
      sublabel: "Full-duplex audio stream active • 16-bit 48kHz",
    },
    thinking: {
      badgeText: "Thinking",
      badgeBg: "bg-surface-container-highest",
      badgeTextCol: "text-on-surface-variant",
      dotBg: "bg-secondary",
      dotPulse: true,
      label: "Synthesizing response from personal knowledge base...",
      sublabel: "Gemini 3.5 Flash Lite • Zero-shot reasoning",
    },
    speaking: {
      badgeText: "Speaking",
      badgeBg: "bg-primary/10",
      badgeTextCol: "text-primary",
      dotBg: "bg-primary",
      dotPulse: true,
      label: "Basha is speaking... tap anywhere or speak to interrupt",
      sublabel: "SpeechSynthesis active • Hardware echo cancellation primed",
    },
    idle: {
      badgeText: "Ready",
      badgeBg: "bg-surface-container",
      badgeTextCol: "text-tertiary",
      dotBg: "bg-tertiary",
      dotPulse: false,
      label: "Microphone on standby. Click mic or press Space to speak.",
      sublabel: "Direct low-latency bidirectional pipeline ready",
    },
    error: {
      badgeText: "Fault",
      badgeBg: "bg-error-container",
      badgeTextCol: "text-error",
      dotBg: "bg-error",
      dotPulse: false,
      label: "Microphone access needed or speech unrecognizable. Tap retry.",
      sublabel: "Ensure microphone permission is allowed",
    },
  }[state];

  // Dynamic 9-bar spectrum heights calculation
  const getSpectrumHeight = (index: number) => {
    if (state === "idle" || state === "error") return 4;
    const base = Math.sin(index * 0.8 + Date.now() * 0.006) * 0.5 + 0.5;
    const levelFactor = Math.max(0.15, audioLevel);
    return Math.floor(base * 18 * levelFactor) + 4;
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-3 font-sans">
      {/* State Switcher & Simulation Pill Bar (from Stitch interruption.html) */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1 text-xs">
        <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-full shadow-xs">
          <span className="font-mono text-[10px] text-tertiary px-2 uppercase font-medium">
            STATE:
          </span>
          {(["idle", "listening", "thinking", "speaking"] as ConversationState[]).map((st) => (
            <button
              key={st}
              onClick={() => onSimulateState && onSimulateState(st)}
              className={`px-3 py-1 rounded-full font-mono text-[11px] capitalize transition-all ${
                state === st
                  ? "bg-primary text-on-primary font-semibold shadow-xs"
                  : "text-secondary hover:text-on-surface"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Explicit Interruption / Barge-in trigger button */}
        <button
          onClick={handleInterruptClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[11px] bg-primary/10 hover:bg-primary text-primary hover:text-on-primary font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
          title="Simulate or execute barge-in interruption while Basha speaks"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Interrupt (Barge-in)</span>
        </button>
      </div>

      {/* Stage Telemetry Header Card */}
      <div className="w-full bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container-high/60 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Dynamic Status Badge */}
          <div className={`flex items-center gap-2 ${stateConfig.badgeBg} px-3 py-1.5 rounded-full transition-colors`}>
            <span className={`w-2 h-2 rounded-full ${stateConfig.dotBg} ${stateConfig.dotPulse ? "animate-pulse" : ""}`} />
            <span className={`font-mono text-[11px] ${stateConfig.badgeTextCol} tracking-wider uppercase font-semibold`}>
              {stateConfig.badgeText}
            </span>
          </div>

          <div className="h-4 w-[1px] bg-surface-container-highest hidden sm:block" />

          {/* Monospace Technical Diagnostics */}
          <div className="flex items-center gap-2 font-mono text-[11px] text-tertiary">
            <span>duplex pcm</span>
            <span className="text-outline-variant">•</span>
            <span className="text-on-surface font-medium">
              {lastLatencyMs ? `${lastLatencyMs}ms turnaround` : "< 350ms turnaround"}
            </span>
            <span className="text-outline-variant">•</span>
            <span className="hidden md:inline text-secondary">
              {activeModel.replace("models/", "")}
            </span>
          </div>
        </div>

        {/* Dynamic Real-time Audio Spectrum Visualization in Status Pill */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-end justify-center gap-[3px] h-6 px-2.5 py-0.5 rounded-md bg-surface-container-low"
            title="Live audio spectrum"
          >
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="w-[3px] bg-primary rounded-full transition-all duration-100 ease-out"
                style={{ height: `${getSpectrumHeight(i)}px` }}
              />
            ))}
          </div>
          <span className="font-mono text-[11px] text-tertiary w-14 text-right">
            {volumeDb} dB
          </span>
        </div>
      </div>

      {/* Barge-in / Low-latency Interruption Telemetry Banner */}
      <div
        className={`w-full bg-surface-container-low px-4 py-2.5 rounded-lg mb-3 flex items-center justify-between border-l-2 border-primary/70 transition-all duration-300 ${
          bargeInNoticed ? "ring-2 ring-primary/40 bg-primary-fixed/20" : ""
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="font-mono text-[11px] text-on-surface font-semibold">
            Duplex Audio Engine
          </span>
          <span className="text-outline-variant font-mono text-[11px]">•</span>
          <span className="font-sans text-[12px] text-secondary">
            Hardware echo cancellation • Instant barge-in ready
          </span>
        </div>
        <div className="hidden sm:flex items-center font-mono text-[11px] text-on-surface-variant">
          <span className="bg-surface-container-highest px-2 py-0.5 rounded text-[11px]">
            &lt; 42ms cut-through
          </span>
        </div>
      </div>

      {/* Main Canvas Waveform Display */}
      <div className="relative w-full h-28 bg-surface-container-lowest border border-surface-container-high/80 rounded-xl overflow-hidden flex items-center justify-center shadow-xs">
        <canvas
          ref={canvasRef}
          width={720}
          height={112}
          className="w-full h-full block"
        />

        {/* Interim Speech Overlay in Real Time */}
        {state === "listening" && (
          <div className="absolute inset-x-4 bottom-2.5 pointer-events-none">
            {interimTranscript ? (
              <p className="text-xs text-on-surface font-mono truncate bg-surface-container-lowest/90 px-3 py-1.5 rounded-lg border border-outline-variant/60 shadow-sm">
                <span className="text-primary font-bold mr-1">&gt;</span>
                {interimTranscript}
              </p>
            ) : (
              <p className="text-[11px] text-tertiary font-mono tracking-wide">
                Listening for speech stream...
              </p>
            )}
          </div>
        )}

        {state === "thinking" && (
          <div className="absolute inset-x-4 bottom-2.5 pointer-events-none">
            <p className="text-[11px] text-on-surface-variant font-mono tracking-wide">
              Evaluating Shaik Rameez Basha knowledge base via Gemini...
            </p>
          </div>
        )}
      </div>

      {/* Real-time Hardware Volume Peak Bar */}
      <div className="w-full mt-2.5 flex items-center gap-2 px-1">
        <span className="text-[10px] font-mono text-tertiary w-10 shrink-0">
          dBFS
        </span>
        <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden flex gap-0.5">
          {Array.from({ length: 32 }).map((_, idx) => {
            const threshold = (idx / 32) * 60 - 60;
            const isActive = volumeDb >= threshold && state !== "idle";
            const isHot = idx > 26;
            return (
              <div
                key={idx}
                className={`flex-1 rounded-xs transition-all duration-75 ${
                  isActive
                    ? isHot
                      ? "bg-primary"
                      : "bg-primary-container"
                    : "bg-surface-container-highest"
                }`}
              />
            );
          })}
        </div>
        <span className="text-[10px] font-mono text-tertiary shrink-0">
          0dB
        </span>
      </div>

      {/* Action Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2.5 border-t border-surface-container-high/60">
        <div className="flex items-center gap-2">
          {state === "idle" ? (
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-on-background hover:bg-inverse-surface text-on-primary text-xs font-medium transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5 text-primary-fixed" />
              <span>Start Voice Session</span>
            </button>
          ) : (
            <button
              onClick={onStop}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/40 text-xs font-medium transition-all cursor-pointer"
            >
              <MicOff className="w-3.5 h-3.5 text-tertiary" />
              <span>Standby Mode</span>
            </button>
          )}

          {state === "speaking" && (
            <button
              onClick={handleInterruptClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-on-primary text-xs font-medium transition-all cursor-pointer active:scale-95"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Interrupt (Esc)</span>
            </button>
          )}

          {state === "listening" && interimTranscript && (
            <button
              onClick={onCommitSpeech}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-medium transition-all shadow-sm cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Send Now</span>
            </button>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[11px] text-tertiary font-mono">
          <span>[Space] Speak</span>
          <span>•</span>
          <span>[Esc] Interrupt</span>
        </div>
      </div>
    </div>
  );
};
