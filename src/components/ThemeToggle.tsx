import { useState, useEffect } from "react";
import type { Theme } from "../types";
import { isTheme } from "../utils/validation";

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme");
    return saved && isTheme(saved) ? saved : "system";
  });

  useEffect(() => {
    const applyTheme = (newTheme: Theme) => {
      if (newTheme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", systemTheme);
      } else {
        document.documentElement.setAttribute("data-theme", newTheme);
      }
      localStorage.setItem("theme", newTheme);
    };

    applyTheme(theme);

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme("system");
      mediaQuery.addEventListener("change", handleChange);
      return () => {
        mediaQuery.removeEventListener("change", handleChange);
      };
    }
  }, [theme]);

  const cycleTheme = () => {
    const themes: Theme[] = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length] ?? "system";
    setTheme(nextTheme);
  };

  const getIcon = () => {
    switch (theme) {
      case "light":
        return "☀️";
      case "dark":
        return "🌙";
      case "system":
        return "💻";
      default:
        return "💻";
    }
  };

  const getThemeLabel = () => {
    return theme.charAt(0).toUpperCase() + theme.slice(1);
  };

  return (
    <button className="theme-toggle" onClick={cycleTheme} aria-label="Toggle theme" title={`Current: ${theme}`}>
      <span className="theme-name">{getThemeLabel()}</span>
      <span className="theme-icon">{getIcon()}</span>
    </button>
  );
}

export default ThemeToggle;
