"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import SiriOrb from "./SiriOrb";
import { site } from "@/app/data/site";
import { clickByText, doScroll, matchLocalCommand } from "@/app/lib/voice/commands";

/* Jev, slimmed. Two speech engines, cheapest first:

   1. The browser's own SpeechRecognition, where it exists. No download.
   2. Whisper-tiny in a Web Worker (app/lib/whisperWorker.ts), only where (1)
      is missing, and only after the visitor agrees to a ~40 MB download.
      Audio never leaves the device on this path.

   Transcripts go to the local rule matcher first; only what it can't place
   is sent to /api/voice-intent. Desktop only: on phones the pill would sit
   on top of the content. */

type Phase = "loading" | "listening" | "thinking" | "speaking" | "routed" | "unclear" | "failed";
type Engine = "speech" | "whisper" | null;

type SR = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  onspeechstart: (() => void) | null;
};
type SRCtor = new () => SR;

const SAMPLE_RATE = 16000;
const CHUNK_SIZE = 4096;
const SPEECH_RMS_THRESHOLD = 0.012;
const SILENCE_HANG_MS = 700;
const MIN_UTTERANCE_MS = 400;

const noopSubscribe = () => () => {};

function speechCtor(): SRCtor | null {
  const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function detectEngine(): Engine {
  if (speechCtor()) return "speech";
  const audio =
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    Boolean(window.AudioContext || (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext);
  return audio && typeof Worker !== "undefined" ? "whisper" : null;
}

const concat = (chunks: Float32Array[]) => {
  const out = new Float32Array(chunks.reduce((n, c) => n + c.length, 0));
  let o = 0;
  for (const c of chunks) {
    out.set(c, o);
    o += c.length;
  }
  return out;
};

const rms = (c: Float32Array) => {
  let s = 0;
  for (let i = 0; i < c.length; i++) s += c[i] * c[i];
  return Math.sqrt(s / c.length);
};

export default function VoiceMic() {
  const router = useRouter();
  const engine = useSyncExternalStore(noopSubscribe, detectEngine, () => null);
  const [open, setOpen] = useState(false);
  const [consent, setConsent] = useState(false);
  const [phase, setPhase] = useState<Phase>("listening");
  const [note, setNote] = useState<string | null>(null);
  const [loadPct, setLoadPct] = useState<number | null>(null);

  const openRef = useRef(false);
  const busyRef = useRef(false);
  const lastSpokenRef = useRef("");
  const levelRef = useRef(0);
  const outputLevelRef = useRef(0);

  const recRef = useRef<SR | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const modelReadyRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const bufferRef = useRef<Float32Array[]>([]);
  const speakingRef = useRef(false);
  const silenceMsRef = useRef(0);
  const speechMsRef = useRef(0);

  const idle = useCallback(() => {
    busyRef.current = false;
    if (openRef.current) setPhase("listening");
  }, []);

  /* ------------------------------------------------------------ speech out */

  // Chrome drops the first speechSynthesis call unless primed in a gesture.
  const primeSpeech = useCallback(() => {
    try {
      const warm = new SpeechSynthesisUtterance(" ");
      warm.volume = 0;
      window.speechSynthesis?.speak(warm);
    } catch {}
  }, []);

  const speak = useCallback(
    (text: string) => {
      const synth = window.speechSynthesis;
      if (!synth || !text) return idle();
      lastSpokenRef.current = text;
      const queue = () => {
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 1.05;
        const en = synth.getVoices().find((v) => v.lang?.toLowerCase().startsWith("en"));
        if (en) u.voice = en;
        let raf = 0;
        let done = false;
        const pulse = () => {
          outputLevelRef.current = 0.15 + Math.abs(Math.sin(Date.now() / 90)) * 0.45;
          raf = requestAnimationFrame(pulse);
        };
        const finish = () => {
          if (done) return;
          done = true;
          cancelAnimationFrame(raf);
          outputLevelRef.current = 0;
          idle();
        };
        u.onstart = () => {
          setPhase("speaking");
          pulse();
        };
        u.onend = finish;
        u.onerror = finish;
        synth.speak(u);
        // Some browsers drop speak() without firing any event.
        window.setTimeout(finish, Math.max(1500, text.length * 90));
      };
      if (synth.speaking || synth.pending) {
        synth.cancel();
        window.setTimeout(queue, 40);
      } else queue();
    },
    [idle]
  );

  /* ------------------------------------------------------------ teardown */

  const teardown = useCallback(() => {
    recRef.current?.abort();
    recRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    bufferRef.current = [];
    speakingRef.current = false;
    levelRef.current = 0;
  }, []);

  /* ------------------------------------------------------------ intent */

  const classify = useCallback(
    async (transcript: string) => {
      const said = transcript.trim();
      if (!said) return idle();
      busyRef.current = true;
      setNote(`“${said}”`);

      const cmd = matchLocalCommand(said);
      if (cmd) {
        switch (cmd.type) {
          case "stop":
            openRef.current = false;
            setOpen(false);
            teardown();
            return speak("See you around.");
          case "silence":
            window.speechSynthesis?.cancel();
            return idle();
          case "scroll":
            doScroll(cmd.dir);
            return idle();
          case "history":
            if (cmd.dir === "back") router.back();
            else router.forward();
            return idle();
          case "repeat":
            return lastSpokenRef.current ? speak(lastSpokenRef.current) : idle();
          case "copyEmail":
            navigator.clipboard?.writeText(site.email).catch(() => {});
            setNote("email copied");
            return speak("Copied.");
          case "speakOnly":
            return speak(cmd.say);
          case "openResume":
            window.open(site.resume, "_blank", "noopener");
            return speak("Here's the resume.");
          case "toggleTerminal":
            window.dispatchEvent(new CustomEvent("jev:toggle-terminal", { detail: { open: cmd.open } }));
            return idle();
          case "runTerminal":
            window.dispatchEvent(new CustomEvent("jev:run-command", { detail: { text: cmd.text } }));
            return idle();
          case "navigate":
            setPhase("routed");
            router.push(cmd.route);
            return speak(cmd.say);
          case "openProject":
            setPhase("routed");
            router.push(`/work/${cmd.slug}`);
            return speak(`Here's ${cmd.title}.`);
          case "click":
            if (!clickByText(cmd.text)) {
              setNote(`couldn't find “${cmd.text}” here`);
              setPhase("unclear");
            }
            return idle();
        }
      }

      setPhase("thinking");
      try {
        const res = await fetch("/api/voice-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: said.slice(0, 200) }),
        });
        const data = (await res.json()) as { route?: string | null; say?: string };
        if (res.ok && data.route) {
          setPhase("routed");
          router.push(data.route);
          return speak(data.say ?? "On it.");
        }
        setNote("didn't catch that. Try “open inferbench”");
      } catch {
        setNote("voice lookup failed");
      }
      setPhase("unclear");
      idle();
    },
    [idle, router, speak, teardown]
  );

  const fail = useCallback(
    (msg: string) => {
      setPhase("failed");
      setNote(msg);
      openRef.current = false;
      teardown();
    },
    [teardown]
  );

  const stop = useCallback(() => {
    openRef.current = false;
    setOpen(false);
    setConsent(false);
    window.speechSynthesis?.cancel();
    teardown();
  }, [teardown]);

  useEffect(
    () => () => {
      openRef.current = false;
      window.speechSynthesis?.cancel();
      teardown();
      workerRef.current?.terminate();
    },
    [teardown]
  );

  /* ------------------------------------------------------------ engine 1 */

  const startSpeech = useCallback(() => {
    const Ctor = speechCtor();
    if (!Ctor) return fail("speech recognition unavailable");
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onspeechstart = () => {
      levelRef.current = 0.3;
    };
    rec.onresult = (e) => {
      levelRef.current = 0;
      const r = e.results[e.results.length - 1];
      if (r?.isFinal) classify(r[0]?.transcript ?? "");
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") fail("mic access denied");
      else if (e.error === "audio-capture") fail("no microphone found");
    };
    // One utterance per session; keep listening while the pill is open.
    rec.onend = () => {
      if (!openRef.current || recRef.current !== rec) return;
      const again = () => {
        if (!openRef.current || recRef.current !== rec) return;
        if (busyRef.current) return void window.setTimeout(again, 300);
        try {
          rec.start();
        } catch {}
      };
      window.setTimeout(again, 250);
    };
    recRef.current = rec;
    try {
      rec.start();
      setPhase("listening");
    } catch {
      fail("could not start listening");
    }
  }, [classify, fail]);

  /* ------------------------------------------------------------ engine 2 */

  const getWorker = useCallback(() => {
    workerRef.current ??= new Worker(new URL("../../lib/whisperWorker.ts", import.meta.url), { type: "module" });
    return workerRef.current;
  }, []);

  const finalizeUtterance = useCallback(() => {
    const chunks = bufferRef.current;
    const ms = speechMsRef.current;
    bufferRef.current = [];
    speakingRef.current = false;
    silenceMsRef.current = 0;
    speechMsRef.current = 0;
    if (ms < MIN_UTTERANCE_MS || busyRef.current || chunks.length === 0) return;
    busyRef.current = true;
    setPhase("thinking");
    const audio = concat(chunks);
    getWorker().postMessage({ type: "transcribe", audio }, [audio.buffer]);
  }, [getWorker]);

  const startAudioGraph = useCallback(
    (stream: MediaStream) => {
      const Ctor =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctor({ sampleRate: SAMPLE_RATE });
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const proc = ctx.createScriptProcessor(CHUNK_SIZE, 1, 1);
      const mute = ctx.createGain();
      mute.gain.value = 0;
      const chunkMs = (CHUNK_SIZE / ctx.sampleRate) * 1000;
      proc.onaudioprocess = (e) => {
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
          if (silenceMsRef.current >= SILENCE_HANG_MS) finalizeUtterance();
        }
      };
      source.connect(proc);
      proc.connect(mute);
      mute.connect(ctx.destination);
    },
    [finalizeUtterance]
  );

  const startWhisper = useCallback(async () => {
    setConsent(false);
    setPhase("loading");
    // Ask for the mic before spending 40 MB on a model that can't hear.
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      const name = (err as DOMException).name;
      return fail(name === "NotFoundError" ? "no microphone found" : "mic access denied");
    }
    if (!openRef.current) return stream.getTracks().forEach((t) => t.stop());
    streamRef.current = stream;

    const worker = getWorker();
    worker.onmessage = (event: MessageEvent) => {
      const msg = event.data;
      if (msg.type === "progress") {
        if (typeof msg.progress?.progress === "number") setLoadPct(Math.round(msg.progress.progress));
      } else if (msg.type === "ready") {
        modelReadyRef.current = true;
        setLoadPct(null);
        if (openRef.current && streamRef.current) {
          startAudioGraph(streamRef.current);
          setPhase("listening");
        }
      } else if (msg.type === "result") {
        classify(msg.text ?? "");
      } else if (msg.type === "error") {
        if (!modelReadyRef.current) fail("voice model failed to load");
        else {
          setNote("transcription failed. Keep talking");
          idle();
        }
      }
    };
    if (modelReadyRef.current) {
      startAudioGraph(stream);
      setPhase("listening");
    } else worker.postMessage({ type: "load" });
  }, [classify, fail, getWorker, idle, startAudioGraph]);

  /* ------------------------------------------------------------ toggle */

  const toggle = () => {
    if (open) return stop();
    primeSpeech();
    openRef.current = true;
    busyRef.current = false;
    setOpen(true);
    setNote(null);
    if (engine === "speech") startSpeech();
    else if (modelReadyRef.current) startWhisper();
    else setConsent(true);
  };

  if (!engine) return null;

  const status = consent
    ? "Uses a ~40 MB on-device speech model."
    : !open
      ? phase === "failed" && note
        ? note
        : "voice nav"
      : phase === "loading"
        ? loadPct !== null
          ? `loading voice model… ${loadPct}%`
          : "preparing…"
        : phase === "thinking"
          ? "thinking…"
          : phase === "speaking"
            ? "speaking…"
            : (note ?? "listening… try “open inferbench”");

  const expanded = open || consent || (phase === "failed" && Boolean(note));

  return (
    <div className="fixed bottom-[68px] right-5 z-[130] hidden md:block">
      <div
        className={`flex items-center gap-2 rounded-full border border-[var(--rule)] bg-[var(--bg-raise)]/90 p-1 shadow-lg backdrop-blur-md ${expanded ? "pl-4" : ""}`}
      >
        <span
          className={expanded ? "mono max-w-[22rem] truncate text-[var(--fg-dim)]" : "sr-only"}
          role="status"
          aria-live="polite"
        >
          {status}
        </span>
        {consent && (
          <>
            <button
              type="button"
              onClick={startWhisper}
              className="mono rounded-full bg-[var(--amber)] px-3 py-1 text-[#1a1206]"
            >
              Download
            </button>
            <button type="button" onClick={stop} className="mono rounded-full px-2 py-1 text-[var(--fg-dim)]">
              Cancel
            </button>
          </>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-label={open ? "Stop voice navigation" : "Start voice navigation"}
          title={open ? undefined : "Voice navigation: try “open inferbench”"}
          aria-pressed={open}
          className="flex shrink-0 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95"
        >
          <SiriOrb active={open} phase={phase} levelRef={levelRef} outputLevelRef={outputLevelRef} size={36} />
        </button>
      </div>
    </div>
  );
}
