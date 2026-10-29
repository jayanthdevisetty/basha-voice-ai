# Basha — Voice AI

> **Have a conversation with my AI voice agent.**  
> Built for the **100x AI Agent Team Stage 1 Assessment** by **Shaik Rameez Basha**.

- 🌐 **Live Public URL**: [https://rated-place-others-exhibitions.trycloudflare.com](https://rated-place-others-exhibitions.trycloudflare.com)
- 📦 **GitHub Repository**: [https://github.com/jayanthdevisetty/basha-voice-ai](https://github.com/jayanthdevisetty/basha-voice-ai)

---

## 🌟 Overview

**Basha — Voice AI** is a production-quality, real-time voice agent representing **Shaik Rameez Basha** (AI/ML, GenAI, and Full-Stack Engineer). 

An evaluator opens the public URL and can immediately talk naturally with the agent using their browser and microphone. The agent answers in first person ("I", "my") grounded in an extensive, factual personal knowledge base covering engineering projects (RotorDyn, AfterQuery, Astra AI Innovation), technical stack, core superpower, growth areas, coworker misconceptions, and boundary-pushing experiences.

---

## 🏗️ Architecture

```text
Browser (Web Speech STT / Mic)
   │
   ▼
Audio Stream / Live Interim Transcript
   │
   ▼ (JSON over HTTPS)
POST /api/chat
   │
   ├── Sliding Window Rate Limiter (30 req/min per IP)
   ├── Zod Payload & Content Sanitizer
   ├── Contextual Conversational Memory Manager (Last 10 turns)
   └── Server-Side Gemini LLM Engine (gemini-3.5-flash-lite / flash with failover)
   │
   ▼ Cleaned Natural Spoken Response
POST /api/chat Response
   │
   ▼
Browser (Web Speech Synthesis / TTS with KeepAlive & Auto-Listen Loop)
```

---

## 🛠️ Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend Framework** | Next.js 15 (App Router), React 19, TypeScript | Server-side rendering, type safety, low runtime overhead |
| **Styling** | Tailwind CSS | Restrained, minimalist, Apple-inspired dark aesthetic |
| **Icons** | Lucide React | Lightweight, accessible SVG iconography |
| **LLM Provider** | Google Gemini API (`gemini-3.5-flash-lite` / `gemini-3.5-flash`) | Sub-second latency, generous free tier, multi-model failover |
| **Voice STT** | Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) | Zero-latency, browser-native streaming transcription with silence detection |
| **Voice TTS** | Web Speech API (`speechSynthesis`) + KeepAlive Watchdog | Natural vocalization with 15s freeze fix, voice selection, and interrupt capability |
| **Validation** | Zod | Runtime payload contract enforcement |
| **Testing** | Vitest | Fast unit testing and automated AI behavioral evaluation |

---

## 🎙️ Voice Interaction Pipeline

1. **State Machine**:
   - `idle`: "Ready to talk" with one-click initiation.
   - `listening`: Emerald pulsing visualizer, live interim transcript display, silence detection (1.6s quiet trigger), and manual send bypass.
   - `thinking`: Purple breathing spinner while server executes LLM inference.
   - `speaking`: Indigo oscillating wave bars, active voice output, instant "Interrupt" button.
   - `error`: Clear diagnostics with "Try Again" recovery.

2. **Continuous Hands-Free Conversation**:
   - Once started, the agent listens, waits for silence, thinks, speaks the answer, and **automatically resumes listening**.
   - Evaluators can converse back-and-forth naturally without repeatedly clicking buttons.

3. **Accessible Text Fallback**:
   - If microphone permissions are denied or the browser lacks speech recognition, evaluators can type directly into the prompt box.
   - The AI answers with both on-screen transcript and spoken voice.

---

## 🧠 Personal AI & Knowledge Architecture

- **True First-Person Persona**: Never speaks in third person ("Rameez built..."). Always speaks as Rameez ("In my work on RotorDyn, I built...").
- **Strict Anti-Hallucination Guardrails**: If asked about ungrounded roles, salaries, or companies (e.g., "Tell me about your job as VP at Google"), the agent politely and transparently clarifies what is outside its experience.
- **Conversational Memory**: Understands pronouns and references across turns ("Why do you think that's your superpower?", "Can you give me an example of that?").
- **TTS Text Cleaner**: Strips markdown hashes, bullet points, bolding, and robotic filler ("That's a great question!") before synthesis.

---

## 🔒 Security Model

- **Zero Client Credential Exposure**: `GEMINI_API_KEY` is loaded strictly server-side.
- **Rate Limiting**: Sliding-window limiter restricts clients to 30 requests per minute to prevent burst abuse.
- **Payload Sanitization**: Inputs are bounded to 1000 characters, validated via Zod, and stripped of malicious control characters.
- **Git Hygiene**: `.env` and `.env.local` are strictly `.gitignore`d. Only `.env.example` is committed.

---

## 🚀 Local Development

1. **Clone repository**:
   ```bash
   git clone <repo-url>
   cd voice-bot
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create `.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-3.5-flash-lite
   RATE_LIMIT_MAX_REQUESTS_PER_MINUTE=30
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

5. **Start dev server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000`.

---

## 🌐 Known Browser Limitations

- **SpeechRecognition**: Fully supported in Chrome, Edge, Safari 14.1+, and Android Chrome. In desktop Firefox, speech recognition requires manual experimental flags; the app automatically detects this and provides the fallback text input.
- **Microphone Permissions**: Browser requires HTTPS in production to access the microphone.
