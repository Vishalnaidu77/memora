'use client'

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiMenu, FiMoon, FiPlus, FiSun, FiX } from "react-icons/fi";
import { useTheme } from "../ThemeContext";
import useAuth from "../hooks/useAuth";
import useItem from "../hooks/useItem";
import Button from "./Button";
import FormContainer from "../library/components/FormContainer";
import { IoLogOutOutline } from "react-icons/io5";
import { FaPlus } from "react-icons/fa";

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
  const router = useRouter();
  const pathname = usePathname();
  const { mode, theme, toggleTheme } = useTheme();
  const { isAddItemModalOpen, openAddItemModal, closeAddItemModal } = useItem();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, handleLogout, loading } = useAuth()

  const visibleItems = user
    ? navItems
    : navItems.filter((item) => item.href === "/");

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isItemActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const onLogout = async () => {
    try {
      await handleLogout();
      closeAddItemModal();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  return (
    <>
      <nav className="mx-auto flex max-w-400 items-center justify-between gap-4 px-6 py-5 md:gap-6 md:px-8">
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
            const isActive = isItemActive(item.href);

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
          {user ? (
            <Button
              theme={theme}
              variant="secondary"
              className="h-10 w-10 flex justify-center items-center text-md md:hidden"
              onClick={openAddItemModal}
              disabled={loading}
              aria-label="Add item"
              title="Add item"
            >
              <FaPlus />
            </Button>
          ) : null}

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

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <Button
                theme={theme}
                variant="secondary"
                className="px-6 py-2 text-[11px] tracking-[0.24em]"
                onClick={openAddItemModal}
                disabled={loading}
              >
                Add Items
              </Button>
            ) : null}
            {user ? (
              <Button
                theme={theme}
                variant="secondary"
                className="px-6 py-2 text-[15px] tracking-[0.24em] rounded"
                onClick={onLogout}
                disabled={loading}
              >
                {loading ? "Logging out..." : <IoLogOutOutline />}
              </Button>
            ) : null}
          </div>

          <button
            type="button"
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="hidden h-10 w-10 shrink-0 place-items-center rounded-full transition-colors md:grid"
            style={{
              border: `1px solid ${theme.lowBorder}`,
              color: theme.foreground,
              backgroundColor: theme.panelInner,
            }}
          >
            {mode === "dark" ? <FiSun /> : <FiMoon />}
          </button>

          <button
            type="button"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors md:hidden"
            style={{
              border: `1px solid ${theme.lowBorder}`,
              color: theme.foreground,
              backgroundColor: theme.panelInner,
            }}
          >
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </nav>

      {isMobileMenuOpen ? (
        <div
          className="mx-auto max-w-400 px-6 pb-4 md:hidden"
          style={{ borderTop: `1px solid ${theme.lowBorder}` }}
        >
          <div className="flex flex-col gap-2 pt-4">
            {visibleItems.map((item) => {
              const isActive = isItemActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="border px-4 py-3 text-[0.92rem] font-bold tracking-[-0.02em]"
                  style={{
                    borderColor: isActive ? theme.foreground : theme.lowBorder,
                    color: isActive ? theme.foreground : theme.muted,
                    backgroundColor: isActive ? theme.panelInner : "transparent",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}

            {!user ? (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {authItems.map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="border px-4 py-3 text-center text-[0.74rem] font-semibold tracking-[0.16em]"
                      style={{
                        borderColor: isActive ? theme.foreground : theme.lowBorder,
                        color: isActive ? theme.foreground : theme.muted,
                      }}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ) : null}

            {user ? (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button
                  theme={theme}
                  variant="secondary"
                  className="w-full px-4 py-3 text-[10px] tracking-[0.18em]"
                  onClick={onLogout}
                  disabled={loading}
                >
                  {loading ? "Logging out..." : "Logout"}
                </Button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full border px-4 py-3 text-[10px] font-semibold tracking-[0.18em]"
                  style={{
                    borderColor: theme.lowBorder,
                    color: theme.foreground,
                    backgroundColor: "transparent",
                  }}
                >
                  {mode === "dark" ? "Light Mode" : "Dark Mode"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {isAddItemModalOpen ? (
        <FormContainer onClose={closeAddItemModal} />
      ) : null}
    </>
  );
}
