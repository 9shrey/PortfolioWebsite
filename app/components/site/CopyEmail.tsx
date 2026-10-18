"use client";

import { useState } from "react";

export default function CopyEmail({ email }: { email: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn copy"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(email);
          setDone(true);
          window.setTimeout(() => setDone(false), 1600);
        } catch {}
      }}
    >
      <span aria-live="polite">{done ? "Copied" : "Copy email"}</span>
    </button>
  );
}
