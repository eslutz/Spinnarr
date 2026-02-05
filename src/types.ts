export interface SpinnerConfig {
  name: string;
  items: string[];
}

export interface CollectionConfig {
  title?: string;
  spinners: SpinnerConfig[];
}

export const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];

export type HapticType = "tick" | "soft" | "medium" | "heavy" | "success";
