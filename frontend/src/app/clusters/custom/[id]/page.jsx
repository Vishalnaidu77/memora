'use client'

import Link from "next/link";
import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from "../../../components/Button";
import { useTheme } from "../../../ThemeContext";
import { getCollectionById } from "../../../services/collections.api";
import useItem from "../../../hooks/useItem";
import ClusterItemCard from "../../components/ClusterItemCard";
import AddClusterItemsModal from "./components/AddClusterItemsModal";

export default function Page({ params }) {
  const { theme } = useTheme();
  const { id } = use(params);
  const {
    allItems,
    handleGetCollections,
    handleGetItems,
    handleUpdateItem,
    loading: globalLoading,
  } = useItem();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssigningItems, setIsAssigningItems] = useState(false);
  const [toast, setToast] = useState(null);
  const initialItemsLoadRef = useRef(false);

  const loadCollection = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getCollectionById(id);
      setCollection(res.collection ?? null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load custom cluster.");
      setCollection(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCollection();
  }, [loadCollection]);

  useEffect(() => {
    if (initialItemsLoadRef.current) return;

    initialItemsLoadRef.current = true;

    if (!allItems?.length) {
      handleGetItems().catch((err) => {
        console.error("Failed to load saved items for cluster assignment", err);
      });
    }
  }, [allItems?.length, handleGetItems]);

  useEffect(() => {
    if (!toast) return;

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 3200);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const clusterItems = useMemo(() => collection?.items ?? [], [collection?.items]);

  const handleAddSavedItems = async (itemIds) => {
    if (!itemIds?.length) return;

    setIsAssigningItems(true);

    try {
      await Promise.all(
        itemIds.map((itemId) =>
          handleUpdateItem(itemId, { collectionId: id })
        )
      );

      await Promise.allSettled([handleGetCollections(), handleGetItems(), loadCollection()]);
      setIsAddModalOpen(false);
      setToast({
        title: "Items added",
        message: `${itemIds.length} saved item${itemIds.length === 1 ? "" : "s"} added to this custom cluster.`,
      });
    } finally {
      setIsAssigningItems(false);
    }
  };

  return (
    <main
      className="min-h-[calc(100vh-81px)] px-6 py-10 md:px-8"
      style={{ backgroundColor: theme.background, color: theme.foreground }}
    >
      <section className="mx-auto max-w-[1600px]">
        <Link
          href="/clusters"
          className="inline-flex border-b pb-2 text-[11px] font-semibold tracking-[0.24em]"
          style={{ borderColor: theme.lowBorder, color: theme.muted }}
        >
          BACK TO CLUSTERS
        </Link>

        {toast ? (
          <div
            className="fixed right-6 top-60 z-50 w-[min(92vw,360px)] border px-4 py-3"
            style={{
              backgroundColor: theme.panelOuter,
              color: theme.foreground,
              borderColor: theme.lowBorder,
              boxShadow: `0 24px 80px ${theme.shadow}`,
            }}
          >
            <p className="text-[11px] tracking-[0.28em]" style={{ color: theme.muted }}>
              {toast.title}
            </p>
            <p className="mt-2 text-sm leading-6" style={{ color: theme.hint }}>
              {toast.message}
            </p>
          </div>
        ) : null}

        {loading ? (
          <div className="mt-16 text-[11px] tracking-[0.35em]" style={{ color: theme.muted }}>
            LOADING CUSTOM CLUSTER...
          </div>
        ) : error ? (
          <div
            className="mt-10 px-6 py-5 text-sm"
            style={{
              backgroundColor: theme.panelInner,
              border: `1px solid ${theme.lowBorder}`,
              color: theme.hint,
            }}
          >
            {error}
          </div>
        ) : collection ? (
          <>
            <div
              className="mt-10 flex flex-col gap-6 border-b pb-8 md:flex-row md:items-end md:justify-between"
              style={{ borderColor: theme.lowBorder }}
            >
              <div>
                <p className="text-[11px] tracking-[0.34em]" style={{ color: theme.muted }}>
                  CUSTOM CLUSTER
                </p>
                <h1
                  className="mt-4 text-[clamp(2.6rem,5vw,4.6rem)] font-black leading-[0.92] tracking-[-0.07em]"
                  style={{ color: theme.heading }}
                >
                  {collection?.name}
                </h1>
                <p className="mt-6 max-w-3xl text-base leading-8" style={{ color: theme.hint }}>
                  {collection?.description || "Manual cluster ready for your saved items."}
                </p>
              </div>

              <Button
                theme={theme}
                variant="secondary"
                className="px-6 py-3 text-[11px] font-bold tracking-[0.28em] absolute right-10 top-72"
                onClick={() => setIsAddModalOpen(true)}
                disabled={globalLoading || isAssigningItems}
              >
                ADD SAVED ITEMS
              </Button>
            </div>

            {clusterItems.length ? (
              <div className="mt-12 grid gap-x-10 gap-y-16 md:grid-cols-2 2xl:grid-cols-4">
                {clusterItems.map((item, itemIndex) => (
                  <ClusterItemCard
                    key={item?._id || `${collection?._id}-${itemIndex}`}
                    item={item}
                    index={itemIndex}
                    onDeleted={loadCollection}
                  />
                ))}
              </div>
            ) : (
              <div
                className="mt-12 flex min-h-[320px] flex-col items-center justify-center text-center"
                style={{
                  border: `1px dashed ${theme.lowBorder}`,
                  backgroundColor: theme.panelInner,
                }}
              >
                <p className="text-[11px] tracking-[0.42em]" style={{ color: theme.muted }}>
                  NO ITEMS IN THIS CLUSTER
                </p>
                <p className="mt-4 max-w-md text-base" style={{ color: theme.hint }}>
                  Use the `ADD SAVED ITEMS` button to pull items from your library into this custom cluster.
                </p>
              </div>
            )}

            <AddClusterItemsModal
              open={isAddModalOpen}
              items={allItems}
              collectionId={id}
              onClose={() => setIsAddModalOpen(false)}
              onSubmit={handleAddSavedItems}
              loading={isAssigningItems}
              theme={theme}
            />
          </>
        ) : null}
      </section>
    </main>
  );
}
