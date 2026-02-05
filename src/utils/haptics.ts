import type { HapticType } from "../types";

const HAPTIC_PATTERNS: Record<HapticType, number | number[]> = {
  tick: 5,
  soft: 10,
  medium: 40,
  heavy: 70,
  success: [50, 50, 50],
};

export const triggerHaptic = (type: HapticType = "medium"): void => {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
    return;
  }

  try {
    navigator.vibrate(HAPTIC_PATTERNS[type]);
  } catch {
    // Ignore browsers that block the vibration API.
  }
};
