import { describe, expect, it } from "vitest";
import { isCollectionConfig, isSpinnerConfig, isTheme } from "../src/utils/validation";

describe("validation utilities", () => {
  it("accepts only supported theme values", () => {
    expect(isTheme("light")).toBe(true);
    expect(isTheme("dark")).toBe(true);
    expect(isTheme("system")).toBe(true);
    expect(isTheme("sepia")).toBe(false);
  });

  it("validates spinner structures", () => {
    expect(isSpinnerConfig({ name: "Biome", items: ["Forest", "Desert"] })).toBe(true);
    expect(isSpinnerConfig({ name: "", items: ["Forest"] })).toBe(false);
    expect(isSpinnerConfig({ name: "Biome", items: [] })).toBe(false);
    expect(isSpinnerConfig({ name: "Biome", items: [1, 2, 3] })).toBe(false);
  });

  it("validates collection structures", () => {
    const validCollection = {
      title: "Minecraft House Builder",
      spinners: [
        { name: "Biome", items: ["Forest", "Snow"] },
        { name: "Roof", items: ["Flat", "Gable"] },
      ],
    };

    expect(isCollectionConfig(validCollection)).toBe(true);
    expect(isCollectionConfig({ title: "Empty", spinners: [] })).toBe(false);
    expect(isCollectionConfig({ title: "", spinners: validCollection.spinners })).toBe(true);
    expect(isCollectionConfig({ title: "Bad", spinners: [{ name: "Biome", items: [] }] })).toBe(false);
  });
});
