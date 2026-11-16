"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import sampleFive from "../../../data/transcripts/20-facebook-5.json";
import sampleSix from "../../../data/transcripts/20-facebook-6.json";
import songSample from "../../../data/transcripts/ngai-he-hakka-nyin.json";
import alternateSongSample from "../../../data/transcripts/ngai-he-hakka-nyin-alt.json";
import styles from "./review.module.css";

type Status = "pending" | "approved" | "correction" | "unclear";
type Segment = {
  start: string;
  end: string;
  speaker?: string;
  language?: string;
  hakka_characters: string;
  hakka_romanization: string | null;
  english: string;
  dutch: string | null;
  notes?: string | null;
};
type Sample = { id: string; label: string; audio: string; segments: Segment[] };

const samples: Sample[] = [
  { id: "20-facebook-5", label: "20 Facebook 5", audio: "/audio/20-facebook-5.mp3", segments: sampleFive.segments as Segment[] },
  { id: "20-facebook-6", label: "20 Facebook 6", audio: "/audio/20-facebook-6.mp3", segments: sampleSix.segments as Segment[] },
  {
    id: "ngai-he-hakka-nyin",
    label: "Ngài He Hak-kâ-ngìn (song)",
    audio: "/audio/ngai-he-hakka-nyin.mp3",
    segments: songSample.segments.map((segment) => ({
      start: segment.start,
      end: segment.end,
      language: segment.language,
      hakka_characters: segment.characters,
      hakka_romanization: segment.romanization,
      english: segment.english,
      dutch: segment.dutch,
    })),
  },
  {
    id: "ngai-he-hakka-nyin-alt",
    label: "Ngài He Hak-kâ-ngìn (alternate)",
    audio: "/audio/ngai-he-hakka-nyin-alt.mp3",
    segments: alternateSongSample.segments.map((segment) => ({
      start: segment.start,
      end: segment.end,
      language: segment.language,
      hakka_characters: segment.characters,
      hakka_romanization: segment.romanization,
      english: segment.english,
      dutch: segment.dutch,
    })),
  },
];

function toSeconds(timestamp: string) {
  const [minutes, seconds] = timestamp.split(":").map(Number);
  return minutes * 60 + seconds;
}

export default function ReviewPage() {
  const [sampleId, setSampleId] = useState(samples[0].id);
  const [activeIndex, setActiveIndex] = useState(0);
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const audioRef = useRef<HTMLAudioElement>(null);
  const sample = samples.find((item) => item.id === sampleId) || samples[0];
  const activeSegment = sample.segments[activeIndex];
  const reviewedCount = sample.segments.filter((_, index) => statuses[`${sample.id}-${index}`] && statuses[`${sample.id}-${index}`] !== "pending").length;
  const progress = Math.round((reviewedCount / sample.segments.length) * 100);

  const selectSegment = (index: number) => {
    setActiveIndex(index);
    if (audioRef.current) {
      audioRef.current.currentTime = toSeconds(sample.segments[index].start);
      void audioRef.current.play();
    }
  };

  const seekToActiveSegment = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = toSeconds(activeSegment.start);
    }
  };

  const stopAtSegmentEnd = () => {
    if (audioRef.current && audioRef.current.currentTime >= toSeconds(activeSegment.end)) {
      audioRef.current.currentTime = toSeconds(activeSegment.end);
      audioRef.current.pause();
    }
  };

  const setStatus = (status: Status) => {
    setStatuses((current) => ({ ...current, [`${sample.id}-${activeIndex}`]: status }));
  };

  const status = statuses[`${sample.id}-${activeIndex}`] || "pending";
  const statusLabel = useMemo(() => ({
    pending: "Pending review",
    approved: "Approved",
    correction: "Needs correction",
    unclear: "Unclear audio",
  }[status]), [status]);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>← Hakka House</Link>
        <div>
          <div className={styles.eyebrow}>Dataset workspace</div>
          <h1>Review recordings</h1>
        </div>
        <div className={styles.progress}><strong>{progress}%</strong><span>reviewed</span></div>
      </header>

      <div className={styles.toolbar}>
        <label>Recording
          <select value={sampleId} onChange={(event) => { setSampleId(event.target.value); setActiveIndex(0); }}>
            {samples.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
        <span>{reviewedCount} of {sample.segments.length} segments reviewed</span>
      </div>

      <section className={styles.workspace}>
        <aside className={styles.segmentList} aria-label="Transcript segments">
          {sample.segments.map((segment, index) => {
            const segmentStatus = statuses[`${sample.id}-${index}`] || "pending";
            return (
              <button className={`${styles.segment} ${index === activeIndex ? styles.active : ""}`} key={`${segment.start}-${index}`} onClick={() => selectSegment(index)}>
                <span className={styles.segmentTop}><b>{segment.start}</b><i className={styles[segmentStatus]} /></span>
                <strong>{segment.hakka_characters}</strong>
                <small>{segment.language === "Cantonese" ? "Cantonese" : segment.english}</small>
              </button>
            );
          })}
        </aside>

        <section className={styles.detail}>
          <audio
            ref={audioRef}
            controls
            src={sample.audio}
            className={styles.audio}
            onLoadedMetadata={seekToActiveSegment}
            onTimeUpdate={stopAtSegmentEnd}
          />
          <div className={styles.segmentHeading}><span>{activeSegment.start} – {activeSegment.end}</span><b className={styles[status]}>{statusLabel}</b></div>
          <div className={styles.card}>
            <div className={styles.field}><label>Hakka characters <span>{activeSegment.language || "Hakka"}</span></label><p className={styles.characters}>{activeSegment.hakka_characters}</p></div>
            <div className={styles.field}><label>Romanization</label><p>{activeSegment.hakka_romanization || "Not provided"}</p></div>
            <div className={styles.field}><label>English</label><p>{activeSegment.english}</p></div>
            <div className={styles.field}><label>Dutch <span>Translated from English</span></label><p>{activeSegment.dutch || "Not available"}</p></div>
            {activeSegment.notes && <div className={styles.note}>Note: {activeSegment.notes}</div>}
          </div>
          <div className={styles.actions}>
            <button className={status === "approved" ? styles.selected : ""} onClick={() => setStatus("approved")}>✓ Approve</button>
            <button className={status === "correction" ? styles.selected : ""} onClick={() => setStatus("correction")}>✎ Needs correction</button>
            <button className={status === "unclear" ? styles.selected : ""} onClick={() => setStatus("unclear")}>? Unclear</button>
          </div>
          <div className={styles.navigation}>
            <button disabled={activeIndex === 0} onClick={() => selectSegment(activeIndex - 1)}>← Previous</button>
            <button disabled={activeIndex === sample.segments.length - 1} onClick={() => selectSegment(activeIndex + 1)}>Next →</button>
          </div>
        </section>
      </section>
    </main>
  );
}
