"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { APPS, openApp, type AppProps } from "./index";
import { wm } from "../wm";
import { unlock, unlocked, ACHIEVEMENTS } from "../achievements";
import { mode } from "../../mode/mode";
import { GPU, HEADLINE, RIDGE } from "@/app/data/roofline";
import { projects } from "@/app/data/projects";
import { site } from "@/app/data/site";

/* The shell. Every stat it prints comes from the data files; where a real
   tool would show a value we never measured, it says N/A. */

type Line = { kind: "in" | "out" | "err"; text: string };

const tests = projects.reduce((n, p) => n + p.testCount, 0);

const LOGO = String.raw`   _____ __  __ ____  ______ __  __
  / ___// / / // __ \/ ____/ \ \/ /
  \__ \/ /_/ // /_/ / __/     \  /
 ___/ / __  // _, _/ /___     / /
/____/_/ /_//_/ |_/_____/    /_/   OS`;

const ALIASES: Record<string, string> = {
  term: "terminal",
  shell: "terminal",
  work: "projects",
  explorer: "projects",
  files: "projects",
  bio: "about",
  "about.exe": "about",
  xp: "experience",
  "experience.log": "experience",
  log: "experience",
  blog: "writing",
  notes: "writing",
  games: "arcade",
  snake: "arcade",
  movies: "cinema",
  email: "mail",
  contact: "mail",
  cv: "resume",
  "resume.pdf": "resume",
  jev: "assistant",
  voice: "assistant",
  bin: "trash",
};

function neofetch(start: number): string[] {
  const mins = Math.max(0, Math.round((Date.now() - start) / 60000));
  const info = [
    `${site.name.toLowerCase().replace(" ", "")}@shrey-os`,
    "------------------",
    `OS: SHREY-OS 26.10`,
    `Host: ${site.name}`,
    `Role: ${site.title}`,
    `Location: ${site.location}`,
    `Kernel: triton split-K v4`,
    `GPU: ${GPU.name} (TU117)`,
    `Tensor cores: none`,
    `Memory roof: ${GPU.bandwidthGBs} GB/s`,
    `Compute roof: ${GPU.computeGFLOPs} GFLOP/s`,
    `Projects: ${projects.length}`,
    `Tests: ${tests}`,
    `Shell: jev-voice`,
    `Uptime: ${mins} min`,
  ];
  const logo = LOGO.split("\n");
  const rows = Math.max(logo.length, info.length);
  return Array.from({ length: rows }, (_, i) => `${(logo[i] ?? "").padEnd(38)}${info[i] ?? ""}`);
}

function top(): string[] {
  const rows = [...projects].sort((a, b) => b.testCount - a.testCount);
  return [
    `Tasks: ${projects.length} total · tests: ${tests} passing`,
    "",
    "PID   COMMAND            TESTS  AREA",
    ...rows.map((p, i) => `${String(1000 + i * 7).padEnd(6)}${p.slug.slice(0, 18).padEnd(19)}${String(p.testCount).padStart(5)}  ${p.area}`),
    "",
    "(TESTS is the project's own pytest count; 0 = a product, not a library)",
  ];
}

function nvidiaSmi(): string[] {
  const bar = "+-----------------------------------------------------------------+";
  return [
    bar,
    "| NVIDIA-SMI (shrey-os)        what was actually measured            |",
    bar,
    `| GPU  Name              | ${GPU.name.padEnd(39)}|`,
    `| Die                    | ${GPU.die.padEnd(39)}|`,
    `| Memory bandwidth       | ${`${GPU.bandwidthGBs} GB/s (256 MB fp16 copy, p50 of 30)`.padEnd(39)}|`,
    `| FP32 compute           | ${`${GPU.computeGFLOPs} GFLOP/s (2048³ matmul, p50)`.padEnd(39)}|`,
    `| Ridge point            | ${`${RIDGE.toFixed(1)} FLOP/byte`.padEnd(39)}|`,
    `| Temp / Power / Fan     | ${"N/A (not part of the claim)".padEnd(39)}|`,
    bar,
    "| Processes:                                                      |",
    `|  inferbench  split-K v4  ${`${HEADLINE.kernelSpeedup}× kernel · ${HEADLINE.e2eSpeedup}× e2e · ${HEADLINE.tokBefore}→${HEADLINE.tokAfter} tok/s`.padEnd(39)}|`,
    bar,
  ];
}

export default function Terminal({ winId }: AppProps) {
  const [lines, setLines] = useState<Line[]>([{ kind: "out", text: "SHREY-OS shell. Type 'help'." }]);
  const [value, setValue] = useState("");
  const history = useRef<string[]>([]);
  const hi = useRef(-1);
  const input = useRef<HTMLInputElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const [start] = useState(() => Date.now());

  useEffect(() => {
    const el = scroll.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  useEffect(() => {
    input.current?.focus();
  }, []);

  const run = useCallback(
    (raw: string) => {
      const cmd = raw.trim();
      const out: Line[] = [{ kind: "in", text: cmd }];
      const say = (...t: string[]) => t.forEach((text) => out.push({ kind: "out", text }));
      const err = (text: string) => out.push({ kind: "err", text });
      if (cmd) {
        history.current.unshift(cmd);
        hi.current = -1;
      }
      const [name = "", ...rest] = cmd.split(/\s+/);
      const arg = rest.join(" ").toLowerCase();

      switch (name.toLowerCase()) {
        case "":
          break;
        case "help":
          say(
            "help              this list",
            "whoami            who runs this machine",
            "ls                list projects",
            "cat <project>     a project's summary",
            "open <app>        open an app (ls /apps)",
            "neofetch          system info",
            "top               projects, by test count",
            "nvidia-smi        the GPU behind Inferbench",
            "achievements      what you've unlocked",
            "sudo hire-me      ;)",
            "pro               back to the professional site",
            "clear · exit"
          );
          break;
        case "whoami":
          say(`${site.name}, ${site.title.toLowerCase()}, ${site.location}.`, site.tagline);
          break;
        case "ls":
          if (arg === "/apps" || arg === "apps")
            say(...Object.entries(APPS).filter(([, a]) => a.listed).map(([id, a]) => `${id.padEnd(12)}${a.title}`));
          else say(...projects.map((p) => `${p.slug}/`), "", "(cat <name> to read one, open projects to browse)");
          break;
        case "cat": {
          const p = projects.find((x) => x.slug === arg || x.slug.startsWith(arg) || x.shortTitle.toLowerCase() === arg);
          if (!p) {
            err(`cat: ${arg || "(nothing)"}: no such project. try 'ls'.`);
            break;
          }
          say(p.title, "", `problem   ${p.tldr.problem}`, `approach  ${p.tldr.approach}`, `result    ${p.tldr.result}`, "", `→ ${p.headline.map((m) => `${m.value} ${m.label}`).join(" · ")}`);
          if (p.github) say(`→ ${p.github}`);
          break;
        }
        case "open":
        case "start": {
          const p = projects.find((x) => x.slug === arg || x.shortTitle.toLowerCase() === arg);
          const id = ALIASES[arg] ?? arg;
          if (p) {
            openApp("case", p.slug);
            say(`opening ${p.slug}.case`);
          } else if (APPS[id]?.listed) {
            openApp(id);
            say(`opening ${APPS[id].title}`);
          } else err(`open: '${arg}': no such app. try 'ls /apps'.`);
          break;
        }
        case "neofetch":
          say(...neofetch(start));
          break;
        case "top":
        case "htop":
          say(...top());
          break;
        case "nvidia-smi":
          say(...nvidiaSmi());
          break;
        case "achievements": {
          const have = unlocked();
          say(...Object.entries(ACHIEVEMENTS).map(([id, a]) => `${have.includes(id as keyof typeof ACHIEVEMENTS) ? "[x]" : "[ ]"} ${a.title.padEnd(14)} ${a.desc}`));
          break;
        }
        case "sudo":
          if (arg === "hire-me" || arg === "hire me") {
            say("[sudo] password for recruiter: ********", "access granted. opening Mail…");
            unlock("hire-me");
            window.setTimeout(() => openApp("mail"), 500);
          } else err(`sudo: ${arg || "(nothing)"}: nice try.`);
          break;
        case "pro":
        case "exit-os":
          say("switching to professional mode…");
          window.setTimeout(() => mode.request("pro"), 300);
          break;
        case "clear":
          setLines([]);
          return;
        case "exit":
          wm.close(winId);
          return;
        case "rm":
          err("rm: permission denied. (check the Trash instead)");
          break;
        default:
          err(`command not found: ${name}. type 'help'.`);
      }
      setLines((prev) => [...prev, ...out]);
    },
    [start, winId]
  );

  // Jev can type into the shell.
  useEffect(() => {
    const onRun = (e: Event) => {
      const text = (e as CustomEvent<{ text: string }>).detail?.text;
      if (text) run(text);
    };
    window.addEventListener("os:term-run", onRun);
    return () => window.removeEventListener("os:term-run", onRun);
  }, [run]);

  return (
    <div className="os-term" ref={scroll} onClick={() => input.current?.focus()}>
      {lines.map((l, i) => (
        <pre key={i} className={`os-term-${l.kind}`}>
          {l.kind === "in" ? (
            <>
              <span className="os-prompt">shrey@os:~$</span> {l.text}
            </>
          ) : (
            l.text
          )}
        </pre>
      ))}
      <form
        className="os-term-form"
        onSubmit={(e) => {
          e.preventDefault();
          run(value);
          setValue("");
        }}
      >
        <label htmlFor={`${winId}-in`} className="os-prompt">
          shrey@os:~$
        </label>
        <input
          id={`${winId}-in`}
          ref={input}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              e.preventDefault();
              const h = history.current;
              hi.current = Math.max(-1, Math.min(h.length - 1, hi.current + (e.key === "ArrowUp" ? 1 : -1)));
              setValue(hi.current < 0 ? "" : h[hi.current]);
            }
          }}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Command"
        />
      </form>
    </div>
  );
}
