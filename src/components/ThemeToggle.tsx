import { useState, useEffect } from "react";
import { THEMES, type Theme } from "../types";
import { isTheme } from "../utils/validation";

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme");
    return saved && isTheme(saved) ? saved : "system";
  });

  useEffect(() => {
    const applyTheme = (newTheme: Theme): void => {
      const resolvedTheme =
        newTheme === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : newTheme;

      document.documentElement.setAttribute("data-theme", resolvedTheme);
      localStorage.setItem("theme", newTheme);
    };

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      applyTheme(theme);

      const handleChange = () => applyTheme("system");
      mediaQuery.addEventListener("change", handleChange);
      return () => {
        mediaQuery.removeEventListener("change", handleChange);
      };
    }

    applyTheme(theme);
  }, [theme]);

  const cycleTheme = () => {
    const currentIndex = THEMES.indexOf(theme);
    const nextTheme = THEMES[(currentIndex + 1) % THEMES.length] ?? "system";
    setTheme(nextTheme);
  };

  const getIcon = (selectedTheme: Theme): string => {
    switch (selectedTheme) {
      case "light":
        return "☀️";
      case "dark":
        return "🌙";
      case "system":
        return "💻";
    }
  };

  const themeLabel = theme.charAt(0).toUpperCase() + theme.slice(1);

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={cycleTheme}
      aria-label={`Current theme: ${themeLabel}. Activate to cycle theme.`}
      title={`Current theme: ${themeLabel}`}
    >
      <span className="theme-name">{themeLabel}</span>
      <span className="theme-icon" aria-hidden="true">
        {getIcon(theme)}
      </span>
    </button>
  );
}

export default ThemeToggle;
