'use client'

import { useRouter } from "next/navigation";
import { useTheme } from "../../ThemeContext";
import { FALLBACK_BACKGROUNDS } from "../../library/constants";
import { getBadge, getDisplayTitle, getMeta, getRelativeSavedLabel } from "../../library/utils";
import Button from "../../components/Button";
import { useState } from "react";
import useItem from "../../hooks/useItem";
import { MdDeleteOutline } from "react-icons/md";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";

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
  const router = useRouter();

  const [isHover, setIsHover] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { handleDeleteItem, handleGetItems } = useItem();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await handleDeleteItem(item._id);
      await handleGetItems();
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <article className="group">
        <div
          className="relative mb-6 aspect-[0.82] overflow-hidden"
          style={{ backgroundColor: theme.panelOuter, border: `1px solid ${theme.lowBorder}` }}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
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
              <div
                className={`pointer-events-none absolute inset-0 z-50 flex items-center justify-center gap-2 bg-black/40 transition-all duration-500 ${
                  isHover ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="center-btns flex gap-4 pointer-events-auto">
                  <Button
                    theme={theme}
                    variant="secondary"
                    className="text-[10px] bg-white text-black tracking-[0.18em]"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/resurface/items/${item._id}`);
                    }}
                  >
                    Check Items
                  </Button>
                  <Button
                    theme={theme}
                    variant="secondary"
                    className="text-[10px] bg-white text-black tracking-[0.18em]"
                  >
                    <a
                      href={item.file ? item.file.fileUrl || item.image : item.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Item source
                    </a>
                  </Button>
                </div>
                <button
                  className="dlt-btn absolute top-5 right-5 pointer-events-auto cursor-pointer duration-200 hover:text-red-600"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDeleteModal(true);
                  }}
                >
                  <MdDeleteOutline />
                </button>
              </div>
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
      <DeleteConfirmModal
        theme={theme}
        open={showDeleteModal}
        title="Delete this item?"
        message={`"${item?.title || "Untitled item"}" will be removed from your library.`}
        onCancel={() => !isDeleting && setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  );
}
