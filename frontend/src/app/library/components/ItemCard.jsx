import Button from "../../components/Button";
import { useTheme } from "../../ThemeContext";
import { FALLBACK_BACKGROUNDS } from "../constants";
import { getBadge, getDisplayTitle, getMeta } from "../utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const router = useRouter();
  const [isHover, setIsHover] = useState(false);

  return (
    <article className="group" >
      <div
        className="relative mb-6 aspect-[0.76] overflow-hidden"
        style={{ backgroundColor: theme.panelOuter, border: `1px solid ${theme.lowBorder}` }}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        {imageSrc ? (
          <>
            <div
              className="relative flex h-full w-full items-center justify-center p-4 cursor-pointer"
              style={{ backgroundColor: theme.panelOuter }}
            >
              <img
                src={imageSrc}
                alt={item?.title || "Library item"}
                className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.03]"
              />
            </div>
            <div
              className={`pointer-events-none absolute top-0 h-full w-full flex justify-center items-center gap-2 bg-black/40 transition-all ${
                isHover ? "opacity-100" : "opacity-0"
              } duration-500`}
            >
               <div className={`center-btns flex  gap-4 pointer-events-auto `}>
                  <Button theme={theme} variant="secondary" className="text-[10px] bg-white text-black tracking-[0.18em]" onClick={() =>  router.push(`/library/items/${item._id}`)}>
                    Check Items
                  </Button>
                  <Button theme={theme} variant="secondary" className="text-[10px] bg-white text-black tracking-[0.18em]">
                    <a href={item.url} target="_blank">Item source</a>
                  </Button>
                </div>
              </div>
           
              <button className="dlt-btn"></button>
          </>
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

      <p className="mt-4 text-[11px] tracking-[0.24em]" style={{ color: theme.muted }}>
        {getMeta(item)}
      </p>
    </article>
  );
}
