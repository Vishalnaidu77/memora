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

export function getRelativeSavedLabel(item) {
  const createdAt = item?.createdAt ? new Date(item.createdAt) : null;

  if (!createdAt || Number.isNaN(createdAt.getTime())) {
    return "SAVED RECENTLY";
  }

  const diffMs = Date.now() - createdAt.getTime();
  const dayMs = 1000 * 60 * 60 * 24;
  const days = Math.max(0, Math.floor(diffMs / dayMs));

  if (days < 1) return "SAVED TODAY";
  if (days === 1) return "SAVED 1 DAY AGO";
  if (days < 7) return `SAVED ${days} DAYS AGO`;

  const week = Math.floor(days / 7);
  if(week === 1) return "SAVED 1 WEEK AGO"
  if(week < 5) return `SAVED ${week} WEEK AGO`

  const months = Math.floor(days / 30);
  if (months === 1) return "SAVED 1 MONTH AGO";
  if (months < 12) return `SAVED ${months} MONTHS AGO`;

  const years = Math.floor(months / 12);
  return years === 1 ? "SAVED 1 YEAR AGO" : `SAVED ${years} YEARS AGO`;
}


export function getDisplayTitle(title, maxLength = 58) {
  if (!title) return "Untitled item";
  if (title.length <= maxLength) return title;
  return `${title.slice(0, maxLength).trim()}...`;
}
