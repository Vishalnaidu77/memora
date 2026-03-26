'use client'

import { useTheme } from "../../ThemeContext";
import { FALLBACK_BACKGROUNDS } from "../../library/constants";
import { getBadge, getDisplayTitle, getMeta } from "../../library/utils";

function ClusterArtwork({ index, badge, theme }) {
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: FALLBACK_BACKGROUNDS[index % FALLBACK_BACKGROUNDS.length] }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            theme.background === "#000000"
              ? "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)"
              : "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 100%)",
        }}
      />
      <div
        className="absolute left-5 top-5 px-4 py-2 text-[10px] font-semibold tracking-[0.24em]"
        style={{ backgroundColor: theme.background, color: theme.foreground }}
      >
        {badge}
      </div>
    </div>
  );
}

export default function ClusterItemCard({ item, index }) {
  const { theme } = useTheme();
  const badge = getBadge(item?.contentType || item?.type);
  const imageSrc = item?.image || item?.thumbnail || item?.file?.fileUrl;

  return (
    <article className="group">
      <div
        className="relative mb-5 aspect-[0.82] overflow-hidden"
        style={{ backgroundColor: theme.panelOuter, border: `1px solid ${theme.lowBorder}` }}
      >
        {imageSrc ? (
          <div className="flex h-full w-full items-center justify-center p-4" style={{ backgroundColor: theme.panelOuter }}>
            <img
              src={imageSrc}
              alt={item?.title || "Cluster item"}
              className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.03]"
            />
          </div>
        ) : (
          <ClusterArtwork index={index} badge={badge} theme={theme} />
        )}

        {imageSrc ? (
          <div
            className="absolute left-5 top-5 px-4 py-2 text-[10px] font-semibold tracking-[0.24em]"
            style={{ backgroundColor: theme.background, color: theme.foreground }}
          >
            {badge}
          </div>
        ) : null}
      </div>

      <h3
        className="max-w-[14ch] text-[clamp(1.45rem,1.7vw,1.9rem)] font-black leading-[1.06] tracking-[-0.05em]"
        style={{ color: theme.heading }}
      >
        {getDisplayTitle(item?.title, 46)}
      </h3>

      <p className="mt-3 text-[11px] tracking-[0.24em]" style={{ color: theme.muted }}>
        {getMeta(item)}
      </p>
    </article>
  );
}
