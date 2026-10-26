"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { mode, useMode } from "../mode/mode";

type Item = {
  id: string;
  group: "Go to" | "Projects" | "Actions";
  label: string;
  hint?: string;
  keys?: string;
  run: () => void;
};

export type PaletteProject = { slug: string; name: string; area: string };

/** ⌘K / Ctrl+K (or "/") on the professional site: jump anywhere, copy the
 *  email, open the résumé, or boot SHREY-OS. */
export default function Palette({
  projects,
  email,
  resume,
  github,
  linkedin,
}: {
  projects: PaletteProject[];
  email: string;
  resume: string;
  github: string;
  linkedin: string;
}) {
  const m = useMode();
  const router = useRouter();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const back = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQ("");
    setSel(0);
    back.current?.focus?.();
  }, []);

  const go = useCallback(
    (id: string) => {
      if (path === "/") {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(history.state, "", `#${id}`);
      } else router.push(`/#${id}`);
    },
    [path, router]
  );

  const items = useMemo<Item[]>(() => {
    const sec = (id: string, label: string, hint: string): Item => ({
      id: `go-${id}`,
      group: "Go to",
      label,
      hint,
      run: () => go(id),
    });
    return [
      sec("exhibit", "Exhibit A: 87 → 451 tok/s", "The measured roofline"),
      sec("work", "Selected work", "Five projects with case studies"),
      sec("notes", "Things that lied to me", "Bugs and how I caught them"),
      sec("experience", "Experience", "Agneyas Labs, NetApp, Manipal, toolkit"),
      sec("faq", "Before you ask", "The honest answers"),
      sec("writing", "Writing", "Notes from the projects"),
      sec("contact", "Contact", "Email and links"),
      ...projects.map<Item>((p) => ({
        id: `p-${p.slug}`,
        group: "Projects",
        label: p.name,
        hint: p.area,
        run: () => router.push(`/work/${p.slug}`),
      })),
      {
        id: "copy",
        group: "Actions",
        label: "Copy email address",
        hint: email,
        run: async () => {
          try {
            await navigator.clipboard.writeText(email);
            setToast("Email copied");
          } catch {
            window.location.href = `mailto:${email}`;
          }
        },
      },
      { id: "cv", group: "Actions", label: "Open résumé (PDF)", run: () => window.open(resume, "_blank", "noopener") },
      { id: "print", group: "Actions", label: "Printable one-page CV", run: () => router.push("/cv") },
      { id: "gh", group: "Actions", label: "GitHub", hint: github.replace(/^https?:\/\//, ""), run: () => window.open(github, "_blank", "noopener") },
      { id: "li", group: "Actions", label: "LinkedIn", hint: linkedin.replace(/^https?:\/\//, ""), run: () => window.open(linkedin, "_blank", "noopener") },
      {
        id: "fun",
        group: "Actions",
        label: "Boot SHREY-OS",
        hint: "The fun version: terminal, games, cinema",
        run: () => mode.request("fun", { x: window.innerWidth / 2, y: window.innerHeight / 2 }),
      },
    ];
  }, [projects, email, resume, github, linkedin, go, router]);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((it) => `${it.label} ${it.hint ?? ""} ${it.group}`.toLowerCase().includes(s));
  }, [items, q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (mode.get() !== "pro") return;
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement)?.tagName ?? "");
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => {
          if (!o) back.current = document.activeElement as HTMLElement;
          return !o;
        });
      } else if (e.key === "/" && !typing && !open) {
        e.preventDefault();
        back.current = document.activeElement as HTMLElement;
        setOpen(true);
      }
    };
    const onOpen = () => {
      back.current = document.activeElement as HTMLElement;
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("palette:open", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("palette:open", onOpen);
    };
  }, [open]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => input.current?.focus());
  }, [open]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    list.current?.querySelector(`[data-i="${sel}"]`)?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  if (m !== "pro") return null;

  const pick = (it: Item) => {
    close();
    it.run();
  };

  let lastGroup = "";
  return (
    <>
      {open && (
        <div className="pal-scrim" onMouseDown={close}>
          <div
            className="pal"
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="pal-in">
              <span className="pal-glyph" aria-hidden>
                ›
              </span>
              <input
                ref={input}
                value={q}
                placeholder="Search projects, sections, actions…"
                aria-label="Search commands"
                aria-controls="pal-list"
                aria-activedescendant={shown[sel] ? `pal-${shown[sel].id}` : undefined}
                onChange={(e) => {
                  setQ(e.target.value);
                  setSel(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.preventDefault();
                    close();
                  } else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSel((s) => (shown.length ? (s + 1) % shown.length : 0));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSel((s) => (shown.length ? (s - 1 + shown.length) % shown.length : 0));
                  } else if (e.key === "Enter" && shown[sel]) {
                    e.preventDefault();
                    pick(shown[sel]);
                  }
                }}
              />
              <kbd className="pal-esc">esc</kbd>
            </div>
            <ul id="pal-list" ref={list} role="listbox" className="pal-list">
              {shown.length === 0 && <li className="pal-empty">Nothing matches “{q}”.</li>}
              {shown.map((it, i) => {
                const head = it.group !== lastGroup;
                lastGroup = it.group;
                return (
                  <li key={it.id} role="presentation">
                    {head && <p className="pal-group">{it.group}</p>}
                    <div
                      id={`pal-${it.id}`}
                      role="option"
                      aria-selected={i === sel}
                      data-i={i}
                      className="pal-item"
                      onMouseMove={() => setSel(i)}
                      onClick={() => pick(it)}
                    >
                      <span>{it.label}</span>
                      {it.hint && <span className="pal-hint">{it.hint}</span>}
                      <span className="pal-enter" aria-hidden>
                        ↵
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="pal-foot">
              <span>
                <kbd>↑</kbd>
                <kbd>↓</kbd> move
              </span>
              <span>
                <kbd>↵</kbd> open
              </span>
              <span>
                <kbd>/</kbd> anywhere
              </span>
            </p>
          </div>
        </div>
      )}
      <div className="pal-toast" role="status" aria-live="polite" data-on={toast ? "" : undefined}>
        {toast}
      </div>
    </>
  );
}
