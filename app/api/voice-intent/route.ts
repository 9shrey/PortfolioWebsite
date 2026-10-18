import { NextResponse } from "next/server";

/* Jev's fallback: only transcripts the local matcher couldn't place reach
   this route, and it fronts a paid API, so it validates, caps, times out and
   rate-limits before spending anything. */

const TYPESAFE_URL = "https://api.typesafe.ai/v1/systemone";
const CONFIDENCE_THRESHOLD = 0.5;
const MAX_CHARS = 200;
const TIMEOUT_MS = 4000;
const LIMIT = { requests: 12, windowMs: 60_000 };

const ROUTES: Record<string, { route: string; say: string; criterion: string }> = {
  home: { route: "/", say: "Back to the start.", criterion: "landing page" },
  work: { route: "/#work", say: "Here's the work.", criterion: "projects / work / portfolio" },
  experience: { route: "/#experience", say: "Here's the experience.", criterion: "jobs / career / work history" },
  about: { route: "/#about", say: "A bit about me.", criterion: "about the person" },
  writing: { route: "/writing", say: "Here's the writing.", criterion: "blog / writing / notes / articles" },
  cv: { route: "/cv", say: "Here's the CV.", criterion: "CV / resume / qualifications" },
  now: { route: "/now", say: "Here's what I'm up to now.", criterion: "what they're doing at the moment" },
  contact: { route: "/#contact", say: "Let's get you in touch.", criterion: "get in touch / connect / email / hire" },
};

/* Best-effort per-instance limiter. Serverless instances don't share it,
   which is fine: it exists to stop one tab hammering the paid API, not to be
   a distributed quota. */
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < LIMIT.windowMs);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > LIMIT.requests;
}

interface ChoiceResponse {
  answers?: { intent?: { choice?: string; confidence?: number } };
}

export async function POST(req: Request) {
  let transcript: unknown;
  try {
    ({ transcript } = (await req.json()) as { transcript?: unknown });
  } catch {
    return NextResponse.json({ error: "body must be JSON" }, { status: 400 });
  }
  if (typeof transcript !== "string" || !transcript.trim()) {
    return NextResponse.json({ error: "missing transcript" }, { status: 400 });
  }
  if (transcript.length > MAX_CHARS) {
    return NextResponse.json({ error: `transcript over ${MAX_CHARS} chars` }, { status: 413 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) {
    return NextResponse.json({ error: "slow down" }, { status: 429, headers: { "Retry-After": "60" } });
  }

  const apiKey = process.env.TYPESAFE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "voice intent is not configured" }, { status: 503 });
  }

  let data: ChoiceResponse;
  try {
    const res = await fetch(TYPESAFE_URL, {
      method: "POST",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        state: transcript.trim(),
        model: "jev-latest",
        questions: {
          intent: {
            type: "choice",
            instructions: "Which page is the user asking to open?",
            criteria: {
              ...Object.fromEntries(Object.entries(ROUTES).map(([k, v]) => [k, v.criterion])),
              none: "not a navigation request",
            },
          },
        },
      }),
    });
    if (!res.ok) throw new Error(String(res.status));
    data = (await res.json()) as ChoiceResponse;
  } catch {
    return NextResponse.json({ error: "voice intent lookup failed" }, { status: 502 });
  }

  const choice = data.answers?.intent?.choice ?? "none";
  const confidence = data.answers?.intent?.confidence ?? 0;
  const hit = ROUTES[choice];
  if (!hit || confidence < CONFIDENCE_THRESHOLD) {
    return NextResponse.json({ choice, confidence, route: null });
  }
  return NextResponse.json({ choice, confidence, route: hit.route, say: hit.say });
}
