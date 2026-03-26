import Link from "next/link";
import { useTheme } from "../../ThemeContext";
import { FALLBACK_BACKGROUNDS } from "../constants";
import { getBadge, getDisplayTitle, getMeta } from "../utils";
import { useRouter } from "next/navigation";

function PlaceholderArtwork({ index, badge, theme }) {
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
      <div
        className="absolute left-5 top-5 px-4 py-2 text-[10px] font-semibold tracking-[0.24em]"
        style={{ backgroundColor: theme.background, color: theme.foreground }}
      >
        {badge}
      </div>
    </div>
  );
}

export default function ItemCard({ item, index }) {
  const { theme } = useTheme();
  const badge = getBadge(item?.type);
  const imageSrc = item?.image || item?.thumbnail;
  const router = useRouter()

  return (
    <article className="group" onClick={() => router.push(`/library/items/${item._id}`)}>
      <div
        className="relative mb-6 aspect-[0.76] overflow-hidden"
        style={{ backgroundColor: theme.panelOuter, border: `1px solid ${theme.lowBorder}` }}
      >
        {imageSrc ? (
          <div className="flex h-full w-full items-center justify-center p-4" style={{ backgroundColor: theme.panelOuter }}>
            <img
              src={imageSrc}
              alt={item?.title || "Library item"}
              className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.03]"
            />
          </div>
        ) : (
          <PlaceholderArtwork index={index} badge={badge} theme={theme} />
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
        className="max-w-[13ch] text-[clamp(1.65rem,2vw,2.1rem)] font-black leading-[1.06] tracking-[-0.05em]"
        style={{ color: theme.heading }}
      >
        {getDisplayTitle(item?.title, 54)}
      </h3>

      <p className="mt-4 text-[11px] tracking-[0.24em]" style={{ color: theme.muted }}>{getMeta(item)}</p>
    </article>
  );
}
