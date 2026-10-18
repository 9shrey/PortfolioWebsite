"use client";

import { useEffect, useRef, useState } from "react";
import { GPU } from "@/app/data/roofline";
import { projects } from "@/app/data/projects";
import { site } from "@/app/data/site";

/* The POST screen. Every line is a fact from the data files: the GPU and
   its measured bandwidth (roofline.ts), the test total (projects.ts). */

const tests = projects.reduce((n, p) => n + p.testCount, 0);

const LINES: [string, string?][] = [
  [`SHREY-OS BIOS v26.10   (c) ${site.name}, ${site.location}`],
  [""],
  ["CPU: " + site.title, "OK"],
  [`GPU: ${GPU.name} (TU117) · ${GPU.bandwidthGBs} GB/s`, "OK"],
  ["     tensor cores", "NONE"],
  [`TESTS: ${tests} PASSED`, "OK"],
  ["LOADING kernels... split-K v4", "OK"],
  [`MOUNTING /projects (${projects.length})`, "OK"],
  ["STARTING jev-voice", "OK"],
  [""],
  ["Booting desktop…"],
];

export default function Boot({ onDone }: { onDone: () => void }) {
  const [shown, setShown] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    const finish = () => {
      if (done.current) return;
      done.current = true;
      onDone();
    };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let i = 0;
    const id = window.setInterval(
      () => {
        i++;
        setShown(i);
        if (i >= LINES.length) {
          window.clearInterval(id);
          window.setTimeout(finish, reduced ? 200 : 650);
        }
      },
      reduced ? 30 : 190
    );
    const skip = (e: Event) => {
      if (e instanceof KeyboardEvent && ["Shift", "Control", "Alt", "Meta"].includes(e.key)) return;
      window.clearInterval(id);
      setShown(LINES.length);
      finish();
    };
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [onDone]);

  return (
    <div className="os-post" role="status" aria-live="polite" aria-label="SHREY-OS is booting">
      <pre>
        {LINES.slice(0, shown).map(([text, status], i) => (
          <span key={i} className="os-post-line">
            {status ? text.padEnd(46, ".") : text}
            {status && <b className={status === "OK" ? "ok" : "warn"}> {status}</b>}
            {"\n"}
          </span>
        ))}
        <span className="os-caret" aria-hidden>
          █
        </span>
      </pre>
      <p className="os-post-skip">Press any key to skip</p>
    </div>
  );
}
