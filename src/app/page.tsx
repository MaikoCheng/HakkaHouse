"use client";

import { useState } from "react";
import styles from "./page.module.css";

type Mode = "Text" | "Voice" | "Live" | "Photo";
type Language = "Hakka" | "English" | "Dutch";

const learningCards = [
  {
    hakka: "來做朋友",
    romanization: "Lòi cho phèn-yû",
    english: "Let's be friends",
    dutch: "Laten we vrienden worden",
  },
  {
    hakka: "你歡喜，𠊎又歡喜",
    romanization: "Ngì fôn-hí, ngài yu fôn-hí",
    english: "When you're happy, I'm happy too",
    dutch: "Als jij blij bent, ben ik ook blij",
  },
  {
    hakka: "多謝你",
    romanization: "Tô-chhia ngì",
    english: "Thank you very much",
    dutch: "Hartelijk dank",
  },
  {
    hakka: "冇高冇低",
    romanization: "Mò kô mò tâi",
    english: "No higher or lower — all equals",
    dutch: "Niet hoger of lager — allemaal gelijk",
  },
  {
    hakka: "來大家傾偈",
    romanization: "Lòi thai-kâ khîn-kâi",
    english: "Come, let's all chat",
    dutch: "Kom, laten we gezellig praten",
  },
  {
    hakka: "客家妹，人見人愛",
    romanization: "Hak-kâ-moi, ngìn-kien-ngìn-oi",
    english: "Hakka girls are loved by everyone",
    dutch: "Hakka-meisjes zijn geliefd bij iedereen",
  },
  {
    hakka: "恭喜發財",
    romanization: "Kiûng-hí fat-chhòi",
    english: "Wishing you happiness and prosperity",
    dutch: "Geluk en voorspoed gewenst",
  },
  {
    hakka: "狗吠",
    romanization: "Kéu phoi",
    english: "Dog barking",
    dutch: "Blaffende hond",
  },
];

const modes: { name: Mode; icon: string }[] = [
  { name: "Text", icon: "Aa" },
  { name: "Voice", icon: "◉" },
  { name: "Live", icon: "◌" },
  { name: "Photo", icon: "▧" },
];

function ArrowIcon() {
  return <span aria-hidden="true" className={styles.arrow}>↔</span>;
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("Text");
  const [from, setFrom] = useState<Language>("English");
  const [to, setTo] = useState<Language>("Hakka");
  const [text, setText] = useState("Good morning, how are you today?");
  const [translated, setTranslated] = useState("Ngí zǎo, ngi an-voi he?");
  const [copied, setCopied] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState("");
  const [visibleCards, setVisibleCards] = useState(() => learningCards.slice(0, 3));
  const [flippedCards, setFlippedCards] = useState<number[]>([]);

  const swapLanguages = () => {
    setFrom(to);
    setTo(from);
    setText(translated);
    setTranslated(text);
  };

  const translate = async () => {
    setIsTranslating(true);
    setError("");

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, sourceLanguage: from, targetLanguage: to }),
      });
      const result = await response.json() as { translation?: string; error?: string };

      if (!response.ok || !result.translation) {
        throw new Error(result.error || "Translation failed.");
      }

      setTranslated(result.translation);
    } catch (translationError) {
      setError(translationError instanceof Error ? translationError.message : "Translation failed.");
    } finally {
      setIsTranslating(false);
    }
  };

  const copyTranslation = async () => {
    await navigator.clipboard?.writeText(translated);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const toggleCard = (index: number) => {
    setFlippedCards((current) =>
      current.includes(index) ? current.filter((card) => card !== index) : [...current, index],
    );
  };

  const showNewSet = () => {
    const shuffled = [...learningCards].sort(() => Math.random() - 0.5);
    setVisibleCards(shuffled.slice(0, 3));
    setFlippedCards([]);
  };

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <a className={styles.brand} href="#" aria-label="Hakka House home">
          <span className={styles.brandMark}>客</span>
          <span>HAKKA <b>HOUSE</b></span>
        </a>
        <nav className={styles.nav} aria-label="Main navigation">
          <a className={styles.activeNav} href="#translate">Translate</a>
          <a href="#learn">Learn</a>
          <a href="/review">Review</a>
          <a href="#about">About</a>
        </nav>
        <button className={styles.helpButton} aria-label="Open help">?</button>
      </header>

      <section className={styles.hero} id="translate">
        <div className={styles.eyebrow}>A bridge between generations</div>
        <h1>Keep the words<br /><em>alive.</em></h1>
        <p>Translate Hakka with care, context, and a little help from home.</p>
      </section>

      <section className={styles.translator} aria-label="Translation workspace">
        <div className={styles.modeTabs} role="tablist" aria-label="Translation mode">
          {modes.map((item) => (
            <button
              key={item.name}
              className={mode === item.name ? styles.selectedMode : ""}
              onClick={() => setMode(item.name)}
              role="tab"
              aria-selected={mode === item.name}
            >
              <span className={styles.modeIcon}>{item.icon}</span>{item.name}
            </button>
          ))}
        </div>

        <div className={styles.languageBar}>
          <label>
            <span>From</span>
            <select value={from} onChange={(event) => setFrom(event.target.value as Language)}>
              <option>English</option><option>Dutch</option><option>Hakka</option>
            </select>
          </label>
          <button className={styles.swap} onClick={swapLanguages} aria-label="Swap languages"><ArrowIcon /></button>
          <label>
            <span>To</span>
            <select value={to} onChange={(event) => setTo(event.target.value as Language)}>
              <option>Hakka</option><option>English</option><option>Dutch</option>
            </select>
          </label>
          <span className={styles.beta}>Hakka beta</span>
        </div>

        <div className={styles.panels}>
          <div className={styles.inputPanel}>
            <div className={styles.panelLabel}>Your words</div>
            {mode === "Photo" ? (
              <div className={styles.dropzone}>
                <span className={styles.uploadIcon}>↑</span>
                <strong>Drop a photo here</strong>
                <small>or choose from your device</small>
                <button>Choose photo</button>
              </div>
            ) : mode === "Voice" || mode === "Live" ? (
              <div className={styles.voiceState}>
                <span className={styles.pulse}>{mode === "Live" ? "●" : "◉"}</span>
                <strong>{mode === "Live" ? "Ready for live translation" : "Tap to speak in Hakka"}</strong>
                <small>{mode === "Live" ? "Your words will appear as you speak" : "We&apos;ll transcribe your voice into text"}</small>
              </div>
            ) : (
              <textarea value={text} onChange={(event) => setText(event.target.value)} aria-label="Text to translate" />
            )}
            <div className={styles.inputFooter}>
              <span>{mode === "Text" ? `${text.length} / 2,000` : mode === "Photo" ? "JPG, PNG up to 10MB" : "Audio is processed securely"}</span>
              <button className={styles.micButton} aria-label="Use microphone">◉</button>
            </div>
          </div>
          <div className={styles.outputPanel}>
            <div className={styles.panelLabel}>Hakka translation <span>客家話</span></div>
            <div className={styles.outputText}>{translated}</div>
            <div className={styles.outputMeta}>
              <span>Romanized · Hakka</span>
              <button onClick={copyTranslation}>{copied ? "Copied!" : "Copy"} <span>⧉</span></button>
            </div>
          </div>
        </div>
        <button className={styles.translateButton} onClick={translate} disabled={isTranslating || mode !== "Text"}>
          {isTranslating ? "Translating..." : mode === "Photo" ? "Translate photo" : mode === "Voice" ? "Translate recording" : mode === "Live" ? "Start live translation" : "Translate"}
          <span>→</span>
        </button>
        {error && <div className={styles.error} role="alert">{error}</div>}
        <div className={styles.note}><span>✦</span> Translations improve as we learn from our community.</div>
      </section>

      <section className={styles.story} id="about">
        <div className={styles.storyImage}><span>客家</span></div>
        <div className={styles.storyCopy}>
          <div className={styles.eyebrow}>Our living archive</div>
          <h2>Every voice<br />has a <em>story.</em></h2>
          <p>We&apos;re building a better Hakka translator from the words, stories, and wisdom shared by our community.</p>
          <a href="#learn" className={styles.textLink}>Explore the archive <span>→</span></a>
        </div>
      </section>

      <section className={styles.learn} id="learn" aria-labelledby="learn-title">
        <div className={styles.learnIntro}>
          <div className={styles.eyebrow}>A little every day</div>
          <h2 id="learn-title">Learn a few<br /><em>words.</em></h2>
          <p>Tap a card to turn it over. Start with phrases that bring people together.</p>
          <button className={styles.newSetButton} onClick={showNewSet}>New set <span>↻</span></button>
        </div>
        <div className={styles.cards} aria-label="Hakka example cards">
          {visibleCards.map((card, index) => {
            const isFlipped = flippedCards.includes(index);
            return (
              <button
                className={`${styles.card} ${isFlipped ? styles.flipped : ""}`}
                key={card.hakka}
                onClick={() => toggleCard(index)}
                aria-label={`${isFlipped ? "Show Hakka" : "Show translation"} for ${card.english}`}
                aria-pressed={isFlipped}
              >
                <span className={styles.cardInner}>
                  <span className={styles.cardFace}>
                    <span className={styles.cardNumber}>0{index + 1}</span>
                    <strong>{card.hakka}</strong>
                    <small>{card.romanization}</small>
                    <span className={styles.cardHint}>Tap to reveal <b>↗</b></span>
                  </span>
                  <span className={`${styles.cardFace} ${styles.cardBack}`}>
                    <span className={styles.cardNumber}>0{index + 1}</span>
                    <strong>{card.english}</strong>
                    <small>{card.dutch}</small>
                    <span className={styles.cardHint}>Tap to return <b>↗</b></span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <footer className={styles.footer}><span>Made with care for the Hakka community.</span><span>© 2025 Hakka House</span></footer>
    </main>
  );
}
