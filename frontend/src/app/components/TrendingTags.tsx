"use client";

const TAGS = ["Typography", "Archival", "Interface"];

export default function TrendingTags() {
  return (
    <div className="flex flex-wrap gap-2">
      {TAGS.map((tag) => (
        <button
          key={tag}
          className="px-3 py-1 text-[10px] font-bold uppercase bg-white text-on-surface border-none cursor-pointer transition-colors hover:bg-primary hover:text-on-primary"
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
