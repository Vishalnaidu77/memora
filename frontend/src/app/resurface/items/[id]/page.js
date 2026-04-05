'use client'

import Link from "next/link";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "../../../ThemeContext";
import useItem from "../../../hooks/useItem";
import { getBadge, getMeta, getRelativeSavedLabel } from "../../../library/utils";
import ItemHighlightsSection from "../../../components/ItemHighlightsSection";
import CustomSelect from "../../../components/CustomSelect";
import Button from "../../../components/Button";

function DetailRow({ label, value, theme }) {
  if (!value) return null;

  return (
    <div
      className="flex flex-col gap-2 border-t py-5 md:grid md:grid-cols-[160px,1fr] md:items-start"
      style={{ borderColor: theme.lowBorder }}
    >
      <p className="text-[11px] tracking-[0.28em]" style={{ color: theme.muted }}>
        {label}
      </p>
      <p className="text-base leading-7" style={{ color: theme.foreground }}>
        {value}
      </p>
    </div>
  );
}

export default function Page({ params }) {
  const { theme } = useTheme();
  const {
    allItems,
    collections,
    handleGetItems,
    handleGetCollections,
    handleUpdateItem,
    loading,
  } = useItem();
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [isSavingCluster, setIsSavingCluster] = useState(false);
  const [clusterNotice, setClusterNotice] = useState("");
  const initialLoadRef = useRef(false);

  const { id } = use(params)

  useEffect(() => {
    if (initialLoadRef.current) return;

    initialLoadRef.current = true;

    handleGetItems().catch((error) => {
      console.error("Failed to load library items", error);
    });

    handleGetCollections().catch((error) => {
      console.error("Failed to load custom clusters", error);
    });
  }, [handleGetCollections, handleGetItems]);

  const item = useMemo(() => {
    return allItems.find((entry) => String(entry?._id || entry?.id) === String(id));
  }, [allItems, id]);

  const currentCollectionId = item?.collectionId?._id || item?.collectionId || "";

  useEffect(() => {
    setSelectedCollectionId(currentCollectionId ? String(currentCollectionId) : "");
  }, [currentCollectionId]);

  const handleCollectionUpdate = async () => {
    if (!item?._id) return;

    setIsSavingCluster(true);

    try {
      await handleUpdateItem(item._id, {
        collectionId: selectedCollectionId || null,
      });

      setClusterNotice(
        selectedCollectionId
          ? "Custom cluster updated."
          : "Item removed from its custom cluster."
      );
      await handleGetCollections();
    } finally {
      setIsSavingCluster(false);
    }
  };

  const imageSrc = item?.image || item?.thumbnail || item?.file?.fileUrl;
  const itemType = item?.contentType || item?.type;
  const externalUrl = item?.url || item?.sourceUrl || item?.link;
  const detailText =
    item?.summary ||
    item?.description ||
    item?.excerpt ||
    item?.text ||
    item?.content ||
    item?.notes ||
    "";

  if (loading && !item) {
    return (
      <main
        className="min-h-[calc(100vh-81px)] px-6 py-16 md:px-8"
        style={{ backgroundColor: theme.background, color: theme.foreground }}
      >
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] tracking-[0.35em]" style={{ color: theme.muted }}>
            LOADING ITEM DETAILS...
          </p>
        </div>
      </main>
    );
  }

  if (!item) {
    return (
      <main
        className="min-h-[calc(100vh-81px)] px-6 py-16 md:px-8"
        style={{ backgroundColor: theme.background, color: theme.foreground }}
      >
        <div className="mx-auto max-w-6xl">
          <Link
            href="/resurface"
            className="inline-flex border-b pb-2 text-[11px] font-semibold tracking-[0.24em]"
            style={{ borderColor: theme.lowBorder, color: theme.muted }}
          >
            BACK TO RESURFACE
          </Link>

          <div
            className="mt-10 flex min-h-80 flex-col items-center justify-center text-center"
            style={{
              border: `1px dashed ${theme.lowBorder}`,
              backgroundColor: theme.panelInner,
            }}
          >
            <p className="text-[11px] tracking-[0.42em]" style={{ color: theme.muted }}>
              ITEM NOT FOUND
            </p>
            <p className="mt-4 max-w-md text-base" style={{ color: theme.hint }}>
              The selected item could not be found in your current library.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-[calc(100vh-81px)]"
      style={{ backgroundColor: theme.background, color: theme.foreground }}
    >
      <section className="mx-auto max-w-400 px-6 py-10 md:px-8">
        <Link
          href="/resurface"
          className="inline-flex border-b pb-2 text-[11px] font-semibold tracking-[0.24em]"
          style={{ borderColor: theme.lowBorder, color: theme.muted }}
        >
          BACK TO RESURFACE
        </Link>

        <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-start">
          <div
            className="overflow-hidden lg:sticky lg:top-24 lg:w-[40%] lg:shrink-0"
            style={{ backgroundColor: theme.panelOuter, border: `1px solid ${theme.lowBorder}` }}
          >
            {imageSrc ? (
              <div
                className="flex min-h-80 items-center justify-center p-4 md:min-h-115"
                style={{ backgroundColor: theme.panelOuter }}
              >
                <img
                  src={imageSrc}
                  alt={item?.title || "Library item"}
                  className="max-h-[72vh] w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex min-h-80 items-center justify-center p-8 text-center md:min-h-115">
                <div>
                  <p className="text-[11px] tracking-[0.35em]" style={{ color: theme.muted }}>
                    {getBadge(itemType)}
                  </p>
                  <p className="mt-4 text-base" style={{ color: theme.hint }}>
                    No preview available for this item.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="min-w-0 lg:flex-1">
            <p className="text-[11px] tracking-[0.34em]" style={{ color: theme.muted }}>
              {getRelativeSavedLabel(item)}
            </p>

            <h1
              className="mt-5 wrap-break-word text-[clamp(2rem,4.5vw,4.8rem)] font-black leading-[0.92] tracking-[-0.06em]"
              style={{ color: theme.heading }}
            >
              {item?.title || "Untitled item"}
            </h1>

            <div className="mt-6 max-w-3xl max-h-75 overflow-y-auto pr-2">
              <p className="wrap-break-word text-base leading-8" style={{ color: theme.hint }}>
                {detailText || "This item was saved to your library and is ready for review."}
              </p>
            </div>

            <div
              className="mt-8 grid gap-4 border-y py-6 text-sm md:grid-cols-2"
              style={{ borderColor: theme.lowBorder }}
            >
              <div>
                <p className="text-[11px] tracking-[0.28em]" style={{ color: theme.muted }}>
                  TYPE
                </p>
                <p className="mt-2 text-base" style={{ color: theme.foreground }}>
                  {getBadge(itemType)}
                </p>
              </div>
              <div>
                <p className="text-[11px] tracking-[0.28em]" style={{ color: theme.muted }}>
                  META
                </p>
                <p className="mt-2 text-base" style={{ color: theme.foreground }}>
                  {getMeta(item)}
                </p>
              </div>
            </div>

            <DetailRow label="Author" value={item?.author} theme={theme} />
            <DetailRow label="Read Time" value={item?.readTime} theme={theme} />
            <DetailRow label="Duration" value={item?.duration} theme={theme} />
            <DetailRow label="Pages" value={item?.pages} theme={theme} />

            <div
              className="border-t py-5 md:grid md:grid-cols-[160px,1fr] md:items-start"
              style={{ borderColor: theme.lowBorder }}
            >
              <p className="text-[11px] tracking-[0.28em]" style={{ color: theme.muted }}>
                Custom Cluster
              </p>
              <div className="mt-3">
                <CustomSelect
                  id="item-collection"
                  value={selectedCollectionId}
                  onChange={(event) => {
                    setSelectedCollectionId(event.target.value);
                    setClusterNotice("");
                  }}
                  theme={theme}
                >
                  <option value="">No custom cluster</option>
                  {collections.map((collection) => (
                    <option key={collection?._id} value={collection?._id}>
                      {collection?.name}
                    </option>
                  ))}
                </CustomSelect>

                <div className="mt-4">
                  <Button
                    theme={theme}
                    variant="secondary"
                    className="text-[11px] tracking-[0.22em]"
                    onClick={handleCollectionUpdate}
                    disabled={isSavingCluster}
                  >
                    {isSavingCluster ? "Saving..." : "Save Cluster"}
                  </Button>
                </div>

                {clusterNotice ? (
                  <p className="mt-3 text-sm" style={{ color: theme.hint }}>
                    {clusterNotice}
                  </p>
                ) : null}
              </div>
            </div>

            {externalUrl ? (
              <div
                className="border-t py-5 md:grid md:grid-cols-[160px,1fr] md:items-start"
                style={{ borderColor: theme.lowBorder }}
              >
                <p className="text-[11px] tracking-[0.28em]" style={{ color: theme.muted }}>
                  Source
                </p>
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-base underline underline-offset-4"
                  style={{ color: theme.foreground }}
                >
                  {externalUrl}
                </a>
              </div>
            ) : null}

            {item?.file?.fileUrl ? (
              <div
                className="border-t py-5 md:grid md:grid-cols-[160px,1fr] md:items-start"
                style={{ borderColor: theme.lowBorder }}
              >
                <p className="text-[11px] tracking-[0.28em]" style={{ color: theme.muted }}>
                  File
                </p>
                <a
                  href={item.file.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-base underline underline-offset-4"
                  style={{ color: theme.foreground }}
                >
                  Open saved file
                </a>
              </div>
            ) : null}
          </div>
        </div>

        <ItemHighlightsSection item={item} theme={theme} />
      </section>
    </main>
  );
}
