import { NextResponse } from "next/server";
import { createHash } from "node:crypto";

/* The visitor count behind SHREY-OS's popcorn machine: one kernel per
   visitor. Stored in Upstash Redis (or Vercel KV, which is the same REST
   API) when its env vars are set; without them it answers count: null
   and the machine keeps its secret to itself.

   A visitor is a browser that hasn't been counted before (the client keeps
   a flag), and each IP can add at most one per day, so reloading or
   scripting it can't run the number up. The IP is only ever stored as a
   salted hash, with a 24h expiry. */

export const dynamic = "force-dynamic";

const URL_ = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = "portfolio:visitors";

async function redis(cmd: (string | number)[]): Promise<unknown> {
  const res = await fetch(URL_!, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
    cache: "no-store",
    signal: AbortSignal.timeout(3000),
  });
  if (!res.ok) throw new Error(`redis ${res.status}`);
  return ((await res.json()) as { result: unknown }).result;
}

// Not configured is a normal state (local dev, forks), not an error.
const off = () => NextResponse.json({ count: null, configured: false });

export async function GET() {
  if (!URL_ || !TOKEN) return off();
  try {
    return NextResponse.json({ count: Number((await redis(["GET", KEY])) ?? 0) });
  } catch {
    return NextResponse.json({ count: null }, { status: 502 });
  }
}

export async function POST(req: Request) {
  if (!URL_ || !TOKEN) return off();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const day = createHash("sha256").update(`${TOKEN.slice(0, 12)}:${ip}`).digest("hex").slice(0, 24);
  try {
    const fresh = (await redis(["SET", `portfolio:seen:${day}`, 1, "NX", "EX", 86400])) === "OK";
    const count = fresh ? await redis(["INCR", KEY]) : await redis(["GET", KEY]);
    return NextResponse.json({ count: Number(count ?? 0) });
  } catch {
    return NextResponse.json({ count: null }, { status: 502 });
  }
}
