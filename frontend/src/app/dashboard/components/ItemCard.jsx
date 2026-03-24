import { FALLBACK_BACKGROUNDS } from "../constants";
import { getBadge, getDisplayTitle, getMeta } from "../utils";

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

export default function ItemCard({ item, index }) {
  const badge = getBadge(item?.type);
  const imageSrc = item?.image || item?.thumbnail;

  return (
    <article className="group">
      <div className="relative mb-6 aspect-[0.76] overflow-hidden bg-[#111]">
        {imageSrc ? (
          <div className="flex h-full w-full items-center justify-center bg-[#111] p-4">
            <img
              src={imageSrc}
              alt={item?.title || "Library item"}
              className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.03]"
            />
          </div>
        ) : (
          <PlaceholderArtwork index={index} badge={badge} />
        )}

        {imageSrc ? (
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
