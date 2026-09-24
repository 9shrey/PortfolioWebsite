import { NextResponse } from "next/server";

const TYPESAFE_URL = "https://api.typesafe.ai/v1/systemone";
const CONFIDENCE_THRESHOLD = 0.5;

const ROUTES: Record<string, string> = {
  home: "/",
  work: "/work",
  experience: "/experience",
  about: "/about",
  now: "/now",
  writing: "/writing",
  contact: "/contact",
};

const SAY: Record<string, string> = {
  home: "Back to the start.",
  work: "Here's the work.",
  experience: "Pulling up the experience.",
  about: "Let me show you around.",
  now: "Here's what I'm up to now.",
  writing: "On to the writing.",
  contact: "Let's get you in touch.",
};

interface TypeSafeChoiceResponse {
  answers: {
    intent: {
      choice: string;
      confidence: number;
    };
  };
}

export async function POST(req: Request) {
  const { transcript } = (await req.json()) as { transcript?: string };

  if (!transcript || !transcript.trim()) {
    return NextResponse.json({ error: "missing transcript" }, { status: 400 });
  }

  const apiKey = process.env.TYPESAFE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "voice intent is not configured" },
      { status: 503 }
    );
  }

  const res = await fetch(TYPESAFE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      state: transcript,
      model: "jev-latest",
      questions: {
        intent: {
          type: "choice",
          instructions: "Which page is the user asking to open?",
          criteria: {
            home: "landing page",
            work: "projects / work section",
            experience: "work experience / resume",
            about: "about the person",
            now: "what they're currently doing",
            writing: "blog / writing",
            contact: "get in touch / connect / email",
            none: "not a navigation request",
          },
        },
      },
    }),
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "voice intent lookup failed" },
      { status: 502 }
    );
  }

  const data = (await res.json()) as TypeSafeChoiceResponse;
  const { choice, confidence } = data.answers.intent;
  const route = ROUTES[choice];

  if (!route || confidence < CONFIDENCE_THRESHOLD) {
    return NextResponse.json({ choice, confidence, route: null });
  }

  return NextResponse.json({ choice, confidence, route, say: SAY[choice] });
}
