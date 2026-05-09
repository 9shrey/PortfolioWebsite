"use client";

import { Pause, Play, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import GlassCard from "./GlassCard";
import Reveal from "./Reveal";

const transcript =
  "Hi, I\u2019m Shrey Singh, an AI/ML engineer based in India. I\u2019ve worked on production ML systems at NetApp, including revenue forecasting pipelines, sales commission forecasting, and deal-scoring workflows. I like building practical AI products \u2014 things like AI waiters, RAG assistants, workflow automation agents, and tools that connect LLMs with real APIs. I\u2019m especially interested in machine learning systems, GenAI applications, and agentic products that solve real business problems. You can explore my work below, and if something looks interesting, feel free to reach out.";

const DEFAULT_PLAYBACK_RATE = 1.5;

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function VoiceIntro() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.defaultPlaybackRate = DEFAULT_PLAYBACK_RATE;
    audio.playbackRate = DEFAULT_PLAYBACK_RATE;

    const handleLoaded = () => setDuration(audio.duration || 0);
    const handleTime = () => setCurrentTime(audio.currentTime || 0);
    const handleEnded = () => setIsPlaying(false);
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("durationchange", handleLoaded);
    audio.addEventListener("timeupdate", handleTime);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);

    if (audio.readyState >= 1) {
      handleLoaded();
      handleTime();
    }

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("durationchange", handleLoaded);
      audio.removeEventListener("timeupdate", handleTime);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
    };
  }, []);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      await audio.play();
    } else {
      audio.pause();
    }
  };

  const handleSeek = (value: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    const next = Number(value);
    audio.currentTime = next;
    setCurrentTime(next);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <section aria-labelledby="voice-intro-title" className="pb-8 md:pb-12">
      <div className="container-shell">
        <Reveal>
          <GlassCard className="voice-card p-5 md:p-7">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div className="min-w-0">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white/55 text-[var(--accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                    <Volume2 size={20} strokeWidth={1.9} aria-hidden />
                  </div>
                  <div>
                    <p className="micro">Optional listen</p>
                    <h2 id="voice-intro-title" className="text-2xl font-semibold tracking-tight text-[var(--fg)]">
                      Voice Intro
                    </h2>
                  </div>
                </div>
                <p className="max-w-2xl text-sm leading-7 text-[var(--fg-dim)] md:text-base">
                  A quick 45-second introduction to who I am and what I build.
                </p>
                <span className="mt-3 inline-flex rounded-full border border-white/60 bg-white/35 px-3 py-1 text-xs font-bold text-[var(--fg-mute)] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
                  Plays at 1.5x
                </span>
              </div>

              <button
                type="button"
                onClick={togglePlayback}
                className="voice-play-button"
                aria-label={isPlaying ? "Pause voice introduction" : "Play voice introduction"}
                aria-pressed={isPlaying}
              >
                {isPlaying ? (
                  <Pause size={22} fill="currentColor" aria-hidden />
                ) : (
                  <Play size={22} fill="currentColor" aria-hidden />
                )}
                <span>{isPlaying ? "Pause" : "Play"}</span>
              </button>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold tabular-nums text-[var(--fg-mute)]">
                <span aria-label={`Elapsed time ${formatTime(currentTime)}`}>{formatTime(currentTime)}</span>
                <span aria-label={`Duration ${formatTime(duration)}`}>{formatTime(duration)}</span>
              </div>
              <div className="voice-progress-shell">
                <div className="voice-progress-fill" style={{ width: `${progress}%` }} aria-hidden />
                <input
                  className="voice-progress-input"
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.1"
                  value={Math.min(currentTime, duration || currentTime)}
                  onChange={(event) => handleSeek(event.target.value)}
                  aria-label="Seek voice introduction"
                />
              </div>
            </div>

            <details className="voice-transcript mt-5">
              <summary>Transcript</summary>
              <p>{transcript}</p>
            </details>

            <audio ref={audioRef} preload="metadata" src="/audio/intro-voice.mp3" />
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}
