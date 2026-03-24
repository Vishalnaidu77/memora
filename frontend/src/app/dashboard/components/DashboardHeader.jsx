import { TOP_NAV } from "../constants";
import DashboardIcon from "./DashboardIcon";

export default function DashboardHeader() {
  return (
    <header className="border-b border-white/10 px-8 py-5">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6">
        <div className="flex items-center gap-12">
          <div className="text-[2.2rem] font-black tracking-[-0.08em]">MEMORA</div>
          <nav className="hidden items-center gap-10 md:flex">
            {TOP_NAV.map((item) => (
              <button
                key={item}
                className={`border-b pb-2 text-[0.95rem] font-bold tracking-[-0.03em] ${
                  item === "LIBRARY" ? "border-white text-white" : "border-transparent text-white/80"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-5 text-white">
          <button
            aria-label="Settings"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 hover:border-white/30"
          >
            <DashboardIcon name="settings" />
          </button>
          <button
            aria-label="Account"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 hover:border-white/30"
          >
            <DashboardIcon name="account_circle" />
          </button>
        </div>
      </div>
    </header>
  );
}
