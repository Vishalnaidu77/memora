'use client'

import { useEffect, useMemo, useState } from "react";
import useItem from "../hooks/useItem";

const FILTERS = [
  { label: "ALL OBJECTS", value: "ALL OBJECTS" },
  { label: "ARTICLES", value: "article" },
  { label: "VIDEOS", value: "video" },
  { label: "TWITTER THREADS", value: "twitter" },
  { label: "PDFS", value: "pdf" },
];

const TOP_NAV = ["LIBRARY", "RESURFACE", "INSIGHTS"];
const SIDE_NAV = [
  { icon: "smart_display", label: "LIBRARY", active: true },
  { icon: "autorenew", label: "RESURFACE" },
  { icon: "analytics", label: "INSIGHTS" },
];
const FOOTER_NAV = [
  { icon: "settings", label: "SETTINGS" },
  { icon: "inventory_2", label: "ARCHIVE" },
];

const FALLBACK_BACKGROUNDS = [
  "linear-gradient(180deg, #171717 0%, #090909 100%)",
  "radial-gradient(circle at 50% 35%, rgba(255,255,255,0.24), transparent 28%), linear-gradient(180deg, #181818 0%, #050505 100%)",
  "linear-gradient(145deg, #2a2a2a 0%, #151515 35%, #050505 100%)",
  "radial-gradient(circle at 40% 45%, rgba(255,255,255,0.16), transparent 18%), linear-gradient(180deg, #202020 0%, #0a0a0a 100%)",
];

function getBadge(type) {
  const badges = {
    article: "ARTICLE",
    video: "VIDEO",
    twitter: "THREAD",
    pdf: "PDF",
  };

  return badges[type] || "ITEM";
}

function getMeta(item) {
  const createdAt = item?.createdAt ? new Date(item.createdAt) : null;
  const timeLabel =
    createdAt && !Number.isNaN(createdAt.getTime())
      ? `SAVED ${createdAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).toUpperCase()}`
      : "SAVED RECENTLY";

  const detail =
    item?.duration ||
    item?.readTime ||
    item?.pages ||
    item?.author ||
    (item?.type === "pdf"
      ? "PDF"
      : item?.type === "video"
        ? "VIDEO"
        : item?.type === "twitter"
          ? "THREAD"
          : "ARTICLE");

  return `${timeLabel} - ${String(detail).toUpperCase()}`;
}

function getDisplayTitle(title, maxLength = 58) {
  if (!title) return "Untitled item";
  if (title.length <= maxLength) return title;
  return `${title.slice(0, maxLength).trim()}...`;
}

function DashboardIcon({ name, className = "" }) {
  const icons = {
    smart_display: ">",
    autorenew: "*",
    analytics: "#",
    settings: "S",
    inventory_2: "A",
    account_circle: "U",
  };

  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-5 w-5 items-center justify-center text-[0.8rem] font-bold leading-none ${className}`}
    >
      {icons[name] || "+"}
    </span>
  );
}

function PlaceholderArtwork({ index, badge }) {
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: FALLBACK_BACKGROUNDS[index % FALLBACK_BACKGROUNDS.length] }}
    >
      <div className="absolute inset-0 opacity-40">
        <div className="absolute left-[-10%] top-[14%] h-px w-[130%] rotate-[12deg] bg-white/15" />
        <div className="absolute left-[-10%] top-[40%] h-px w-[130%] rotate-[12deg] bg-white/10" />
        <div className="absolute left-[-10%] top-[66%] h-px w-[130%] rotate-[12deg] bg-white/10" />
      </div>
      <div className="absolute left-5 top-5 bg-black px-4 py-2 text-[10px] font-semibold tracking-[0.24em] text-white">
        {badge}
      </div>
    </div>
  );
}

function ItemCard({ item, index }) {
  const badge = getBadge(item?.type);

  return (
    <article className="group">
      <div className="relative mb-6 aspect-[0.76] overflow-hidden bg-[#111]">
        {item?.thumbnail ? (
          <img
            src={item.thumbnail}
            alt={item?.title || "Library item"}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <PlaceholderArtwork index={index} badge={badge} />
        )}

        {item?.thumbnail ? (
          <div className="absolute left-5 top-5 bg-black px-4 py-2 text-[10px] font-semibold tracking-[0.24em] text-white">
            {badge}
          </div>
        ) : null}
      </div>

      <h3 className="max-w-[13ch] text-[clamp(1.65rem,2vw,2.1rem)] font-black leading-[1.06] tracking-[-0.05em] text-white">
        {getDisplayTitle(item?.title, 54)}
      </h3>

      <p className="mt-4 text-[11px] tracking-[0.24em] text-[#8d8d8d]">{getMeta(item)}</p>
    </article>
  );
}

export default function DashboardPage() {
  const { allItems, handleGetItems, loading } = useItem();
  const [filter, setFilter] = useState("ALL OBJECTS");

  useEffect(() => {
    handleGetItems();
  }, []);

  const items = useMemo(() => allItems.flat().filter(Boolean), [allItems]);

  const filteredItems = useMemo(() => {
    if (filter === "ALL OBJECTS") return items;
    return items.filter((item) => item?.type === filter);
  }, [filter, items]);

  const featuredItem = filteredItems[0];
  const synthesisCount = filteredItems.length;

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white">
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

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-12 px-6 py-8 md:px-8 xl:grid-cols-[260px_minmax(0,1fr)]">
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

        <section className="pb-10">
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
                      onClick={() =>
                        setFilter(tab.value === "ALL OBJECTS" ? "ALL OBJECTS" : tab.value)
                      }
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

          <div className="mt-20">
            {loading ? (
              <div className="py-24 text-[11px] tracking-[0.35em] text-white/55">LOADING LIBRARY...</div>
            ) : filteredItems.length ? (
              <div className="grid gap-x-10 gap-y-20 md:grid-cols-2 2xl:grid-cols-4">
                {filteredItems.map((item, index) => (
                  <ItemCard
                    key={item?._id || item?.id || `${item?.title || "item"}-${index}`}
                    item={item}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="flex min-h-[320px] flex-col items-center justify-center border border-dashed border-white/10 bg-white/[0.02] text-center">
                <p className="text-[11px] tracking-[0.42em] text-white/50">NO ITEMS FOUND</p>
                <p className="mt-4 max-w-md text-base text-white/70">
                  Try another filter, or add a few saved objects to populate the library.
                </p>
              </div>
            )}
          </div>

          <footer className="mt-24 border-t border-white/10 pt-8 text-[11px] tracking-[0.32em] text-white/30">
            2024 MEMORA. ALL RIGHTS RESERVED.
          </footer>
        </section>
      </div>
    </main>
  );
}
