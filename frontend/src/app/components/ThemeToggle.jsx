'use client'

import { useTheme } from "../ThemeContext";

export default function ThemeToggle() {
  const { theme, mode, toggleTheme } = useTheme();

  return (
    <div className="w-full p-4 flex justify-end">
      <button
        onClick={toggleTheme}
        style={{
          backgroundColor: theme.panelInner,
          color: theme.foreground,
          border: "1px solid " + theme.lowBorder,
          padding: "0.5rem 1rem",
          borderRadius: "999px",
          fontWeight: "600",
        }}
      >
        {mode === "dark" ? "Switch to light" : "Switch to dark"}
      </button>
    </div>
  );
}
