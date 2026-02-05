import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { triggerHaptic } from "../utils/haptics";
import { easeOutQuart, generateAccessibleColors, getWinningIndex, nudgeAwayFromDivider } from "../utils/spinner";

interface SpinnerProps {
  items: string[];
  onSpinComplete?: (result: string) => void;
  onSpinStart?: () => void;
  onSpinEnd?: () => void;
  muted: boolean;
  onMutedChange: (muted: boolean) => void;
  children?: ReactNode;
  initialResult?: string;
}

const MuteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="#8c94b0"
    className="size-6"
    width="22"
    height="22"
    aria-hidden="true"
    focusable="false"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
    />
  </svg>
);

const UnmuteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="#8c94b0"
    className="size-6"
    width="22"
    height="22"
    aria-hidden="true"
    focusable="false"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
    />
  </svg>
);

function Spinner({
  items,
  onSpinComplete,
  onSpinStart,
  onSpinEnd,
  muted,
  onMutedChange,
  children,
  initialResult,
}: SpinnerProps) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(initialResult ?? null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    try {
      const AudioContextConstructor = window.AudioContext ?? window.webkitAudioContext;
      if (!AudioContextConstructor) {
        return;
      }

      const ctx = new AudioContextConstructor();
      audioContextRef.current = ctx;

      const bufferSize = ctx.sampleRate * 0.005;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp((-3 * i) / bufferSize);
      }
      audioBufferRef.current = buffer;

      return () => {
        if (ctx.state !== "closed") {
          void ctx.close();
        }
      };
    } catch (error) {
      console.error("Audio Context initialization failed", error);
    }
  }, []);

  useEffect(
    () => () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    },
    [],
  );

  const colors = useMemo(() => generateAccessibleColors(items.length), [items.length]);
  const segmentAngle = items.length > 0 ? 360 / items.length : 0;

  const playTick = useCallback(() => {
    triggerHaptic("tick");
    if (muted || !audioContextRef.current || !audioBufferRef.current) {
      return;
    }

    try {
      const ctx = audioContextRef.current;

      if (ctx.state === "suspended") {
        void ctx.resume();
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.playbackRate.value = 0.9 + Math.random() * 0.2;

      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.3;

      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start(0);
    } catch {
      // ignore audio errors
    }
  }, [muted]);

  const spin = useCallback(() => {
    if (spinning || items.length === 0 || segmentAngle === 0) {
      return;
    }

    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }

    triggerHaptic("medium");
    setSpinning(true);
    setResult(null);
    onSpinStart?.();

    const spins = 5 + Math.floor(Math.random() * 4);
    let extraDegrees = Math.floor(Math.random() * 360);
    extraDegrees = nudgeAwayFromDivider({
      rotation,
      spins,
      extraDegrees,
      segmentAngle,
    });

    const totalChange = spins * 360 + extraDegrees;
    const startRotation = rotation;
    const duration = 5000;
    const startTime = performance.now();
    let lastSegmentIndex = Math.floor(startRotation / segmentAngle);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentRotation = startRotation + totalChange * easeOutQuart(progress);
      setRotation(currentRotation);

      const currentSegmentIndex = Math.floor(currentRotation / segmentAngle);
      if (currentSegmentIndex > lastSegmentIndex && progress < 1) {
        playTick();
      }
      lastSegmentIndex = currentSegmentIndex;

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      setSpinning(false);
      animationRef.current = null;

      const selectedIndex = getWinningIndex(currentRotation, items.length);
      if (selectedIndex === null) {
        onSpinEnd?.();
        return;
      }

      const selectedItem = items[selectedIndex];
      if (!selectedItem) {
        onSpinEnd?.();
        return;
      }

      setResult(selectedItem);
      onSpinEnd?.();
      onSpinComplete?.(selectedItem);
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [items, onSpinComplete, onSpinEnd, onSpinStart, playTick, rotation, segmentAngle, spinning]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code !== "Space") {
        return;
      }

      if (event.target instanceof HTMLElement) {
        const interactiveTags = new Set(["button", "input", "select", "textarea"]);
        if (interactiveTags.has(event.target.tagName.toLowerCase()) || event.target.isContentEditable) {
          return;
        }
      }

      event.preventDefault();
      spin();
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [spin]);

  const segments = useMemo(
    () =>
      items.map((item, index) => {
        const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
        const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);

        const x1 = 200 + 190 * Math.cos(startAngle);
        const y1 = 200 + 190 * Math.sin(startAngle);
        const x2 = 200 + 190 * Math.cos(endAngle);
        const y2 = 200 + 190 * Math.sin(endAngle);

        const largeArc = segmentAngle > 180 ? 1 : 0;
        const pathData = `M 200 200 L ${x1} ${y1} A 190 190 0 ${largeArc} 1 ${x2} ${y2} Z`;

        const angleFromTop = index * segmentAngle + segmentAngle / 2;
        const textAngle = (angleFromTop - 90) * (Math.PI / 180);
        const textRadius = 120;
        const textX = 200 + textRadius * Math.cos(textAngle);
        const textY = 200 + textRadius * Math.sin(textAngle);
        const textRotation = angleFromTop - 90;
        const fontSize = Math.max(10, Math.min(16, 22 - Math.floor(item.length / 1.5)));

        return {
          pathData,
          color: colors[index] ?? "#d1d5db",
          text: item,
          textX,
          textY,
          textRotation,
          fontSize,
        };
      }),
    [colors, items, segmentAngle],
  );

  return (
    <div className="spinner-container">
      <button
        className={`mute-toggle ${muted ? "active" : ""}`}
        onClick={() => {
          triggerHaptic("soft");
          onMutedChange(!muted);
        }}
        type="button"
        aria-pressed={muted}
        aria-label={muted ? "Unmute tick sounds" : "Mute tick sounds"}
      >
        {muted ? <MuteIcon /> : <UnmuteIcon />}
      </button>
      <div className="wheel-stack">
        {result && !spinning ? (
          <div className="result-overlay" aria-live="polite">
            <div className="spinner-result" style={{ margin: 0 }}>
              <h3>Result:</h3>
              <div className="result-content">{result}</div>
            </div>
          </div>
        ) : null}

        <div className="wheel-container">
          <div className="pointer" aria-hidden="true"></div>
          <svg
            className="wheel"
            viewBox="0 0 400 400"
            aria-hidden="true"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: "none",
            }}
          >
            <circle cx="200" cy="200" r="190" fill="#fff" stroke="#333" strokeWidth="2" />
            {segments.map((segment, index) => (
              <path key={`segment-${index}`} d={segment.pathData} fill={segment.color} stroke="#333" strokeWidth="2" />
            ))}
            {segments.map((segment, index) => (
              <text
                key={`segment-text-${index}`}
                x={segment.textX}
                y={segment.textY}
                fill="#000"
                fontSize={segment.fontSize}
                fontWeight="700"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${segment.textRotation}, ${segment.textX}, ${segment.textY})`}
                style={{
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                {segment.text}
              </text>
            ))}
            <circle cx="200" cy="200" r="25" fill="#333" />
          </svg>
        </div>
      </div>

      <div className="spinner-actions">
        <button className="spin-button" onClick={spin} disabled={spinning || items.length === 0} type="button">
          {spinning ? "Spinning..." : "SPIN"}
        </button>
        <p className="sr-only">Press space to spin when focus is outside interactive controls.</p>

        <div className="navigation-buttons-wrapper">{children}</div>
      </div>
    </div>
  );
}

export default Spinner;
