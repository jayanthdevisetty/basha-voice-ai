# Assessment Notes — Basha Voice AI

## 1. What Was Built
**Basha — Voice AI** is an interactive, browser-based voice conversation application built for the **100x AI Agent Team Stage 1 Assessment**. It represents **Shaik Rameez Basha** (AI/ML, GenAI, and Full-Stack Engineer) in first-person voice and text dialogue.

- **Public Production URL**: [https://rated-place-others-exhibitions.trycloudflare.com](https://rated-place-others-exhibitions.trycloudflare.com)
- **GitHub Repository**: [https://github.com/jayanthdevisetty/basha-voice-ai](https://github.com/jayanthdevisetty/basha-voice-ai)

An evaluator can visit the public URL, click **Start Conversation**, grant microphone access, and speak naturally. The application processes speech in real time, generates an answer grounded in Rameez's verified personal knowledge base, and speaks the answer back using high-fidelity browser text-to-speech with automatic hands-free turn taking.

---

## 2. Architecture & Design Rationale

```text
Browser Client
├── Web Speech API (STT with Interim Results & Dynamic Silence Detection)
├── Web Audio Visualizer (State-based Waveform & Sound Levels)
├── Web Speech Synthesis (TTS with KeepAlive Watchdog & Natural Voice Selection)
└── Accessible Text Input & Manual Controls
         │
         ▼ HTTPS JSON
Next.js Edge / Server Route (/api/chat)
├── In-Memory Sliding Window Rate Limiter (30 req/min per IP)
├── Zod Schema Validation & Input Sanitization
├── Conversational Session Memory Manager (Last 10 turns bounded)
└── ChatService with Multi-Model Failover (gemini-3.5-flash-lite / flash)
```

### Why This Architecture?
- **Zero Configuration for Evaluators**: No API keys, no installation, no logins. Pure browser zero-friction interaction.
- **Sub-Second Latency**: Using `gemini-3.5-flash-lite` delivers replies in ~400-800ms, making spoken conversations feel immediate rather than sluggish.
- **Failover Resilience**: The system features multi-model fallback across `gemini-3.5-flash-lite`, `gemini-3.5-flash`, and `gemini-flash-latest` with automatic retry logic for transient 429/503 status codes.
- **Universal Accessibility**: While voice is the core medium, an integrated text fallback guarantees that any evaluator on a browser without SpeechRecognition (or with a restricted microphone policy) can still test the system without friction.

---

## 3. How the AI Agent & Personalization Works

- **Identity**: Configured strictly as Shaik Rameez Basha, an AI/ML, GenAI, and Full-Stack Engineer.
- **First-Person Framing**: The agent never speaks about Rameez in the third person. It answers questions as "I", "my", and "me".
- **Structured Knowledge Base (`lib/knowledge-base.ts`)**:
  - **Education**: B.Tech CSE (Artificial Intelligence) at Narasaraopeta Engineering College, JNTUK (2022–2026).
  - **Projects**:
    - *RotorDyn*: Industrial rotor and bearing vibration analysis platform (FastAPI, Supabase/PostgreSQL, AI diagnostics reporting, desktop sync, licensing).
    - *AfterQuery*: Systems evaluation, caching, asynchronous validation, race condition debugging, and data reconciliation.
    - *Astra AI Innovation*: Freelance production AI, RAG pipelines, FastAPI, React.
  - **Superpower**: Turning ambiguous, messy technical problems into concrete, testable systems that ship.
  - **Growth Areas**: Deepening large-scale distributed system design, disciplined MVP shipping without endless refinement, and communicating technical nuance to non-technical stakeholders without jargon.
  - **Coworker Misconception**: Coworkers assume diving deep into architecture means caring only about backend code, when in reality Rameez is product-minded and obsessed with user experience.
  - **Boundary Pushing**: Stepping outside comfort zones, tackling domain-specific engineering (such as mechanical vibration physics in RotorDyn), and building production software instead of following tutorials.

---

## 4. Hallucination Control & Guardrails

The knowledge base and system prompt enforce strict grounding:
1. **Fact Check Rule**: The agent is explicitly prohibited from inventing companies, salaries, degrees, or awards.
2. **Transparent Bridging**: When asked ungrounded questions (such as working at Google or OpenAI), the agent politely states: *"I actually haven't worked there. My background is focused on AI, machine learning, and full-stack engineering..."*
3. **TTS Output Sanitization (`cleanSpokenText`)**: Automatically strips markdown formatting (`*`, `#`, `_`, bullet points, and code fences) and eliminates robotic opening boilerplate (*"That's a great question!"*) before synthesis.

---

## 5. Voice Interaction Pipeline Details

- **Turn-Taking**: The client uses `webkitSpeechRecognition` / `SpeechRecognition` with continuous listening and silence detection (1.6s timeout after user speech).
- **Auto-Listen Loop**: Once the agent finishes speaking an answer via `speechSynthesis`, the client automatically restarts listening so the evaluator can continue the conversation hands-free.
- **SpeechSynthesis KeepAlive**: Chrome has a known bug where utterances can freeze after ~15 seconds. An active keepalive timer (`pause()` / `resume()`) prevents truncation during longer answers.
- **Interrupt Capability**: Users can click "Interrupt" at any time while the agent is speaking to stop playback and immediately speak a follow-up.

---

## 6. Security & Production Hardening

- **Protected Secrets**: `GEMINI_API_KEY` is loaded strictly on the server and never sent to the browser.
- **Abuse Protection**: Sliding-window rate limiter prevents spam or denial-of-wallet attacks.
- **Input Bounding**: Input messages are trimmed to a maximum of 1,000 characters and sanitized.
- **Repository Cleanliness**: Git repository includes `.gitignore` covering `.env`, `.env.local`, and build artifacts. Only `.env.example` is tracked.

---

## 7. Known Browser Limitations

- **SpeechRecognition**: Fully supported in Chromium-based browsers (Chrome, Edge, Brave, Opera) and Safari 14.1+. In desktop Firefox, speech recognition requires manual `media.webspeech.recognition.enable` flags; the application detects this and provides the text input fallback.
- **HTTPS Requirement**: Modern browsers enforce HTTPS for microphone access.
