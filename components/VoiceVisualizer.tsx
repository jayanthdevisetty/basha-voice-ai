"use client";

import React, { useEffect, useRef } from "react";
import { ConversationState } from "@/hooks/useVoiceConversation";
import { Mic, MicOff, Square, ArrowUp, Activity, Cpu } from "lucide-react";

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
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High-precision canvas audio spectrum / oscilloscope rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let phase = 0;

    const render = () => {
      phase += 0.04;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Background technical subtle grid lines
      ctx.strokeStyle = "rgba(39, 39, 42, 0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      if (state === "listening" || state === "speaking") {
        // Multi-frequency harmonic waveform
        const numWaves = 3;
        for (let w = 0; w < numWaves; w++) {
          ctx.beginPath();
          ctx.lineWidth = w === 0 ? 2 : 1;
          ctx.strokeStyle =
            state === "listening"
              ? w === 0
                ? "rgba(16, 185, 129, 0.9)"
                : "rgba(16, 185, 129, 0.25)"
              : w === 0
              ? "rgba(244, 244, 245, 0.95)"
              : "rgba(161, 161, 170, 0.3)";

          const sliceWidth = width / 64;
          let x = 0;

          for (let i = 0; i <= 64; i++) {
            const freq = 0.05 + w * 0.02;
            const amp = (audioLevel * (height * 0.38) + 4) * (1 - w * 0.25);
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
        // Precision radar scanning sweep
        const radius = Math.min(width, height) * 0.32;
        const centerX = width / 2;
        const centerY = height / 2;

        ctx.strokeStyle = "rgba(99, 102, 241, 0.3)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = "rgba(168, 85, 247, 0.9)";
        ctx.lineWidth = 2;
        const sweepAngle = phase * 1.5;
        ctx.arc(centerX, centerY, radius, sweepAngle, sweepAngle + Math.PI * 0.5);
        ctx.stroke();
      } else {
        // Idle baseline calm oscilloscope line
        ctx.beginPath();
        ctx.strokeStyle = "rgba(82, 82, 91, 0.6)";
        ctx.lineWidth = 1.5;
        const sliceWidth = width / 32;
        let x = 0;
        for (let i = 0; i <= 32; i++) {
          const y = height / 2 + Math.sin(i * 0.2 + phase * 0.5) * 2;
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

  return (
    <div className="w-full max-w-2xl mx-auto my-4 bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-sm font-sans">
      {/* Top Telemetry Header Bar */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4 text-[11px] font-mono text-zinc-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                state === "listening"
                  ? "bg-emerald-400 animate-pulse"
                  : state === "speaking"
                  ? "bg-zinc-100 animate-pulse"
                  : state === "thinking"
                  ? "bg-indigo-400 animate-spin"
                  : state === "error"
                  ? "bg-amber-400"
                  : "bg-zinc-600"
              }`}
            />
            <span className="font-semibold uppercase tracking-wider text-zinc-200">
              {state === "listening"
                ? "REC // AUDIO IN"
                : state === "thinking"
                ? "INFERENCE // GEMINI"
                : state === "speaking"
                ? "PLAYBACK // SYNTHESIS"
                : state === "error"
                ? "FAULT // RECOVERY"
                : "STANDBY // IDLE"}
            </span>
          </div>
          <span className="text-zinc-600">|</span>
          <div className="hidden sm:flex items-center gap-1 text-zinc-400">
            <Cpu className="w-3 h-3 text-zinc-500" />
            <span>{activeModel.replace("models/", "")}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastLatencyMs && (
            <div className="flex items-center gap-1 text-zinc-400">
              <Activity className="w-3 h-3 text-zinc-500" />
              <span>{lastLatencyMs}ms</span>
            </div>
          )}
          <span className="text-zinc-600">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">LEVEL</span>
            <span className="text-zinc-300 font-mono w-12 text-right">
              {volumeDb} dB
            </span>
          </div>
        </div>
      </div>

      {/* Main Canvas Waveform Display */}
      <div className="relative w-full h-32 bg-zinc-900/60 border border-zinc-900 rounded-lg overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={640}
          height={128}
          className="w-full h-full block"
        />

        {/* Interim Speech Overlay in Real Time */}
        {state === "listening" && (
          <div className="absolute inset-x-4 bottom-3 pointer-events-none">
            {interimTranscript ? (
              <p className="text-xs text-zinc-200 font-mono truncate bg-zinc-950/80 px-2.5 py-1 rounded border border-zinc-800 backdrop-blur-sm">
                &gt; {interimTranscript}
              </p>
            ) : (
              <p className="text-[11px] text-zinc-500 font-mono tracking-wide">
                Listening for audio stream...
              </p>
            )}
          </div>
        )}

        {state === "thinking" && (
          <div className="absolute inset-x-4 bottom-3 pointer-events-none">
            <p className="text-[11px] text-zinc-400 font-mono tracking-wide">
              Executing neural inference on personal knowledge base...
            </p>
          </div>
        )}
      </div>

      {/* Real-time Hardware Volume Peak Bar */}
      <div className="w-full mt-3 flex items-center gap-2">
        <span className="text-[10px] font-mono text-zinc-500 w-10 shrink-0">
          dBFS
        </span>
        <div className="flex-1 h-1.5 bg-zinc-900 rounded-full overflow-hidden flex gap-0.5">
          {Array.from({ length: 32 }).map((_, idx) => {
            const threshold = (idx / 32) * 60 - 60;
            const isActive = volumeDb >= threshold && state !== "idle";
            const isHot = idx > 26;
            return (
              <div
                key={idx}
                className={`flex-1 rounded-sm transition-all duration-75 ${
                  isActive
                    ? isHot
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                    : "bg-zinc-800/60"
                }`}
              />
            );
          })}
        </div>
        <span className="text-[10px] font-mono text-zinc-500 shrink-0">
          0dB
        </span>
      </div>

      {/* Action Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-zinc-900">
        <div className="flex items-center gap-2">
          {state === "idle" ? (
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition-colors shadow-sm"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Initialize Voice Agent</span>
            </button>
          ) : (
            <button
              onClick={onStop}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition-colors"
            >
              <MicOff className="w-3.5 h-3.5 text-zinc-400" />
              <span>Standby Mode</span>
            </button>
          )}

          {state === "speaking" && (
            <button
              onClick={onInterrupt}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-red-400 border border-zinc-800 text-xs font-medium transition-colors"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Interrupt (Esc)</span>
            </button>
          )}

          {state === "listening" && interimTranscript && (
            <button
              onClick={onCommitSpeech}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-medium transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Send Now</span>
            </button>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[11px] text-zinc-500 font-mono">
          <span>[Space] Talk / Send</span>
          <span>•</span>
          <span>[Esc] Interrupt</span>
        </div>
      </div>
    </div>
  );
};
