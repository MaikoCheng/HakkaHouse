import phraseData from "../../data/phrases.json";

export type Language = "Hakka" | "English" | "Dutch";

export type TranslationResult = {
  translation: string;
  source: "local-phrasebook" | "unavailable";
  confidence: "high" | "none";
};

type Phrase = {
  source: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  translation: string;
};

const phrases = phraseData as Phrase[];

function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export function translateLocally(
  text: string,
  sourceLanguage: Language,
  targetLanguage: Language,
): TranslationResult {
  if (sourceLanguage === targetLanguage) {
    return { translation: text.trim(), source: "local-phrasebook", confidence: "high" };
  }

  const phrase = phrases.find(
    (item) =>
      item.sourceLanguage === sourceLanguage &&
      item.targetLanguage === targetLanguage &&
      normalize(item.source) === normalize(text),
  );

  if (!phrase) {
    return { translation: "", source: "unavailable", confidence: "none" };
  }

  return { translation: phrase.translation, source: "local-phrasebook", confidence: "high" };
}
