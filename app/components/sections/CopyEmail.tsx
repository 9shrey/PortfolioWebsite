"use client";

import { useState } from "react";

export default function CopyEmail({ email }: { email: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="copy"
      data-ui=""
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(email);
          setDone(true);
          window.setTimeout(() => setDone(false), 1600);
        } catch {}
      }}
    >
      {done ? "Copied" : "Copy"}
    </button>
  );
}
