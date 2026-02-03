export const triggerHaptic = (type = "medium") => {
  // Check if Vibration API is supported
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
    return;
  }

  const patterns = {
    tick: 5, // Extremely short, sharp (for wheel ticks)
    soft: 10, // Subtle feedback (toggles)
    medium: 40, // Standard button press
    heavy: 70, // High impact
    success: [50, 50, 50], // Double-tap pulse
  };

  try {
    navigator.vibrate(patterns[type] || patterns.medium);
  } catch (e) {
    // Ignore errors (some browsers might block it)
  }
};
