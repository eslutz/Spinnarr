import { useState, useRef, useEffect } from "react";

function Spinner({ items, onSpinComplete, children }) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const wheelRef = useRef(null);

  useEffect(() => {
    setResult(null);
    setSpinning(false);
  }, [items]);

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

  const colors = generateColors(items.length);
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

    setSpinning(true);
    setResult(null);

    // Random number of full rotations (5-8) plus random angle
    const spins = 5 + Math.floor(Math.random() * 4);
    const extraDegrees = Math.floor(Math.random() * 360);
    const totalRotation = spins * 360 + extraDegrees;

    // Calculate new total rotation
    const newRotation = rotation + totalRotation;

    // Calculate which segment we land on based on the FINAL rotation
    // We normalize the total rotation to find the effective angle
    const normalizedRotation = (360 - (newRotation % 360)) % 360;
    const selectedIndex = Math.floor(normalizedRotation / segmentAngle) % items.length;

    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(items[selectedIndex]);
      if (onSpinComplete) {
        onSpinComplete(items[selectedIndex]);
      }
    }, 4000);
  };

  return (
    <div className="spinner-container">
      <div className="wheel-container">
        <div className="pointer"></div>
        <svg
          ref={wheelRef}
          className={`wheel ${spinning ? "spinning" : ""}`}
          viewBox="0 0 400 400"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
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

      <div className="spinner-controls">
        <div
          className="result-container"
          style={{ height: "180px", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {result && !spinning ? (
            <div className="spinner-result" style={{ margin: 0 }}>
              <h3>Result:</h3>
              <div className="result-content">{result}</div>
            </div>
          ) : (
            <div className="result-placeholder" style={{ width: "100%", height: "100%" }}></div>
          )}
        </div>

        <button className="spin-button" onClick={spin} disabled={spinning || items.length === 0}>
          {spinning ? "Spinning..." : "SPIN"}
        </button>

        <div className="navigation-buttons-wrapper">{children}</div>
      </div>
    </div>
  );
}

export default Spinner;
