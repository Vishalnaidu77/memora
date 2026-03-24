import { FILTERS } from "../constants";
import { getDisplayTitle } from "../utils";

export default function DashboardHero({
  filter,
  setFilter,
  featuredItem,
  synthesisCount,
}) {
  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
      <div>
        <h1 className="text-[clamp(4rem,9vw,6.8rem)] font-black leading-[0.9] tracking-[-0.08em]">
          LIBRARY
        </h1>

        <div className="mt-10 flex flex-wrap gap-4">
          {FILTERS.map((tab) => {
            const isActive =
              tab.value === "ALL OBJECTS" ? filter === "ALL OBJECTS" : filter === tab.value;

            return (
              <button
                key={tab.label}
                onClick={() => setFilter(tab.value === "ALL OBJECTS" ? "ALL OBJECTS" : tab.value)}
                className={`min-w-[140px] border px-6 py-4 text-[11px] font-semibold tracking-[0.34em] transition ${
                  isActive
                    ? "border-white bg-white text-black"
                    : "border-white/10 text-white/85 hover:border-white/30"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <aside className="min-w-0 overflow-hidden bg-[#f4f2ef] p-8 text-black sm:p-10">
        <p className="text-[11px] tracking-[0.42em] text-black/55">SYNTHESIS ENGINE</p>

        <h2 className="mt-6 max-w-[9ch] text-[clamp(2.2rem,3vw,3.35rem)] font-black leading-[1.02] tracking-[-0.06em] break-words">
          {featuredItem
            ? `Cross-pollination detected around "${getDisplayTitle(featuredItem.title, 28)}".`
            : "Your library is ready for its first synthesis."}
        </h2>

        <p className="mt-8 max-w-[28ch] text-[1.05rem] leading-8 text-black/75">
          {featuredItem
            ? `Your library suggests a convergence across ${synthesisCount} recent ${
                synthesisCount === 1 ? "object" : "objects"
              } in this collection.`
            : "Save articles, videos, PDFs, and threads to start building connections here."}
        </p>

        <button className="mt-12 border-b border-black pb-2 text-[11px] font-semibold tracking-[0.3em]">
          VIEW FULL SYNTHESIS
        </button>
      </aside>
    </div>
  );
}
