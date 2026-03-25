'use client'

import { useTheme } from "../../ThemeContext";
import { FALLBACK_BACKGROUNDS } from "../../dashboard/constants";
import { getBadge, getDisplayTitle, getMeta, getRelativeSavedLabel } from "../../dashboard/utils";

function ResurfaceArtwork({ index, badge, theme }) {

  

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
              ? "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 100%)"
              : "linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0) 100%)",
        }}
      />
      <div
        className="absolute left-5 top-5 px-4 py-2 text-[10px] font-semibold tracking-[0.24em]"
        style={{ backgroundColor: theme.background, color: theme.foreground }}
      >
        {badge}
      </div>
      <p
        className="absolute bottom-5 left-5 text-[10px] tracking-[0.32em]"
        style={{ color: theme.muted }}
      >
        RESURFACED
      </p>
    </div>
  );
}

export default function ResurfaceCard({ item, index }) {
  const { theme } = useTheme();
  const badge = getBadge(item?.contentType || item?.type);
  const imageSrc = item?.image || item?.thumbnail || item?.file?.fileUrl;
  const detailLabel = getMeta(item).split(" - ")[1] || "ITEM";

   const createdAt = item?.createdAt ? new Date(item.createdAt) : null;

   const diff = Date.now() - createdAt.getTime()
   const days = 1000 * 60 * 60 * 24
   console.log(diff/days);

  return (
    <article className="group">
      <div
        className="relative mb-6 aspect-[0.82] overflow-hidden"
        style={{ backgroundColor: theme.panelOuter, border: `1px solid ${theme.lowBorder}` }}
      >
        {imageSrc ? (
          <div className="flex h-full w-full items-center justify-center p-4" style={{ backgroundColor: theme.panelOuter }}>
            <img
              src={imageSrc}
              alt={item?.title || "Resurfaced item"}
              className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.03]"
            />
          </div>
        ) : (
          <ResurfaceArtwork index={index} badge={badge} theme={theme} />
        )}

        {imageSrc ? (
          <>
            <div
              className="absolute left-5 top-5 px-4 py-2 text-[10px] font-semibold tracking-[0.24em]"
              style={{ backgroundColor: theme.background, color: theme.foreground }}
            >
              {badge}
            </div>
            <p
              className="absolute bottom-5 left-5 text-[10px] tracking-[0.32em]"
              style={{ color: theme.muted }}
            >
              RESURFACED
            </p>
          </>
        ) : null}
      </div>

      <h3
        className="max-w-[13ch] text-[clamp(1.7rem,2vw,2.2rem)] font-black leading-[1.04] tracking-[-0.05em]"
        style={{ color: theme.heading }}
      >
        {getDisplayTitle(item?.title, 56)}
      </h3>

      <p className="mt-4 text-[11px] tracking-[0.24em]" style={{ color: theme.muted }}>
        {`${getRelativeSavedLabel(item)} - ${detailLabel}`}
      </p>
    </article>
  );
}
