"use client";

import { useEffect, useState } from "react";

/** Local time in Bengaluru, ticking. Renders a placeholder on the server so
 *  hydration never disagrees about the second. */
export default function Clock() {
  const [t, setT] = useState<string | null>(null);
  useEffect(() => {
    const f = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const tick = () => setT(f.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return <span suppressHydrationWarning>{t ?? "--:--:--"} IST</span>;
}
