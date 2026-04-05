'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../ThemeContext";
import useAuth from "../hooks/useAuth";
import useItem from "../hooks/useItem";
import Button from "./Button";
import FormContainer from "../library/components/FormContainer";

const navItems = [
  { href: "/", label: "Home"},
  { href: "/library", label: "Library" },
  { href: "/clusters", label: "Cluster" },
  { href: "/resurface", label: "Resurface"},
  { href: "/graph", label: "Graph"}
];

const authItems = [
  { href: "/login", label: "LOGIN" },
  { href: "/register", label: "REGISTER" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { mode, theme, toggleTheme } = useTheme();
  const { isAddItemModalOpen, openAddItemModal, closeAddItemModal } = useItem();

  const { user } = useAuth()

  const visibleItems = user
    ? navItems
    : navItems.filter((item) => item.href === "/");

  return (
    <>
      <nav className="mx-auto flex max-w-[1600px] items-center justify-between gap-6 px-6 py-5 md:px-8">
        <div className="flex items-center gap-8 md:gap-12">
          <Link
            href="/"
            className="text-[2.2rem] font-black tracking-[-0.08em]"
            style={{ color: theme.heading }}
          >
            MEMORA
          </Link>

          
        </div>

        <div className="hidden items-center gap-6 md:flex lg:gap-10">
          {visibleItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="border-b pb-2 text-[0.95rem] font-bold tracking-[-0.03em] transition-colors"
                style={{
                  borderColor: isActive ? theme.foreground : "transparent",
                  color: isActive ? theme.foreground : theme.muted,
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          <div className="hidden items-center gap-4 md:flex">
            {user ? null : authItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[0.8rem] font-semibold tracking-[0.18em] transition-colors"
                  style={{
                    color: isActive ? theme.foreground : theme.muted,
                  }}
                >
                  {item.label}
                </Link>
              );  
            })}
          </div>

          {user ? (
            <Button
              theme={theme}
              variant="primary"
              className="px-6 py-2 text-[11px] tracking-[0.24em]"
              onClick={openAddItemModal}
            >
              Add Items
            </Button>
          ) : null}
          <button
            type="button"
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors"
            style={{
              border: `1px solid ${theme.lowBorder}`,
              color: theme.foreground,
              backgroundColor: theme.panelInner,
            }}
          >
            {mode === "dark" ? <FiSun /> : <FiMoon />}
          </button>
        </div>
      </nav>
      {isAddItemModalOpen ? (
        <FormContainer onClose={closeAddItemModal} />
      ) : null}
    </>
  );
}
