"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { RoomContent } from "./types";

const noop = () => () => {};
const RoomApp = dynamic(() => import("./RoomApp"), { ssr: false });

/** Same test as the head script (script.ts), for arrivals by client-side navigation, where the head
 *  script doesn't run again. */
function capable() {
  if (/[?&]plain=1/.test(location.search)) return false;
  if (document.documentElement.classList.contains("room")) return true;
  try {
    const g = document.createElement("canvas").getContext("webgl2");
    if (!g) return false;
    if (/[?&]room=1/.test(location.search)) return true;
    const ext = g.getExtension("WEBGL_debug_renderer_info");
    const r = String(g.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : g.RENDERER) || "");
    return !/swiftshader|llvmpipe|softpipe|lavapipe|software|basic render/i.test(r);
  } catch {
    return false;
  }
}
let cached: boolean | null = null;

/** Mounts the 3D room when this browser can draw it well; otherwise leaves the plain page
 *  (rendered by the server underneath) on its own. html.room hides the plain page; the head script
 *  sets it before first paint on a full load, so the plain page never flashes. */
export default function RoomGate({ content }: { content: RoomContent }) {
  const ok = useSyncExternalStore(noop, () => (cached ??= capable()), () => false);
  const [failed, setFailed] = useState(false);
  const fail = useCallback(() => setFailed(true), []);
  const on = ok && !failed;
  useEffect(() => {
    const h = document.documentElement;
    h.classList.toggle("room", on);
    return () => h.classList.remove("room");   // leaving home: the printed pages need their paper back
  }, [on]);
  if (!on) return null;
  return <RoomApp content={content} onFail={fail} />;
}
