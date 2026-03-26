import { FOOTER_NAV, SIDE_NAV } from "../constants";
import DashboardIcon from "./DashboardIcon";

export default function DashboardSidebar() {
  return (
    <aside className="flex min-h-[calc(100vh-8rem)] flex-col border-white/10 xl:border-r xl:pr-10">
      <div>
        <div className="text-[3rem] font-black leading-none tracking-[-0.08em]">MEMORA</div>
        <p className="mt-3 text-[11px] tracking-[0.38em] text-white/70">MODERN MONOLITH</p>
      </div>

      <nav className="mt-14 space-y-3">
        {SIDE_NAV.map((item) => (
          <button
            key={item.label}
            className={`flex w-full items-center gap-4 overflow-hidden px-5 py-5 text-left text-[1.05rem] tracking-[0.16em] ${
              item.active
                ? "bg-white text-black"
                : "border border-white/10 text-white/75 hover:border-white/30"
            }`}
          >
            <DashboardIcon name={item.icon} className="shrink-0" />
            <span className="truncate font-semibold">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-3 pt-12">
        {FOOTER_NAV.map((item) => (
          <button
            key={item.label}
            className="flex items-center gap-4 px-1 py-3 text-left text-[0.98rem] tracking-[0.18em] text-white/72"
          >
            <DashboardIcon name={item.icon} className="shrink-0" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
