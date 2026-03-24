"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

const NAV_ITEMS = [
  { icon: "inventory_2", label: "Archive", href: "/dashboard" },
  { icon: "bookmark", label: "Saved", href: "/saved" },
  { icon: "folder_special", label: "Collections", href: "/collection" },
  { icon: "sell", label: "Tags", href: "/tags" },
  { icon: "settings", label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside
      className="hidden md:flex flex-col w-64 p-6 gap-8 sticky bg-surface-container-low"
      style={{ top: "65px", height: "calc(100vh - 65px)" }}
    >
      <div>
        <p className="text-xl font-bold tracking-tighter text-on-surface">THE ARCHIVE</p>
        <p className="text-[10px] tracking-[0.2em] text-outline font-bold uppercase mt-1">
          V.01-2024
        </p>
      </div>

      <nav className="flex flex-col gap-1 text-sm font-semibold tracking-tight">
        {NAV_ITEMS.map(({ icon, label, href }) => (
          <Link
            key={label}
            href={href}
            className={`flex items-center gap-3 p-3 transition-colors no-underline ${
              pathname === href
                ? "bg-white text-on-surface font-bold"
                : "text-outline hover:bg-surface-container-highest"
            }`}
          >
            <Icon name={icon} className="text-xl" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-surface-container-highest flex items-center gap-3">
        <div className="w-8 h-8 bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-on-primary text-[10px] font-bold">CP</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase text-on-surface">Curator</span>
          <span className="text-[10px] text-outline">View Profile</span>
        </div>
      </div>
    </aside>
  );
}
