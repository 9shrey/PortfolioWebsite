"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const VoiceMic = dynamic(() => import("../../layout/VoiceMic"), { ssr: false });

/** Jev, the voice agent, as an optional app: nothing listens until you ask. */
export default function Assistant() {
  const [on, setOn] = useState(false);
  return (
    <div className="os-pad">
      <h3>Jev</h3>
      <p>
        A voice agent for this machine. Say &quot;open inferbench&quot;, &quot;open the terminal&quot; or &quot;type
        neofetch&quot;.
      </p>
      <p className="os-links">
        {on ? (
          <button type="button" onClick={() => setOn(false)}>
            Stop Jev
          </button>
        ) : (
          <button type="button" onClick={() => setOn(true)}>
            Start Jev
          </button>
        )}
      </p>
      {on && <p className="os-dim">Jev is the orb at the bottom right. Click it and talk.</p>}
      {on && <VoiceMic />}
    </div>
  );
}
