export function getBadge(type) {
  const badges = {
    article: "ARTICLE",
    video: "VIDEO",
    twitter: "THREAD",
    pdf: "PDF",
  };

  return badges[type] || "ITEM";
}

export function getMeta(item) {
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

export function getDisplayTitle(title, maxLength = 58) {
  if (!title) return "Untitled item";
  if (title.length <= maxLength) return title;
  return `${title.slice(0, maxLength).trim()}...`;
}
