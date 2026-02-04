import type { HapticType } from "../types";

export const triggerHaptic = (type: HapticType = "medium"): void => {
  // Check if Vibration API is supported
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
    return;
  }

  const patterns: Record<HapticType, number | number[]> = {
    tick: 5, // Extremely short, sharp (for wheel ticks)
    soft: 10, // Subtle feedback (toggles)
    medium: 40, // Standard button press
    heavy: 70, // High impact
    success: [50, 50, 50], // Double-tap pulse
  };

  try {
    navigator.vibrate(patterns[type] || patterns.medium);
  } catch {
    // Ignore errors (some browsers might block it)
  }
};
