import { THEMES, type CollectionConfig, type SpinnerConfig, type Theme } from "../types";

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;
const isNonEmptyString = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === "string");

export const isTheme = (value: string): value is Theme => THEMES.some((theme) => theme === value);

export const isSpinnerConfig = (value: unknown): value is SpinnerConfig => {
  if (!isRecord(value)) {
    return false;
  }

  if (!isNonEmptyString(value.name) || !isStringArray(value.items)) {
    return false;
  }

  return true;
};

export const isCollectionConfig = (value: unknown): value is CollectionConfig => {
  if (!isRecord(value)) {
    return false;
  }

  if (!Array.isArray(value.spinners) || value.spinners.length === 0 || !value.spinners.every(isSpinnerConfig)) {
    return false;
  }

  if (value.title !== undefined && typeof value.title !== "string") {
    return false;
  }

  return true;
};
