export default function TrendingTags() {
  const tags = [
    "#RESEARCH",
    "#ARCHIVAL",
    "#MEMORY",
    "#PATTERN",
    "#GEOMETRY",
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="bg-surface-container text-[10px] font-bold uppercase px-2 py-1 cursor-pointer hover:bg-primary hover:text-on-primary transition-colors"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
