'use client'

import Link from "next/link";
import { use, useEffect, useMemo } from "react";
import { useTheme } from "../../../ThemeContext";
import useItem from "../../../hooks/useItem";
import { getBadge, getMeta, getRelativeSavedLabel } from "../../utils";
import { MdDeleteOutline } from "react-icons/md";
import { useRouter } from "next/navigation";
import ItemHighlightsSection from "../../../components/ItemHighlightsSection";

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
  const { allItems, handleGetItems, handleDeleteItem, loading } = useItem();

  const { id } = use(params)

  useEffect(() => {
    if (!allItems?.length) {
      handleGetItems().catch((error) => {
        console.error("Failed to load library items", error);
      });
    }
  }, [allItems?.length, handleGetItems]);

  const item = useMemo(() => {
    return allItems.find((entry) => String(entry?._id || entry?.id) === String(id));
  }, [allItems, id]);

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
    

    const router = useRouter()

  const handleDelete = async (e) => {
    e.preventDefault()
    await handleDeleteItem(item?._id)
    router.push("/library")
  }

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
            href="/library"
            className="inline-flex border-b pb-2 text-[11px] font-semibold tracking-[0.24em]"
            style={{ borderColor: theme.lowBorder, color: theme.muted }}
          >
            BACK TO LIBRARY
          </Link>

          <div
            className="mt-10 flex min-h-[320px] flex-col items-center justify-center text-center"
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
      className="max-h-vh]"
      style={{ backgroundColor: theme.background, color: theme.foreground }}
    >
      <section className="mx-auto px-6 py-10 md:px-8">
        <div className="top-links flex items-center justify-between px-8">
          <Link
            href="/library"
            className="inline-flex border-b pb-2 text-[11px] font-semibold tracking-[0.24em]"
            style={{ borderColor: theme.lowBorder, color: theme.muted }}
          >
            BACK TO LIBRARY
          </Link>
          <button 
            className={`dlt-btn cursor-pointer text-2xl hover:text-red-600 duration-200`} 
            onClick={handleDelete}>
            <MdDeleteOutline  />
          </button>
        </div>

        <div className="mt-10 grid gap-10 md:flex grid-cols-[minmax(320px,420px),1fr]">
          <div
            className="overflow-hidden"
            style={{ backgroundColor: theme.panelOuter, border: `1px solid ${theme.lowBorder}` }}
          >
            {imageSrc ? (
              
                <img
                  src={imageSrc}
                  alt={item?.title || "Library item"}
                  className="h-full w-full object-cover"
                />
            ) : (
              <div className="flex aspect-[0.78] items-center justify-center p-8 text-center">
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

          <div>
            <p className="text-[11px] tracking-[0.34em]" style={{ color: theme.muted }}>
              {getRelativeSavedLabel(item)}
            </p>

            <h1
              className="mt-5 text-[clamp(2.4rem,5vw,4.8rem)] font-black leading-[0.92] tracking-[-0.07em]"
              style={{ color: theme.heading }}
            >
              {item?.title || "Untitled item"}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8" style={{ color: theme.hint }}>
              {detailText || "This item was saved to your library and is ready for review."}
            </p>

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
