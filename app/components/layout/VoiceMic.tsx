"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import SiriOrb from "./SiriOrb";
import { projects } from "@/app/data/projects";

const SAMPLE_RATE = 16000;
const CHUNK_SIZE = 4096;
const SPEECH_RMS_THRESHOLD = 0.012;
const SILENCE_HANG_MS = 700;
const MIN_UTTERANCE_MS = 400;
const SCROLL_STEP = 0.85; // fraction of viewport height per "scroll" command
const EMAIL = "9shrey@gmail.com";

const BIO_TEXT =
  "I'm Shrey Singh, an AI and ML engineer based in Bengaluru. I build and ship real systems — fraud detection, quant research, LLM evaluation, and GPU kernels.";

const HELP_TEXT =
  "I can take you to any page, open or describe a project, filter the work by category, scroll the page, copy my email, open the terminal, or type a command into it. Just ask.";

const PAGES: { route: string; say: string; words: string[] }[] = [
  { route: "/", say: "Back to the start.", words: ["home", "landing page", "main page", "start over"] },
  { route: "/work", say: "Here's the work.", words: ["work", "projects", "portfolio"] },
  { route: "/experience", say: "Pulling up the experience.", words: ["experience", "resume page", "career", "work history"] },
  { route: "/about", say: "Let me show you around.", words: ["about"] },
  { route: "/now", say: "Here's what I'm up to now.", words: ["now", "currently"] },
  { route: "/writing", say: "On to the writing.", words: ["writing", "blog", "articles", "posts", "notes"] },
  { route: "/contact", say: "Let's get you in touch.", words: ["contact"] },
];

const CATEGORY_SYNONYMS: Record<string, string[]> = {
  GenAI: ["genai", "gen ai", "llm", "language model", "evaluation"],
  Quant: ["quant", "arbitrage", "trading", "finance"],
  "Applied ML": ["applied ml", "machine learning"],
  Backend: ["backend", "api", "service"],
  Systems: ["systems", "gpu", "kernel", "infrastructure"],
  Product: ["product"],
  All: ["everything", "all of them", "all projects"],
};

type Phase =
  | "loading"
  | "listening"
  | "thinking"
  | "speaking"
  | "routed"
  | "unclear"
  | "failed";

function concat(chunks: Float32Array[]): Float32Array {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Float32Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

function rms(chunk: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < chunk.length; i++) sum += chunk[i] * chunk[i];
  return Math.sqrt(sum / chunk.length);
}

// Local "butler" commands: handled instantly, on-device, no network call.
type LocalCommand =
  | { type: "scroll"; dir: "up" | "down" | "top" | "bottom" }
  | { type: "stop" }
  | { type: "silence" }
  | { type: "history"; dir: "back" | "forward" }
  | { type: "navigate"; route: string; say: string }
  | { type: "openProject"; slug: string; title: string }
  | { type: "projectInfo"; say: string }
  | { type: "filterWork"; category: string }
  | { type: "toggleTerminal"; open: boolean }
  | { type: "copyEmail" }
  | { type: "repeat" }
  | { type: "speakOnly"; say: string }
  | { type: "click"; text: string; say: string }
  | { type: "runTerminal"; text: string };

// Matches a spoken phrase against a project's title/shortTitle/slug words —
// tolerant of "open argus", "show me the fraud detection project", etc.
function findProject(t: string) {
  let best: { slug: string; title: string; score: number } | null = null;
  for (const p of projects) {
    const haystacks = [p.title, p.shortTitle, p.slug.replace(/-/g, " ")];
    for (const h of haystacks) {
      const words = h.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2);
      const hits = words.filter((w) => t.includes(w)).length;
      if (hits > 0 && (!best || hits > best.score)) {
        best = { slug: p.slug, title: p.shortTitle, score: hits };
      }
    }
  }
  return best;
}

function findFullProject(t: string) {
  const hit = findProject(t);
  if (!hit) return null;
  return projects.find((p) => p.slug === hit.slug) ?? null;
}

// "open work" -> /work, "take me home", "show me the writing" etc.
function findPage(t: string) {
  for (const page of PAGES) {
    if (page.words.some((w) => t.includes(w))) return page;
  }
  return null;
}

function findCategory(t: string): string | null {
  for (const [cat, words] of Object.entries(CATEGORY_SYNONYMS)) {
    if (words.some((w) => t.includes(w))) return cat;
  }
  return null;
}

function matchLocalCommand(raw: string): LocalCommand | null {
  const t = raw.toLowerCase().trim();
  if (!t) return null;

  if (/\b(stop listening|stop|that'?s all|goodbye|bye|never ?mind)\b/.test(t)) {
    return { type: "stop" };
  }
  if (/\b(be quiet|stop talking|shut up|silence|hush)\b/.test(t)) {
    return { type: "silence" };
  }

  // scrolling
  if (/\b(top|beginning|start of the page|very top)\b/.test(t)) {
    return { type: "scroll", dir: "top" };
  }
  if (/\b(bottom|end of the page|very end|footer)\b/.test(t)) {
    return { type: "scroll", dir: "bottom" };
  }
  if (/\bscroll\b.*\bup\b|\bgo up\b|\bup a bit\b|\bback up\b/.test(t)) {
    return { type: "scroll", dir: "up" };
  }
  if (/\bscroll\b.*\bdown\b|\bgo down\b|\bdown a bit\b|\bkeep going\b|\bmore\b/.test(t)) {
    return { type: "scroll", dir: "down" };
  }

  // browser history
  if (/\bgo back\b|\bprevious page\b|\bback a page\b/.test(t)) {
    return { type: "history", dir: "back" };
  }
  if (/\bgo forward\b|\bnext page\b/.test(t)) {
    return { type: "history", dir: "forward" };
  }

  // meta
  if (/\b(say that again|repeat that|what did you say|come again)\b/.test(t)) {
    return { type: "repeat" };
  }
  if (/\bcopy\b.*\b(email|address)\b/.test(t)) {
    return { type: "copyEmail" };
  }
  if (/\b(what can you do|your abilities|list commands|help me out|show me what you can do)\b/.test(t) || t === "help") {
    return { type: "speakOnly", say: HELP_TEXT };
  }
  if (/\b(who are you|what do you do|tell me about yourself|introduce yourself|your background)\b/.test(t)) {
    return { type: "speakOnly", say: BIO_TEXT };
  }

  // terminal
  if (/\bopen\b.*\bterminal\b/.test(t)) {
    return { type: "toggleTerminal", open: true };
  }
  if (/\bclose\b.*\bterminal\b/.test(t)) {
    return { type: "toggleTerminal", open: false };
  }
  const typeMatch = t.match(/\btype\s+(.+)/);
  if (typeMatch) {
    return { type: "runTerminal", text: typeMatch[1].trim() };
  }

  // contact shortcuts
  if (/\b(start (a )?conversation|get in touch|reach out|contact (you|me)|email you|send you an email)\b/.test(t)) {
    return { type: "click", text: "start a conversation", say: "Opening your mail app." };
  }
  if (/\bresume\b|\bcv\b/.test(t) && /\b(open|show|download|see)\b/.test(t)) {
    return { type: "click", text: "resume", say: "Here's the resume." };
  }

  // project deep-dive, without navigating away
  if (/\b(tell me about|what is|describe|explain)\b/.test(t) && !/\byourself\b/.test(t)) {
    const project = findFullProject(t);
    if (project) {
      return {
        type: "projectInfo",
        say: `${project.title}. ${project.blurb} ${project.outcome}.`,
      };
    }
  }

  // filtering the work index by category
  const category = findCategory(t);
  if (category && /\b(filter|only|just show|show me|category)\b/.test(t)) {
    return { type: "filterWork", category };
  }

  // page navigation — checked before project navigation so page names win
  if (/\b(open|show me|pull up|go to|take me to|navigate to)\b/.test(t)) {
    const page = findPage(t);
    if (page) {
      return { type: "navigate", route: page.route, say: page.say };
    }
    const project = findProject(t);
    if (project) {
      return { type: "openProject", slug: project.slug, title: project.title };
    }
  }

  const clickMatch = t.match(/\bclick(?: on)?\s+(?:the\s+)?(.+)/);
  if (clickMatch) {
    return { type: "click", text: clickMatch[1].trim(), say: "" };
  }

  return null;
}

// Finds the first visible link/button whose text roughly matches `text` and
// clicks it — the "butler" reaching out and pressing the button for you.
function clickByText(text: string): boolean {
  const needle = text.toLowerCase().trim();
  if (!needle) return false;
  const candidates = Array.from(
    document.querySelectorAll<HTMLElement>("a, button")
  ).filter((el) => {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });

  let match =
    candidates.find((el) => el.textContent?.trim().toLowerCase() === needle) ??
    candidates.find((el) => el.textContent?.toLowerCase().includes(needle));

  if (!match) {
    const words = needle.split(/\s+/).filter((w) => w.length > 2);
    match = candidates.find((el) => {
      const label = el.textContent?.toLowerCase() ?? "";
      return words.length > 0 && words.every((w) => label.includes(w));
    });
  }

  if (match) {
    match.scrollIntoView({ behavior: "smooth", block: "center" });
    match.click();
    return true;
  }
  return false;
}

function doScroll(dir: "up" | "down" | "top" | "bottom") {
  if (dir === "top") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  if (dir === "bottom") {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    return;
  }
  const delta = window.innerHeight * SCROLL_STEP * (dir === "down" ? 1 : -1);
  window.scrollBy({ top: delta, behavior: "smooth" });
}

export default function VoiceMic() {
  const router = useRouter();
  const [supported, setSupported] = useState(false);
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("listening");
  const [note, setNote] = useState<string | null>(null);
  const [loadPct, setLoadPct] = useState<number | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const modelReadyRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const openRef = useRef(false);
  const busyRef = useRef(false);

  const bufferRef = useRef<Float32Array[]>([]);
  const speakingRef = useRef(false);
  const silenceMsRef = useRef(0);
  const speechMsRef = useRef(0);

  // Live mic amplitude, read every frame by SiriOrb — not state, so the
  // wave animation never triggers a React re-render.
  const levelRef = useRef(0);
  const outputLevelRef = useRef(0);

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" &&
        Boolean(navigator.mediaDevices?.getUserMedia) &&
        Boolean(window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)
    );
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL("../../lib/whisperWorker.ts", import.meta.url),
        { type: "module" }
      );
    }
    return workerRef.current;
  }, []);

  const lastSpokenRef = useRef<string>("");

  // Some browsers (notably Chrome) silently drop the first speechSynthesis
  // call on a page unless it was primed by an earlier one made inside a
  // direct user gesture. Called synchronously from the mic button's onClick.
  const primeSpeech = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      const synth = window.speechSynthesis;
      synth.getVoices();
      const warm = new SpeechSynthesisUtterance(" ");
      warm.volume = 0;
      synth.speak(warm);
    } catch {
      // best-effort — if this fails, speak() below still tries on its own
    }
  }, []);

  // Free, on-device text-to-speech via the browser's SpeechSynthesis API.
  // Drives outputLevelRef so the orb visibly "speaks" while talking.
  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis || !text) return;
    const synth = window.speechSynthesis;
    lastSpokenRef.current = text;

    const queue = () => {
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1.05;
      utter.pitch = 1;
      const enVoice = synth.getVoices().find((v) => v.lang?.toLowerCase().startsWith("en"));
      if (enVoice) utter.voice = enVoice;

      let raf = 0;
      let settled = false;
      const pulse = () => {
        // Synthetic amplitude — the Web Speech API exposes no real audio
        // signal, so fake a natural-looking talking cadence.
        outputLevelRef.current = 0.15 + Math.abs(Math.sin(Date.now() / 90)) * 0.45;
        raf = requestAnimationFrame(pulse);
      };
      const finish = () => {
        if (settled) return;
        settled = true;
        cancelAnimationFrame(raf);
        outputLevelRef.current = 0;
        busyRef.current = false;
        if (openRef.current) setPhase("listening");
      };
      utter.onstart = () => {
        setPhase("speaking");
        pulse();
      };
      utter.onend = finish;
      utter.onerror = finish;

      synth.speak(utter);
      // Safety net: some browsers silently drop speak() (autoplay policy,
      // voices not yet loaded) without ever firing onstart/onend — without
      // this the orb and busy flag would stay stuck.
      window.setTimeout(finish, Math.max(1500, text.length * 90));
    };

    // Calling speak() immediately after cancel() can drop the new utterance
    // in Chrome, since cancel() resolves asynchronously — give it a beat.
    if (synth.speaking || synth.pending) {
      synth.cancel();
      window.setTimeout(queue, 40);
    } else {
      queue();
    }
  }, []);

  const classify = useCallback(
    async (transcript: string) => {
      if (!transcript.trim()) {
        busyRef.current = false;
        if (openRef.current) setPhase("listening");
        return;
      }

      const local = matchLocalCommand(transcript);
      if (local) {
        if (local.type === "stop") {
          setNote("see you around");
          speak("See you around.");
          setOpen(false);
          openRef.current = false;
          return;
        }
        if (local.type === "scroll") {
          doScroll(local.dir);
          busyRef.current = false;
          if (openRef.current) setPhase("listening");
          return;
        }
        if (local.type === "silence") {
          window.speechSynthesis?.cancel();
          busyRef.current = false;
          if (openRef.current) setPhase("listening");
          return;
        }
        if (local.type === "history") {
          if (local.dir === "back") router.back();
          else router.forward();
          busyRef.current = false;
          if (openRef.current) setPhase("listening");
          return;
        }
        if (local.type === "repeat") {
          if (lastSpokenRef.current) speak(lastSpokenRef.current);
          busyRef.current = false;
          if (openRef.current) setPhase("listening");
          return;
        }
        if (local.type === "copyEmail") {
          navigator.clipboard?.writeText(EMAIL).catch(() => {});
          setNote("email copied");
          speak("Copied.");
          busyRef.current = false;
          if (openRef.current) setPhase("listening");
          return;
        }
        if (local.type === "speakOnly" || local.type === "projectInfo") {
          speak(local.say);
          busyRef.current = false;
          if (openRef.current) setPhase("listening");
          return;
        }
        if (local.type === "filterWork") {
          const apply = () =>
            window.dispatchEvent(
              new CustomEvent("jev:filter-projects", { detail: { category: local.category } })
            );
          if (window.location.pathname !== "/work") {
            setNote(`filtering to ${local.category}...`);
            setPhase("routed");
            router.push("/work");
            window.setTimeout(apply, 400);
          } else {
            apply();
          }
          speak(`Showing ${local.category === "All" ? "everything" : local.category}.`);
          busyRef.current = false;
          if (openRef.current) setPhase("listening");
          return;
        }
        if (local.type === "toggleTerminal") {
          window.dispatchEvent(
            new CustomEvent("jev:toggle-terminal", { detail: { open: local.open } })
          );
          busyRef.current = false;
          if (openRef.current) setPhase("listening");
          return;
        }
        if (local.type === "navigate") {
          setNote(`opening ${local.route}...`);
          setPhase("routed");
          router.push(local.route);
          speak(local.say);
          return;
        }
        if (local.type === "openProject") {
          setNote(`opening ${local.title}...`);
          setPhase("routed");
          router.push(`/work/${local.slug}`);
          speak(`Here's ${local.title}.`);
          return;
        }
        if (local.type === "runTerminal") {
          window.dispatchEvent(
            new CustomEvent("jev:run-command", { detail: { text: local.text } })
          );
          busyRef.current = false;
          if (openRef.current) setPhase("listening");
          return;
        }
        if (local.type === "click") {
          const clicked = clickByText(local.text);
          if (clicked) {
            if (local.say) speak(local.say);
            busyRef.current = false;
            if (openRef.current) setPhase("listening");
          } else {
            setNote(`couldn't find "${local.text}" on this page`);
            setPhase("unclear");
            busyRef.current = false;
            if (openRef.current) setPhase("listening");
          }
          return;
        }
      }

      setPhase("thinking");
      try {
        const res = await fetch("/api/voice-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript }),
        });
        const data = await res.json();
        if (data.route) {
          setNote(`opening ${data.route}...`);
          setPhase("routed");
          router.push(data.route);
          speak(data.say ?? "On it.");
        } else {
          setNote("didn't catch that — try again");
          setPhase("unclear");
          busyRef.current = false;
          if (openRef.current) setPhase("listening");
        }
      } catch {
        setNote("voice lookup failed");
        setPhase("unclear");
        busyRef.current = false;
        if (openRef.current) setPhase("listening");
      }
    },
    [router, speak]
  );

  const teardownAudio = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    bufferRef.current = [];
    speakingRef.current = false;
    silenceMsRef.current = 0;
    speechMsRef.current = 0;
    levelRef.current = 0;
  }, []);

  const stopSession = useCallback(() => {
    openRef.current = false;
    setOpen(false);
    window.speechSynthesis?.cancel();
    teardownAudio();
  }, [teardownAudio]);

  const fail = useCallback(
    (msg: string) => {
      setPhase("failed");
      setNote(msg);
      openRef.current = false;
      setOpen(true); // keep the pill expanded so the message is visible
      teardownAudio();
    },
    [teardownAudio]
  );

  const finalizeUtterance = useCallback(() => {
    const chunks = bufferRef.current;
    const durationMs = speechMsRef.current;
    bufferRef.current = [];
    speakingRef.current = false;
    silenceMsRef.current = 0;
    speechMsRef.current = 0;
    if (durationMs < MIN_UTTERANCE_MS || busyRef.current || chunks.length === 0) {
      return;
    }
    busyRef.current = true;
    setPhase("thinking");
    const audio = concat(chunks);
    getWorker().postMessage({ type: "transcribe", audio }, [audio.buffer]);
  }, [getWorker]);

  const startAudioGraph = useCallback(async () => {
    const AudioContextCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const ctx = new AudioContextCtor({ sampleRate: SAMPLE_RATE });
    audioCtxRef.current = ctx;

    const source = ctx.createMediaStreamSource(stream);
    const processor = ctx.createScriptProcessor(CHUNK_SIZE, 1, 1);
    const silentGain = ctx.createGain();
    silentGain.gain.value = 0;

    const chunkMs = (CHUNK_SIZE / ctx.sampleRate) * 1000;

    processor.onaudioprocess = (e: AudioProcessingEvent) => {
      const data = e.inputBuffer.getChannelData(0);
      const level = rms(data);
      levelRef.current = level;

      if (level > SPEECH_RMS_THRESHOLD) {
        speakingRef.current = true;
        silenceMsRef.current = 0;
        speechMsRef.current += chunkMs;
        bufferRef.current.push(new Float32Array(data));
      } else if (speakingRef.current) {
        silenceMsRef.current += chunkMs;
        bufferRef.current.push(new Float32Array(data));
        if (silenceMsRef.current >= SILENCE_HANG_MS) {
          finalizeUtterance();
        }
      }
    };

    source.connect(processor);
    processor.connect(silentGain);
    silentGain.connect(ctx.destination);
  }, [finalizeUtterance]);

  const startSession = useCallback(async () => {
    primeSpeech();
    setOpen(true);
    setNote(null);
    setPhase("loading");
    openRef.current = true;

    const worker = getWorker();

    worker.onmessage = (event: MessageEvent) => {
      const msg = event.data;
      if (msg.type === "progress") {
        const p = msg.progress;
        if (typeof p?.progress === "number") setLoadPct(Math.round(p.progress));
      } else if (msg.type === "ready") {
        modelReadyRef.current = true;
        setLoadPct(null);
        if (openRef.current) {
          startAudioGraph()
            .then(() => {
              if (openRef.current) setPhase("listening");
            })
            .catch((err: DOMException) => {
              if (err.name === "NotAllowedError") fail("mic access denied");
              else if (err.name === "NotFoundError") fail("no microphone found");
              else fail("could not start microphone");
            });
        }
      } else if (msg.type === "result") {
        classify(msg.text ?? "");
      } else if (msg.type === "error") {
        if (!modelReadyRef.current) {
          fail("voice model failed to load");
        } else {
          busyRef.current = false;
          setNote("transcription failed — keep talking");
          if (openRef.current) setPhase("listening");
        }
      }
    };

    if (!modelReadyRef.current) {
      worker.postMessage({ type: "load" });
    } else {
      try {
        await startAudioGraph();
        if (openRef.current) setPhase("listening");
      } catch (err) {
        const e = err as DOMException;
        if (e.name === "NotAllowedError") fail("mic access denied");
        else if (e.name === "NotFoundError") fail("no microphone found");
        else fail("could not start microphone");
      }
    }
  }, [classify, fail, getWorker, primeSpeech, startAudioGraph]);

  const toggle = () => {
    if (open) stopSession();
    else startSession();
  };

  useEffect(() => {
    return () => {
      openRef.current = false;
      window.speechSynthesis?.cancel();
      teardownAudio();
    };
  }, [teardownAudio]);

  if (!supported) return null;

  const label =
    phase === "loading"
      ? loadPct !== null
        ? `loading voice model... ${loadPct}%`
        : "loading voice model..."
      : phase === "thinking"
        ? "thinking..."
        : phase === "speaking"
          ? "speaking..."
          : (note ?? "listening...");

  return (
    <div className="fixed bottom-5 left-5 z-[130] flex flex-col items-start gap-2">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={open ? label : "closed"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="micro pl-0.5 text-[var(--fg-dim)]"
        >
          {open ? label : "voice nav"}
        </motion.span>
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={toggle}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        aria-label={open ? "Stop voice navigation" : "Start voice navigation"}
        aria-pressed={open}
        className="flex items-center justify-center rounded-full outline-none"
      >
        <SiriOrb
          active={open}
          phase={phase}
          levelRef={levelRef}
          outputLevelRef={outputLevelRef}
          size={56}
        />
      </motion.button>
    </div>
  );
}
