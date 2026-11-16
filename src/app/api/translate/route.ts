import { NextResponse } from "next/server";
import { translateLocally, type Language } from "@/lib/translation";

const languages: Language[] = ["Hakka", "English", "Dutch"];

function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && languages.includes(value as Language);
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Request body must be an object." }, { status: 400 });
  }

  const { text, sourceLanguage, targetLanguage } = body as Record<string, unknown>;

  if (typeof text !== "string" || text.trim().length === 0 || text.length > 2000) {
    return NextResponse.json({ error: "Text must contain between 1 and 2,000 characters." }, { status: 400 });
  }

  if (!isLanguage(sourceLanguage) || !isLanguage(targetLanguage)) {
    return NextResponse.json({ error: "Unsupported source or target language." }, { status: 400 });
  }

  const result = translateLocally(text, sourceLanguage, targetLanguage);

  if (result.source === "unavailable") {
    return NextResponse.json(
      { error: "This phrase is not in the local Hakka phrasebook yet.", ...result },
      { status: 422 },
    );
  }

  return NextResponse.json(result);
}
