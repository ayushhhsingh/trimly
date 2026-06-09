"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "black" | "nord";

const STORAGE_KEY = "videohub-theme";

const setDocumentTheme = (theme: Theme) => {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme === "black" ? "dark" : "light";
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("black");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (typeof window !== "undefined"
      ? (localStorage.getItem(STORAGE_KEY) as Theme | null)
      : null);
    const initial: Theme = stored === "nord" ? "nord" : "black";
    setTheme(initial);
    setDocumentTheme(initial);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "black" ? "nord" : "black";
    setTheme(next);
    setDocumentTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore storage errors (e.g. private mode)
    }
  };

  if (!mounted) {
    return (
      <button
        className="btn btn-ghost btn-circle hover:bg-base-200"
        aria-label="Toggle theme"
        title="Toggle theme"
      >
        <Sun className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-ghost btn-circle hover:bg-base-200"
      aria-label="Toggle theme"
      title={theme === "black" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "black" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}
