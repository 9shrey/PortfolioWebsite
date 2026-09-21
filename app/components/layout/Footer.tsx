"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const SOCIAL = [
  { href: "https://github.com/9shrey", label: "GitHub" },
  { href: "https://linkedin.com/in/9shrey", label: "LinkedIn" },
  { href: "mailto:9shrey@gmail.com", label: "Email" },
  { href: "/Shrey_Singh_Resume.pdf", label: "Resume" },
];

/** Local time in Bengaluru, rendered only after mount. Formatting a clock
 *  during SSR would produce server-time markup that never matches the client,
 *  which React reports as a hydration mismatch. */
function LocalTime() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const read = () =>
      setTime(
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "Asia/Kolkata",
        }).format(new Date())
      );

    read();
    const id = window.setInterval(read, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className="micro tabular-nums">
      Bengaluru{" "}
      <span className="!text-[var(--fg-dim)]">
        {/* Reserve the slot so the row doesn't reflow when the clock lands. */}
        {time ?? "—:—"} IST
      </span>
    </span>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-[var(--rule-soft)]">
      <div className="shell flex flex-col gap-8 py-12 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-3">
          <Link href="/" className="micro !text-[var(--fg)]">
            Shrey Singh
          </Link>
          <LocalTime />
        </div>

        <div className="flex flex-col items-start gap-4 md:items-end">
          <div className="flex flex-wrap gap-x-7 gap-y-2">
            {SOCIAL.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="micro transition-colors hover:!text-[var(--signal)]"
              >
                {s.label}
              </a>
            ))}
          </div>
          <p className="mono !text-[var(--fg-mute)]">
            Next.js · TypeScript · Tailwind · Motion — built by hand
          </p>
        </div>
      </div>
    </footer>
  );
}
