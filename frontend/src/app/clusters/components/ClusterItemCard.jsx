'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdDeleteOutline } from "react-icons/md";
import Button from "../../components/Button";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import useItem from "../../hooks/useItem";
import { useTheme } from "../../ThemeContext";
import { FALLBACK_BACKGROUNDS } from "../../library/constants";
import { getBadge, getDisplayTitle, getMeta } from "../../library/utils";

function HoverActions({ item, isVisible, onOpenItem, onDelete, theme }) {
  const externalUrl =
    item?.file?.fileUrl ||
    item?.url ||
    item?.sourceUrl ||
    item?.link ||
    item?.image ||
    item?.thumbnail;

  return (
    <div
      className={`pointer-events-none absolute top-0 z-50 flex h-full w-full items-center justify-center gap-2 bg-black/40 transition-all duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-4 px-4">
        <Button
          theme={theme}
          variant="secondary"
          className="text-[10px] bg-white text-black tracking-[0.18em]"
          onClick={onOpenItem}
        >
          Check item
        </Button>

        {externalUrl ? (
          <Button
            theme={theme}
            variant="secondary"
            className="text-[10px] bg-white text-black tracking-[0.18em]"
            onClick={() => window.open(externalUrl, "_blank", "noopener,noreferrer")}
          >
            Item source
          </Button>
        ) : null}
      </div>

      <button
        className="absolute right-5 top-5 pointer-events-auto cursor-pointer text-xl duration-200 hover:text-red-600"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onDelete();
        }}
      >
        <MdDeleteOutline />
      </button>
    </div>
  );
}

function ClusterArtwork({ index, badge, theme, item, isHover, onOpenItem, onDelete }) {
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

      <HoverActions
        item={item}
        isVisible={isHover}
        onOpenItem={onOpenItem}
        onDelete={onDelete}
        theme={theme}
      />
    </div>
  );
}

export default function ClusterItemCard({ item, index, onDeleted }) {
  const { theme } = useTheme();
  const router = useRouter();
  const { handleDeleteItem, handleGetClusters, handleGetCollections, handleGetItems } = useItem();
  const [isHover, setIsHover] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const badge = getBadge(item?.contentType || item?.type);
  const imageSrc = item?.image || item?.thumbnail || item?.file?.fileUrl;
  const itemId = item?._id || item?.id;

  const openItemDetail = () => {
    if (!itemId) return;
    router.push(`/clusters/${itemId}`);
  };

  const handleDelete = async () => {
    if (!itemId) return;

    setIsDeleting(true);

    try {
      const deletedItem = await handleDeleteItem(itemId);
      setShowDeleteModal(false);
      await Promise.allSettled([handleGetClusters(), handleGetCollections(), handleGetItems()]);
      onDeleted?.(deletedItem || item);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <article
        className="group"
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <div
          className="relative mb-5 aspect-[0.82] overflow-hidden"
          style={{ backgroundColor: theme.panelOuter, border: `1px solid ${theme.lowBorder}` }}
        >
          {imageSrc ? (
            <>
              <div
                className="flex h-full w-full items-center justify-center p-4"
                style={{ backgroundColor: theme.panelOuter }}
              >
                <img
                  src={imageSrc}
                  alt={item?.title || "Cluster item"}
                  className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.03]"
                />
              </div>

              <HoverActions
                item={item}
                isVisible={isHover}
                onOpenItem={openItemDetail}
                onDelete={() => setShowDeleteModal(true)}
                theme={theme}
              />
            </>
          ) : (
            <ClusterArtwork
              index={index}
              badge={badge}
              theme={theme}
              item={item}
              isHover={isHover}
              onOpenItem={openItemDetail}
              onDelete={() => setShowDeleteModal(true)}
            />
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

      <DeleteConfirmModal
        theme={theme}
        open={showDeleteModal}
        title="Delete this item?"
        message={`"${item?.title || "Untitled item"}" will be removed from this cluster and your library.`}
        onCancel={() => !isDeleting && setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  );
}
