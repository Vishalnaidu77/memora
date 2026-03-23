'use client'

import { useTheme } from "../ThemeContext";
import Button from "./Button";
import { FiSun, FiMoon } from "react-icons/fi";

export default function Navbar() {
  const { theme, mode, toggleTheme } = useTheme();

  return (
    <nav
      className="w-full px-4 md:px-8 py-4 flex justify-between items-center"
      style={{
        backgroundColor: theme.background,
        borderBottom: `1px solid ${theme.lowBorder}`,
      }}
    >
      <div
        className="text-2xl font-bold tracking-tighter"
        style={{ color: theme.heading, fontFamily: "'Manrope', sans-serif" }}
      >
        Memora
      </div>

      <div className="flex items-center gap-4">
        <a
          href="/login"
          className="text-sm font-semibold uppercase tracking-wider transition-opacity hover:opacity-80"
          style={{ color: theme.muted, textDecoration: 'none' }}
        >
          Login
        </a>
        <a
          href="/register"
          className="text-sm font-semibold uppercase tracking-wider transition-opacity hover:opacity-80"
          style={{ color: theme.muted, textDecoration: 'none' }}
        >
          Register
        </a>
        <Button
          theme={theme}
          variant="secondary"
          onClick={toggleTheme}
          className="rounded-lg px-3 py-2"
        >
          {mode === "dark" ? <FiSun /> : <FiMoon />}
        </Button>
      </div>
    </nav>
  );
}
