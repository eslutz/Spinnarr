export interface SpinnerConfig {
  name: string;
  items: string[];
}

export interface CollectionConfig {
  title?: string;
  spinners: SpinnerConfig[];
}

export type Theme = "light" | "dark" | "system";

export type HapticType = "tick" | "soft" | "medium" | "heavy" | "success";
