import type { CollectionConfig, SpinnerConfig, Theme } from "../types";

const themes: readonly Theme[] = ["light", "dark", "system"];

export const isTheme = (value: string): value is Theme => themes.some((theme) => theme === value);

export const isSpinnerConfig = (value: unknown): value is SpinnerConfig => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const spinner = value as Record<string, unknown>;
  if (typeof spinner.name !== "string" || !Array.isArray(spinner.items)) {
    return false;
  }

  return spinner.items.every((item) => typeof item === "string");
};

export const isCollectionConfig = (value: unknown): value is CollectionConfig => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const collection = value as Record<string, unknown>;
  if (!Array.isArray(collection.spinners) || !collection.spinners.every(isSpinnerConfig)) {
    return false;
  }

  if (collection.title !== undefined && typeof collection.title !== "string") {
    return false;
  }

  return true;
};
