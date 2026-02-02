import { useState, useRef, useEffect, useMemo } from "react";

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
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
    />
  </svg>
);

function Spinner({ items, onSpinComplete, onSpinStart, onSpinEnd, children }) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [muted, setMuted] = useState(true);
  const wheelRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioBufferRef = useRef(null); // To store the "click" buffer

  // Initialize AudioContext and Create Click Buffer on Mount
  useEffect(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      // Create a "white noise" buffer for a mechanical click sound
      // This is more realistic than a sine wave oscillator
      const bufferSize = ctx.sampleRate * 0.005; // 5ms click (very short)
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        // White noise with exponential decay
        // This generates a "snap" sound similar to a plastic card hitting a spoke
        data[i] = (Math.random() * 2 - 1) * Math.exp((-3 * i) / bufferSize);
      }
      audioBufferRef.current = buffer;

      return () => {
        if (ctx.state !== "closed") {
          ctx.close();
        }
      };
    } catch (e) {
      console.error("Audio Context initialization failed", e);
    }
  }, []);

  useEffect(() => {
    setResult(null);
    setSpinning(false);
  }, [items]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === "Space" && !spinning && items.length > 0) {
        event.preventDefault();
        spin();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [spinning, items.length]);

  // Convert HSL to RGB
  const hslToRgb = (h, s, l) => {
    s /= 100;
    l /= 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
  };

  // Calculate relative luminance
  const getLuminance = (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  // Calculate contrast ratio
  const getContrastRatio = (rgb1, rgb2) => {
    const lum1 = getLuminance(...rgb1);
    const lum2 = getLuminance(...rgb2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  // Check if contrast meets WCAG AA standard (4.5:1 for normal text)
  const meetsContrastRequirement = (bgColor, textColor = [0, 0, 0]) => {
    const ratio = getContrastRatio(bgColor, textColor);
    return ratio >= 4.5; // WCAG AA standard
  };

  // Generate dynamic colors with accessibility checks
  const generateColors = (count) => {
    const colors = [];
    const maxAttempts = 10; // Max attempts per color to find accessible option

    for (let i = 0; i < count; i++) {
      const baseHue = (i * 360) / count;
      let saturation, lightness, hslColor, rgbColor;
      let attempts = 0;
      let validColor = false;

      // Try to find a color that meets contrast requirements
      while (!validColor && attempts < maxAttempts) {
        saturation = 60 + Math.random() * 20; // 60-80%
        lightness = 70 + Math.random() * 15; // 70-85%

        rgbColor = hslToRgb(baseHue, saturation, lightness);

        // Check contrast with black text
        if (meetsContrastRequirement(rgbColor)) {
          validColor = true;
          hslColor = `hsl(${baseHue}, ${saturation}%, ${lightness}%)`;
        } else {
          // Adjust lightness to improve contrast
          lightness = Math.max(65, lightness - 5);
        }

        attempts++;
      }

      // Fallback: if no valid color found, use a safe default
      if (!validColor) {
        lightness = 75;
        saturation = 70;
        hslColor = `hsl(${baseHue}, ${saturation}%, ${lightness}%)`;
      }

      colors.push(hslColor);
    }

    return colors;
  };

  const colors = useMemo(() => generateColors(items.length), [items.length]);
  const segmentAngle = 360 / items.length;

  const segments = items.map((item, index) => {
    const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);

    const x1 = 200 + 190 * Math.cos(startAngle);
    const y1 = 200 + 190 * Math.sin(startAngle);
    const x2 = 200 + 190 * Math.cos(endAngle);
    const y2 = 200 + 190 * Math.sin(endAngle);

    const largeArc = segmentAngle > 180 ? 1 : 0;
    const pathData = `M 200 200 L ${x1} ${y1} A 190 190 0 ${largeArc} 1 ${x2} ${y2} Z`;

    // Calculate text position and rotation
    const angleFromTop = index * segmentAngle + segmentAngle / 2;
    const textAngle = (angleFromTop - 90) * (Math.PI / 180);

    // Position text closer to center to avoid hitting the edge
    const textRadius = 120;
    const textX = 200 + textRadius * Math.cos(textAngle);
    const textY = 200 + textRadius * Math.sin(textAngle);

    // Rotation logic
    // Ensure consistent radial orientation (Center to Rim)
    const textRotation = angleFromTop - 90;

    // Adjust text size based on length
    // Longer text gets smaller font, shorter text gets larger
    const fontSize = Math.max(10, Math.min(16, 22 - Math.floor(item.length / 1.5)));

    return {
      pathData,
      color: colors[index],
      text: item,
      textX,
      textY,
      textRotation,
      fontSize,
    };
  });

  const spin = () => {
    if (spinning || items.length === 0) return;

    // Clear any previous animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    setSpinning(true);
    setResult(null);
    if (onSpinStart) {
      onSpinStart();
    }

    // Random number of full rotations (5-8) plus random angle
    const spins = 5 + Math.floor(Math.random() * 4);
    const extraDegrees = Math.floor(Math.random() * 360);
    const totalChange = spins * 360 + extraDegrees;

    const startRotation = rotation;
    const endRotation = startRotation + totalChange;
    const duration = 5000;
    const startTime = performance.now();

    // Cubic bezier implementation for ease-out-quart
    // The CSS equivalent was cubic-bezier(0.17, 0.67, 0.3, 1)
    // We'll use a standard easeOutQuart or similar for JS animation
    // t is 0-1
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    // Track the last "tick" angle to know when we cross a boundary
    const segmentAngle = 360 / items.length;
    let lastAngle = startRotation;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Apply easing
      const easedProgress = easeOutQuart(progress);

      const currentRotation = startRotation + totalChange * easedProgress;
      setRotation(currentRotation);

      // Check for ticks
      // We play a tick every time we cross a multiple of segmentAngle
      const currentAngleNormalized = currentRotation % 360; // Just for debugging logic if needed

      // Calculate how many segments we've passed since last frame
      const lastSegmentIndex = Math.floor(lastAngle / segmentAngle);
      const currentSegmentIndex = Math.floor(currentRotation / segmentAngle);

      if (currentSegmentIndex > lastSegmentIndex && progress < 1.0) {
        playTick();
      }

      lastAngle = currentRotation;

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        // Calculate result based on final angle
        const finalNormalized = (360 - (currentRotation % 360)) % 360;
        const selectedIndex = Math.floor(finalNormalized / segmentAngle) % items.length;
        setResult(items[selectedIndex]);

        if (onSpinEnd) onSpinEnd();
        if (onSpinComplete) onSpinComplete(items[selectedIndex]);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  // Touch interaction removed; desktop and mobile use the spin button

  // Improved tick sound using Web Audio API Buffer
  // Plays a pre-generated noise burst for zero latency
  const playTick = () => {
    if (muted || !audioContextRef.current || !audioBufferRef.current) return;

    try {
      const ctx = audioContextRef.current;

      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBufferRef.current;

      // Slight pitch randomization to sound organic
      source.playbackRate.value = 0.9 + Math.random() * 0.2;

      // Create a gain node for volume control
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.3; // Adjust volume as needed

      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      source.start(0);
    } catch (e) {
      // ignore audio errors
    }
  };

  return (
    <div className="spinner-container">
      <button
        className={`mute-toggle ${muted ? "active" : ""}`}
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "Unmute tick sounds" : "Mute tick sounds"}
      >
        {muted ? <MuteIcon /> : <UnmuteIcon />}
      </button>
      <div className="wheel-stack">
        {result && !spinning ? (
          <div className="result-overlay">
            <div className="spinner-result" style={{ margin: 0 }}>
              <h3>Result:</h3>
              <div className="result-content">{result}</div>
            </div>
          </div>
        ) : null}

        <div className="wheel-container">
          <div className="pointer"></div>
          <svg
            ref={wheelRef}
            className={`wheel ${spinning ? "spinning" : ""}`}
            viewBox="0 0 400 400"
            style={{
              transform: `rotate(${rotation}deg)`,
              // Transition handled by JS requestAnimationFrame now
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
        <button className="spin-button" onClick={spin} disabled={spinning || items.length === 0}>
          {spinning ? "Spinning..." : "SPIN"}
        </button>

        <div className="navigation-buttons-wrapper">{children}</div>
      </div>
    </div>
  );
}

export default Spinner;
