"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export type ConversationState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "error";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  latencyMs?: number;
  model?: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
}

interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

export function useVoiceConversation() {
  const [state, setState] = useState<ConversationState>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [micPermission, setMicPermission] = useState<"granted" | "denied" | "prompt">("prompt");
  const [continuousMode, setContinuousMode] = useState<boolean>(true);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [volumeDb, setVolumeDb] = useState<number>(-60);
  const [lastLatencyMs, setLastLatencyMs] = useState<number | null>(null);
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [activeModel, setActiveModel] = useState<string>("gemini-3.5-flash-lite");

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const recognitionActiveRef = useRef<boolean>(false);
  const isSpeakingRef = useRef<boolean>(false);
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestTranscriptRef = useRef<string>("");
  const messagesRef = useRef<Message[]>([]);
  const stateRef = useRef<ConversationState>("idle");

  // Web Audio API refs for real spectrum analysis
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Keep refs updated for async callbacks
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Session elapsed timer
  useEffect(() => {
    if (state !== "idle") {
      if (!sessionTimerRef.current) {
        sessionTimerRef.current = setInterval(() => {
          setSessionSeconds((prev) => prev + 1);
        }, 1000);
      }
    } else {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }
    }

    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }
    };
  }, [state]);

  // Voice Selection for SpeechSynthesis
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const pickBestVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      const englishVoices = voices.filter(
        (v) => v.lang.startsWith("en-") || v.lang === "en"
      );

      // Ranked preference for modern neural, natural, and enhanced voices
      const preferred =
        englishVoices.find((v) => v.name.includes("Online (Natural)") || v.name.includes("Natural")) ||
        englishVoices.find(
          (v) =>
            v.name.includes("Google UK English Male") ||
            v.name.includes("Google US English") ||
            v.name.includes("Google UK English Female")
        ) ||
        englishVoices.find((v) => v.name.includes("Enhanced") || v.name.includes("Premium")) ||
        englishVoices.find((v) => /ryan|guy|daniel|oliver|nathan|alex/i.test(v.name)) ||
        englishVoices.find((v) => v.lang === "en-US") ||
        englishVoices[0] ||
        voices[0];

      setSelectedVoice(preferred || null);
    };

    pickBestVoice();
    window.speechSynthesis.onvoiceschanged = pickBestVoice;
  }, []);

  // Initialize Speech Recognition capability check
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionClass =
      (window as unknown as { SpeechRecognition?: ISpeechRecognitionConstructor }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: ISpeechRecognitionConstructor }).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSupported(false);
    }
  }, []);

  // Web Audio Context & Analyser Initialization
  const setupAudioAnalyser = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      return;
    }

    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }

      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }

      if (!mediaStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        mediaStreamRef.current = stream;
        setMicPermission("granted");
      }

      if (!analyserRef.current && audioContextRef.current && mediaStreamRef.current) {
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.75;
        const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
        source.connect(analyser);
        analyserRef.current = analyser;
      }
    } catch (err) {
      console.warn("Could not initialize Web Audio Analyser:", err);
    }
  }, []);

  // Continuous Audio Spectrum & Volume Loop via requestAnimationFrame
  useEffect(() => {
    const dataArray = new Uint8Array(128);

    const updateAudioMetrics = () => {
      if (analyserRef.current && stateRef.current === "listening") {
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        let peak = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const val = dataArray[i];
          sum += val;
          if (val > peak) peak = val;
        }

        const avg = sum / dataArray.length;
        const normalized = Math.min(1, avg / 80);
        setAudioLevel(normalized);

        // Convert to approximate dBFS (-60 to 0)
        const db = peak > 0 ? 20 * Math.log10(peak / 255) : -60;
        setVolumeDb(Math.max(-60, Math.round(db)));
      } else if (stateRef.current === "speaking") {
        // Synthesize dynamic voice waveform for TTS output
        const simulated = Math.random() * 0.6 + 0.3;
        setAudioLevel(simulated);
        setVolumeDb(Math.round(-18 + Math.random() * 10));
      } else {
        setAudioLevel(0);
        setVolumeDb(-60);
      }

      animationFrameRef.current = requestAnimationFrame(updateAudioMetrics);
    };

    animationFrameRef.current = requestAnimationFrame(updateAudioMetrics);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Stop speech synthesis keep-alive
  const stopKeepAlive = () => {
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
      keepAliveIntervalRef.current = null;
    }
  };

  // Start speech synthesis keep-alive (fixes Chrome 15s pause bug)
  const startKeepAlive = () => {
    stopKeepAlive();
    keepAliveIntervalRef.current = setInterval(() => {
      if (typeof window !== "undefined" && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);
  };

  // Cancel any active audio playback
  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    stopKeepAlive();
    isSpeakingRef.current = false;
  }, []);

  // Play text via SpeechSynthesis with sentence-level streaming playback
  const speakText = useCallback(
    (text: string, onComplete?: () => void) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        onComplete?.();
        return;
      }

      stopSpeaking();

      // Chunk text into natural sentences for sub-300ms playback initiation
      const sentences = text
        .match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g)
        ?.map((s) => s.trim())
        .filter((s) => s.length > 0) || [text];

      if (sentences.length === 0) {
        onComplete?.();
        return;
      }

      let currentIdx = 0;
      isSpeakingRef.current = true;
      setState("speaking");
      startKeepAlive();

      const speakNextSentence = () => {
        if (!isSpeakingRef.current || currentIdx >= sentences.length) {
          isSpeakingRef.current = false;
          stopKeepAlive();
          onComplete?.();
          return;
        }

        const sentenceText = sentences[currentIdx];
        currentIdx++;

        const utterance = new SpeechSynthesisUtterance(sentenceText);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onend = () => {
          speakNextSentence();
        };

        utterance.onerror = (e) => {
          if (e.error !== "canceled" && e.error !== "interrupted") {
            console.warn("SpeechSynthesis utterance error:", e.error);
          }
          speakNextSentence();
        };

        window.speechSynthesis.speak(utterance);
      };

      speakNextSentence();
    },
    [selectedVoice, stopSpeaking]
  );

  // Send message to server API
  const sendMessage = useCallback(
    async (text: string) => {
      const userMessageText = text.trim();
      if (!userMessageText) return;

      const userMessage: Message = {
        id: "msg-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
        role: "user",
        content: userMessageText,
        timestamp: new Date(),
      };

      const updatedHistory = [...messagesRef.current, userMessage];
      setMessages(updatedHistory);
      setInterimTranscript("");
      latestTranscriptRef.current = "";
      setState("thinking");

      const startTime = performance.now();

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessageText,
            conversationHistory: updatedHistory.slice(-8).map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        const elapsed = Math.round(performance.now() - startTime);
        setLastLatencyMs(elapsed);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with ${response.status}`);
        }

        const data = await response.json();
        const replyText = data.reply || "I didn't quite catch that. Could you say it again?";
        if (data.model) {
          setActiveModel(data.model);
        }

        const botMessage: Message = {
          id: "msg-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
          role: "assistant",
          content: replyText,
          timestamp: new Date(),
          latencyMs: elapsed,
          model: data.model || activeModel,
        };

        setMessages((prev) => [...prev, botMessage]);

        // Speak response out loud
        speakText(replyText, () => {
          if (continuousMode && stateRef.current !== "idle") {
            startListeningInternal();
          } else {
            setState("idle");
          }
        });
      } catch (err: unknown) {
        console.error("Chat error:", err);
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "I ran into a connection issue. Please try again."
        );
        setState("error");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [continuousMode, speakText, activeModel]
  );

  // Internal listener starter
  const startListeningInternal = useCallback(() => {
    if (typeof window === "undefined") return;

    stopSpeaking();
    setupAudioAnalyser();

    const SpeechRecognitionClass =
      (window as unknown as { SpeechRecognition?: ISpeechRecognitionConstructor }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: ISpeechRecognitionConstructor }).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      setErrorMessage("Speech recognition is not supported in this browser. You can type instead!");
      setState("error");
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        recognitionActiveRef.current = true;
        setState("listening");
        setErrorMessage(null);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalStr = "";
        let interimStr = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalStr += item[0].transcript;
          } else {
            interimStr += item[0].transcript;
          }
        }

        const currentText = (finalStr || interimStr).trim();
        if (currentText) {
          setInterimTranscript(currentText);
          latestTranscriptRef.current = currentText;

          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }

          // Inactivity / silence detection: 1.5s silence triggers send
          silenceTimerRef.current = setTimeout(() => {
            if (latestTranscriptRef.current.trim().length > 0) {
              const toSend = latestTranscriptRef.current.trim();
              if (recognitionRef.current) {
                recognitionRef.current.stop();
              }
              sendMessage(toSend);
            }
          }, 1500);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setMicPermission("denied");
          setErrorMessage("Microphone permission was denied. Please allow microphone access or type your question below.");
          setState("error");
        } else if (event.error === "no-speech") {
          if (stateRef.current === "listening" && continuousMode) {
            // Keep listening
          }
        } else if (event.error !== "aborted") {
          setErrorMessage(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        recognitionActiveRef.current = false;
        if (stateRef.current === "listening") {
          if (latestTranscriptRef.current.trim().length > 0) {
            const toSend = latestTranscriptRef.current.trim();
            sendMessage(toSend);
          } else if (continuousMode) {
            try {
              recognition.start();
            } catch {
              // Ignore
            }
          } else {
            setState("idle");
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: unknown) {
      console.error("Failed to start speech recognition:", err);
      setState("error");
      setErrorMessage("Could not activate microphone. Please check permissions or type below.");
    }
  }, [continuousMode, sendMessage, stopSpeaking, setupAudioAnalyser]);

  // Start conversation user action
  const startConversation = useCallback(async () => {
    setErrorMessage(null);
    stopSpeaking();
    await setupAudioAnalyser();
    startListeningInternal();
  }, [setupAudioAnalyser, startListeningInternal, stopSpeaking]);

  // Stop conversation user action
  const endConversation = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    stopSpeaking();
    setInterimTranscript("");
    latestTranscriptRef.current = "";
    setState("idle");
  }, [stopSpeaking]);

  // Manual trigger to send current interim transcript immediately
  const commitInterimSpeech = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    const text = latestTranscriptRef.current.trim();
    if (text) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      sendMessage(text);
    }
  }, [sendMessage]);

  // Restart conversation
  const restartConversation = useCallback(() => {
    endConversation();
    setMessages([]);
    setErrorMessage(null);
    setSessionSeconds(0);
    setLastLatencyMs(null);
  }, [endConversation]);

  // Replay a specific message via TTS
  const replayMessage = useCallback(
    (text: string) => {
      speakText(text);
    },
    [speakText]
  );

  // Keyboard shortcuts (Escape to interrupt, Space to toggle listening when not in input)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === "Escape") {
        if (state === "speaking") {
          stopSpeaking();
          e.preventDefault();
        } else if (state !== "idle") {
          endConversation();
          e.preventDefault();
        }
      } else if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        if (state === "idle") {
          startConversation();
        } else if (state === "listening") {
          commitInterimSpeech();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state, startConversation, commitInterimSpeech, stopSpeaking, endConversation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopKeepAlive();
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const formatSessionTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remaining.toString().padStart(2, "0")}`;
  };

  return {
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
    sessionDuration: formatSessionTime(sessionSeconds),
    activeModel,
    selectedVoice,
    setContinuousMode,
    startConversation,
    endConversation,
    commitInterimSpeech,
    restartConversation,
    sendMessage,
    stopSpeaking,
    replayMessage,
  };
}
