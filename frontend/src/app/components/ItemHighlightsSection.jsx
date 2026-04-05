'use client'

function formatHighlightDate(value) {
  if (!value) {
    return "Saved highlight";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Saved highlight";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getHostnameLabel(url) {
  if (!url) {
    return "";
  }

  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function buildContextCopy(highlight) {
  const before = String(highlight?.contextBefore || "").trim();
  const after = String(highlight?.contextAfter || "").trim();

  if (!before && !after) {
    return "";
  }

  return [before, after].filter(Boolean).join(" ... ");
}

function HighlightCard({ highlight, theme }) {
  const contextCopy = buildContextCopy(highlight);
  const sourceLabel = getHostnameLabel(highlight?.pageUrl);

  return (
    <article
      className="border px-5 py-5"
      style={{
        borderColor: theme.lowBorder,
        backgroundColor: theme.panelInner,
      }}
    >
      <p className="text-[11px] tracking-[0.24em]" style={{ color: theme.muted }}>
        {formatHighlightDate(highlight?.createdAt)}
        {sourceLabel ? ` / ${sourceLabel}` : ""}
      </p>

      <p
        className="mt-4 border-l-2 pl-4 text-base leading-8"
        style={{
          color: theme.foreground,
          borderColor: theme.accentDark,
        }}
      >
        {highlight?.text}
      </p>

      {contextCopy ? (
        <p className="mt-4 text-sm leading-7" style={{ color: theme.hint }}>
          {contextCopy}
        </p>
      ) : null}
    </article>
  );
}

export default function ItemHighlightsSection({ item, theme }) {
  const highlights = Array.isArray(item?.highlights)
    ? [...item.highlights]
        .filter((highlight) => String(highlight?.text || "").trim())
        .sort((left, right) => new Date(right?.createdAt || 0) - new Date(left?.createdAt || 0))
    : [];

  return (
    <section
      className="mt-10 border-t pt-8"
      style={{ borderColor: theme.lowBorder }}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] tracking-[0.3em]" style={{ color: theme.muted }}>
            HIGHLIGHTS
          </p>
          <h2
            className="mt-3 text-[clamp(1.5rem,2vw,2.2rem)] font-black tracking-[-0.04em]"
            style={{ color: theme.heading }}
          >
            Saved passages for this item
          </h2>
        </div>

        <p className="text-sm" style={{ color: theme.hint }}>
          {highlights.length} {highlights.length === 1 ? "highlight" : "highlights"} saved
        </p>
      </div>

      {highlights.length ? (
        <div className="mt-6 grid gap-4">
          {highlights.map((highlight) => (
            <HighlightCard
              key={highlight?._id || `${highlight?.text}-${highlight?.createdAt}`}
              highlight={highlight}
              theme={theme}
            />
          ))}
        </div>
      ) : (
        <div
          className="mt-6 border px-6 py-8 text-sm leading-7"
          style={{
            borderColor: theme.lowBorder,
            backgroundColor: theme.panelInner,
            color: theme.hint,
          }}
        >
          No highlights saved for this item yet. Select text on the original page with the
          Memora extension and save it here.
        </div>
      )}
    </section>
  );
}
