"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { projects } from "@/app/data/projects";
import { posts } from "@/app/data/writing";

const ROUTES: Record<string, string> = {
  home: "/",
  work: "/work",
  experience: "/experience",
  about: "/about",
  now: "/now",
  writing: "/writing",
  contact: "/contact",
};

type Line = { type: "input" | "output"; text: string };

const BANNER = [
  "shrey@portfolio:~$ type 'help' to see what's here.",
];

export default function Terminal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>(() =>
    BANNER.map((text) => ({ type: "output" as const, text }))
  );
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (e.key === "`" && !isTyping) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const print = (text: string) =>
    setLines((prev) => [...prev, { type: "output", text }]);

  const run = (raw: string) => {
    const cmd = raw.trim();
    setLines((prev) => [...prev, { type: "input", text: cmd }]);
    if (!cmd) return;

    const [name, ...args] = cmd.split(/\s+/);
    const arg = args.join(" ").toLowerCase();

    switch (name.toLowerCase()) {
      case "help":
        print(
          "commands: help, whoami, ls, ls writing, cat <project>, open <page>, clear, exit"
        );
        break;
      case "whoami":
        print(
          "Shrey Singh — AI/ML engineer, Bengaluru. I build and ship ML systems."
        );
        break;
      case "ls":
        if (arg === "writing") {
          posts.forEach((p) => print(p.slug));
        } else {
          projects.forEach((p) => print(p.slug));
          print("(try: ls writing)");
        }
        break;
      case "cat": {
        const project = projects.find((p) => p.slug === arg);
        if (project) {
          print(project.title);
          print(project.blurb);
          print(`→ ${project.outcome}`);
          break;
        }
        const post = posts.find((p) => p.slug === arg);
        if (post) {
          print(post.title);
          print(post.excerpt);
          break;
        }
        print(`cat: ${arg || "(nothing)"}: no such project or note. try 'ls'.`);
        break;
      }
      case "open": {
        const route = ROUTES[arg];
        if (route) {
          print(`opening ${route}...`);
          router.push(route);
          setOpen(false);
        } else {
          print(`open: unknown page '${arg}'. try: ${Object.keys(ROUTES).join(", ")}`);
        }
        break;
      }
      case "clear":
        setLines([]);
        break;
      case "exit":
        setOpen(false);
        break;
      default:
        print(`command not found: ${name}. type 'help'.`);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="micro fixed bottom-5 right-5 z-[120] hidden items-center gap-2 rounded-full border border-[var(--rule)] bg-[var(--bg-2)]/90 px-4 py-2 backdrop-blur-md transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] md:flex"
        aria-label="Open terminal"
      >
        <span className="text-[var(--accent)]">$</span> press{" "}
        <kbd className="rounded border border-[var(--rule)] px-1.5 py-0.5 text-[10px]">
          `
        </kbd>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[150] flex items-end justify-center p-4 sm:items-center">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Terminal"
            className="relative z-10 flex h-[70vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[var(--rule)] bg-[#0a0a0b] shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-[var(--rule-soft)] px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
              <span className="micro ml-2 !text-[var(--fg-mute)]">
                shrey@portfolio — zsh
              </span>
            </div>

            <div
              ref={scrollRef}
              onClick={() => inputRef.current?.focus()}
              className="flex-1 overflow-y-auto px-4 py-4 font-mono text-[13px] leading-relaxed"
            >
              {lines.map((line, i) => (
                <div
                  key={i}
                  className={
                    line.type === "input"
                      ? "text-[var(--fg)]"
                      : "text-[var(--fg-dim)]"
                  }
                >
                  {line.type === "input" ? (
                    <span>
                      <span className="text-[var(--accent)]">$</span> {line.text}
                    </span>
                  ) : (
                    line.text
                  )}
                </div>
              ))}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  run(value);
                  setValue("");
                }}
                className="mt-1 flex items-center gap-2"
              >
                <span className="text-[var(--accent)]">$</span>
                <input
                  ref={inputRef}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  className="flex-1 bg-transparent text-[var(--fg)] outline-none"
                  aria-label="Terminal input"
                />
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
