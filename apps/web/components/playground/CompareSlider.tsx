'use client';

import { useEffect, useRef, useState, type PointerEvent, type KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';
import { clampPercent, INTRO_KEYFRAMES } from '@/lib/compare-slider';

interface Props {
  beforeSrc: string;
  afterSrc: string | null;
  loading: boolean;
  beforeLabel: string;
  afterLabel: string;
  loadingLabel: string;
}

export function CompareSlider({
  beforeSrc,
  afterSrc,
  loading,
  beforeLabel,
  afterLabel,
  loadingLabel,
}: Props) {
  const t = useTranslations("common.a11y");
  const [position, setPosition] = useState(50);
  const [intro, setIntro] = useState(false);
  const [draggingNow, setDraggingNow] = useState(false);
  const [afterLoaded, setAfterLoaded] = useState(false);
  const introCancelled = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset load-tracking and intro-cancel flag whenever afterSrc disappears,
  // so the next output gets a fresh intro animation gated on its real load.
  useEffect(() => {
    if (!afterSrc) {
      setAfterLoaded(false);
      introCancelled.current = false;
    }
  }, [afterSrc]);

  // Intro animation: run once after each afterSrc load (until the user drags).
  useEffect(() => {
    if (!afterSrc || !afterLoaded) return;
    if (introCancelled.current) return;
    setIntro(true);
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;
    for (const frame of INTRO_KEYFRAMES) {
      elapsed += frame.delayMs;
      timers.push(
        setTimeout(() => {
          if (cancelled || introCancelled.current) return;
          setPosition(frame.position);
        }, elapsed),
      );
    }
    timers.push(
      setTimeout(() => {
        if (!cancelled) setIntro(false);
      }, elapsed + 50),
    );
    return () => {
      cancelled = true;
      for (const t of timers) clearTimeout(t);
    };
  }, [afterSrc, afterLoaded]);

  function updateFromClientX(clientX: number) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(clampPercent(pct));
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    introCancelled.current = true;
    setIntro(false);
    setDraggingNow(true);
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!draggingNow) return;
    updateFromClientX(e.clientX);
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    setDraggingNow(false);
    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
  }

  function onHandleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'ArrowLeft') {
      setPosition((p) => clampPercent(p - 5));
      e.preventDefault();
    } else if (e.key === 'ArrowRight') {
      setPosition((p) => clampPercent(p + 5));
      e.preventDefault();
    } else if (e.key === 'Home') {
      setPosition(0);
      e.preventDefault();
    } else if (e.key === 'End') {
      setPosition(100);
      e.preventDefault();
    }
  }

  const transitionClass = intro && !draggingNow ? 'transition-[clip-path,left] duration-500 ease-in-out' : '';

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-xl border bg-gray-50 overflow-hidden select-none touch-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Before image (full) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={beforeSrc}
        alt={beforeLabel}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        draggable={false}
      />

      {/* After image (clipped) */}
      {afterSrc && (
        <div
          className={`absolute inset-0 ${transitionClass}`}
          style={{ clipPath: `inset(0 0 0 ${position}%)` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={afterSrc}
            alt={afterLabel}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            draggable={false}
            onLoad={() => setAfterLoaded(true)}
          />
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm pointer-events-none">
          <span className="text-sm text-gray-600">{loadingLabel}</span>
        </div>
      )}

      {/* Labels */}
      <span className="absolute top-3 left-3 px-2 py-0.5 text-xs rounded-md bg-black/60 text-white backdrop-blur-sm pointer-events-none">
        {beforeLabel}
      </span>
      {afterSrc && (
        <span className="absolute top-3 right-3 px-2 py-0.5 text-xs rounded-md bg-black/60 text-white backdrop-blur-sm pointer-events-none">
          {afterLabel}
        </span>
      )}

      {/* Divider line */}
      {afterSrc && (
        <div
          className={`absolute top-0 bottom-0 w-px bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.15)] pointer-events-none ${transitionClass}`}
          style={{ left: `${position}%` }}
        />
      )}

      {/* Drag handle */}
      {afterSrc && (
        <button
          type="button"
          onKeyDown={onHandleKeyDown}
          aria-label={t("comparisonSlider")}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(position)}
          role="slider"
          className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-700 text-sm cursor-ew-resize focus:outline-none focus:ring-2 focus:ring-gray-900 ${transitionClass}`}
          style={{ left: `${position}%` }}
        >
          ⇔
        </button>
      )}
    </div>
  );
}
