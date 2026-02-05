const hslToRgb = (hue: number, saturation: number, lightness: number): [number, number, number] => {
  const normalizedSaturation = saturation / 100;
  const normalizedLightness = lightness / 100;
  const k = (n: number) => (n + hue / 30) % 12;
  const a = normalizedSaturation * Math.min(normalizedLightness, 1 - normalizedLightness);
  const f = (n: number) =>
    normalizedLightness - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

  return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
};

const getLuminance = (red: number, green: number, blue: number) => {
  const toRelative = (channel: number) => {
    const scaled = channel / 255;
    return scaled <= 0.03928 ? scaled / 12.92 : Math.pow((scaled + 0.055) / 1.055, 2.4);
  };

  return 0.2126 * toRelative(red) + 0.7152 * toRelative(green) + 0.0722 * toRelative(blue);
};

const getContrastRatio = (rgb1: [number, number, number], rgb2: [number, number, number]) => {
  const lum1 = getLuminance(...rgb1);
  const lum2 = getLuminance(...rgb2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
};

const meetsContrastRequirement = (
  backgroundColor: [number, number, number],
  textColor: [number, number, number] = [0, 0, 0],
) => getContrastRatio(backgroundColor, textColor) >= 4.5;

export const generateAccessibleColors = (count: number, random: () => number = Math.random): string[] => {
  if (count <= 0) {
    return [];
  }

  const colors: string[] = [];
  const maxAttempts = 10;

  for (let index = 0; index < count; index++) {
    const baseHue = (index * 360) / count;
    let attempts = 0;
    let color = `hsl(${baseHue}, 70%, 75%)`;

    while (attempts < maxAttempts) {
      const saturation = 60 + random() * 20;
      const lightness = 70 + random() * 15;
      const rgbColor = hslToRgb(baseHue, saturation, lightness);

      if (meetsContrastRequirement(rgbColor, [0, 0, 0])) {
        color = `hsl(${baseHue}, ${saturation}%, ${lightness}%)`;
        break;
      }

      attempts++;
    }

    colors.push(color);
  }

  return colors;
};

export const easeOutQuart = (progress: number): number => 1 - Math.pow(1 - progress, 4);

export const normalizePointerAngle = (rotation: number): number => (360 - (rotation % 360) + 360) % 360;

export const getWinningIndex = (rotation: number, itemCount: number): number | null => {
  if (itemCount <= 0) {
    return null;
  }

  const segmentAngle = 360 / itemCount;
  return Math.floor(normalizePointerAngle(rotation) / segmentAngle) % itemCount;
};

interface DividerGuardOptions {
  rotation: number;
  spins: number;
  extraDegrees: number;
  segmentAngle: number;
  boundaryThreshold?: number;
  targetOffset?: number;
  random?: () => number;
}

export const nudgeAwayFromDivider = ({
  rotation,
  spins,
  extraDegrees,
  segmentAngle,
  boundaryThreshold = 2,
  targetOffset = 2.5,
  random = Math.random,
}: DividerGuardOptions): number => {
  if (segmentAngle <= 0) {
    return extraDegrees;
  }

  const targetRotation = rotation + spins * 360 + extraDegrees;
  const finalNormalized = normalizePointerAngle(targetRotation);
  const nearestDividerIndex = Math.round(finalNormalized / segmentAngle);
  const nearestDividerAngle = nearestDividerIndex * segmentAngle;
  const distanceToDivider = Math.abs(finalNormalized - nearestDividerAngle);

  if (distanceToDivider >= boundaryThreshold) {
    return extraDegrees;
  }

  const direction = random() < 0.5 ? 1 : -1;
  const targetFinal = nearestDividerAngle + direction * targetOffset;
  return extraDegrees - (targetFinal - finalNormalized);
};
