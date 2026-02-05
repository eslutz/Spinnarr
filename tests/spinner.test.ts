import { describe, expect, it } from "vitest";
import { generateAccessibleColors, getWinningIndex, normalizePointerAngle, nudgeAwayFromDivider } from "../src/utils/spinner";

describe("spinner utilities", () => {
  it("returns one accessible color per segment", () => {
    const colors = generateAccessibleColors(6, () => 0.25);

    expect(colors).toHaveLength(6);
    expect(colors.every((color) => color.startsWith("hsl("))).toBe(true);
  });

  it("normalizes rotation into a single 360-degree turn", () => {
    expect(normalizePointerAngle(0)).toBe(0);
    expect(normalizePointerAngle(720)).toBe(0);
    expect(normalizePointerAngle(450)).toBe(270);
  });

  it("maps rotation to a stable winning index", () => {
    expect(getWinningIndex(0, 4)).toBe(0);
    expect(getWinningIndex(90, 4)).toBe(3);
    expect(getWinningIndex(180, 4)).toBe(2);
    expect(getWinningIndex(270, 4)).toBe(1);
    expect(getWinningIndex(45, 0)).toBeNull();
  });

  it("nudges near-divider outcomes away from segment boundaries", () => {
    const adjustedDegrees = nudgeAwayFromDivider({
      rotation: 0,
      spins: 1,
      extraDegrees: 0,
      segmentAngle: 90,
      random: () => 0,
    });

    const finalAngle = normalizePointerAngle(360 + adjustedDegrees);
    expect(finalAngle).toBe(2.5);
  });
});
