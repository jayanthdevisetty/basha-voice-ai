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
}

// Global declaration for Web Speech API
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

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const recognitionActiveRef = useRef<boolean>(false);
  const isSpeakingRef = useRef<boolean>(false);
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestTranscriptRef = useRef<string>("");
  const messagesRef = useRef<Message[]>([]);
  const stateRef = useRef<ConversationState>("idle");

  // Keep refs updated for async callbacks
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Voice Selection for SpeechSynthesis
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const pickBestVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      // Prefer high quality natural English voices (Google, Natural, Apple, Microsoft)
      const englishVoices = voices.filter(
        (v) => v.lang.startsWith("en-") || v.lang === "en"
      );

      const preferred =
        englishVoices.find(
          (v) =>
            v.name.includes("Google US English") ||
            v.name.includes("Natural") ||
            v.name.includes("Samantha") ||
            v.name.includes("David") ||
            v.name.includes("Daniel") ||
            v.name.includes("Oliver")
        ) ||
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

  // Play text via SpeechSynthesis
  const speakText = useCallback(
    (text: string, onComplete?: () => void) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        onComplete?.();
        return;
      }

      stopSpeaking();

      const utterance = new SpeechSynthesisUtterance(text);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.rate = 1.05; // Slightly brisk, natural cadence
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        isSpeakingRef.current = true;
        setState("speaking");
        startKeepAlive();
      };

      utterance.onend = () => {
        isSpeakingRef.current = false;
        stopKeepAlive();
        onComplete?.();
      };

      utterance.onerror = (e) => {
        console.warn("SpeechSynthesis error:", e);
        isSpeakingRef.current = false;
        stopKeepAlive();
        onComplete?.();
      };

      window.speechSynthesis.speak(utterance);
    },
    [selectedVoice, stopSpeaking]
  );

  // Send message to server API
  const sendMessage = useCallback(
    async (text: string) => {
      const userMessageText = text.trim();
      if (!userMessageText) return;

      // Add user message to history
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

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with ${response.status}`);
        }

        const data = await response.json();
        const replyText = data.reply || "I didn't quite catch that. Could you say it again?";

        const botMessage: Message = {
          id: "msg-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
          role: "assistant",
          content: replyText,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);

        // Speak response out loud
        speakText(replyText, () => {
          // If in continuous voice mode, automatically restart listening!
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
    [continuousMode, speakText]
  );

  // Internal listener starter
  const startListeningInternal = useCallback(() => {
    if (typeof window === "undefined") return;

    stopSpeaking();

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

          // Clear previous silence timer
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }

          // Inactivity / silence detection: if user has spoken something and is quiet for 1.6s, submit
          silenceTimerRef.current = setTimeout(() => {
            if (latestTranscriptRef.current.trim().length > 0) {
              const toSend = latestTranscriptRef.current.trim();
              if (recognitionRef.current) {
                recognitionRef.current.stop();
              }
              sendMessage(toSend);
            }
          }, 1600);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setMicPermission("denied");
          setErrorMessage("Microphone permission was denied. Please allow microphone access or type your question below.");
          setState("error");
        } else if (event.error === "no-speech") {
          // Normal timeout if user was quiet; keep listening if in continuous mode
          if (stateRef.current === "listening" && continuousMode) {
            // Keep state as listening
          }
        } else if (event.error !== "aborted") {
          setErrorMessage(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        recognitionActiveRef.current = false;
        // If we were listening and got ended without error, check if there was pending text
        if (stateRef.current === "listening") {
          if (latestTranscriptRef.current.trim().length > 0) {
            const toSend = latestTranscriptRef.current.trim();
            sendMessage(toSend);
          } else if (continuousMode) {
            // Restart if user was still in conversation
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
  }, [continuousMode, sendMessage, stopSpeaking]);

  // Start conversation user action (requests mic permission first)
  const startConversation = useCallback(async () => {
    setErrorMessage(null);
    stopSpeaking();

    if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicPermission("granted");
        // Release the test stream
        stream.getTracks().forEach((track) => track.stop());
      } catch (err: unknown) {
        console.warn("Mic permission request rejected:", err);
        setMicPermission("denied");
        setErrorMessage(
          "Microphone access was denied. Please click the camera/mic icon in your browser address bar to allow it, or use the text box below."
        );
        setState("error");
        return;
      }
    }

    startListeningInternal();
  }, [startListeningInternal, stopSpeaking]);

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
  }, [endConversation]);

  // Replay a specific message via TTS
  const replayMessage = useCallback(
    (text: string) => {
      speakText(text);
    },
    [speakText]
  );

  // Audio level simulation during speaking or listening
  useEffect(() => {
    if (state !== "speaking" && state !== "listening") {
      setAudioLevel(0);
      return;
    }

    const interval = setInterval(() => {
      const level = Math.random() * 0.7 + 0.3;
      setAudioLevel(level);
    }, 120);

    return () => clearInterval(interval);
  }, [state]);

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
    };
  }, []);

  return {
    state,
    messages,
    interimTranscript,
    errorMessage,
    isSupported,
    micPermission,
    continuousMode,
    audioLevel,
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
