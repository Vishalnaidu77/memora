'use client'

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../components/Button";
import { useTheme } from "../ThemeContext";
import useItem from "../hooks/useItem";
import CreateCollectionModal from "../library/components/CreateCollectionModal";
import ClusterGroupCard from "./components/ClusterGroupCard";

const CollectionPage = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const {
    clusterGroups,
    collections,
    handleGenerateClusters,
    handleGetClusters,
    handleGetCollections,
    loading,
  } = useItem();
  const [error, setError] = useState("");
  const [createCollectionOpen, setCreateCollectionOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const initialLoadRef = useRef(false);

  useEffect(() => {
    if (initialLoadRef.current) return;

    initialLoadRef.current = true;

    const loadClusters = async () => {
      try {
        setError("");
        await Promise.allSettled([handleGetClusters(), handleGetCollections()]);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load clusters.");
      }
    };

    loadClusters();
  }, [handleGetClusters, handleGetCollections]);

  useEffect(() => {
    if (!toast) return;

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 3200);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const onRefreshClusters = async () => {
    try {
      setError("");
      await handleGenerateClusters();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to generate clusters.");
    }
  };

  const handleCollectionCreated = (collection) => {
    if (!collection?._id) return;

    setToast({
      title: "Cluster created",
      message: `"${collection.name}" is ready for manual organization.`,
    });
  };

  const customClusters = useMemo(() => collections.filter(Boolean), [collections]);
  const aiClusters = useMemo(() => clusterGroups.filter((cluster) => (cluster?.count || 0) >= 2), [clusterGroups]);

  return (
    <main
      className="min-h-[calc(100vh-81px)]"
      style={{ backgroundColor: theme.background, color: theme.foreground }}
    >
      <section className="mx-auto max-w-[1600px] px-6 py-8 pb-10 md:px-8">
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
          <div>
            <p className="text-[11px] tracking-[0.34em]" style={{ color: theme.muted }}>
              SEMANTIC MAP
            </p>
            <h1 className="mt-6 text-[clamp(4rem,9vw,6.8rem)] font-black leading-[0.9] tracking-[-0.08em]">
              CLUSTERS
            </h1>
          </div>
        </div>

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

        {error ? (
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
        ) : null}

        <section className="mt-16 border-y py-8" style={{ borderColor: theme.lowBorder }}>
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] tracking-[0.34em]" style={{ color: theme.muted }}>
                YOUR CLUSTERS
              </p>
              <h2
                className="mt-4 text-[clamp(1rem,3vw,2rem)] font-black leading-[0.96] tracking-[-0.06em]"
                style={{ color: theme.heading }}
              >
                Manual clusters you control.
              </h2>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {customClusters.length ? (
              customClusters.map((collection) => (
                <ClusterGroupCard
                  key={collection?._id}
                  eyebrow="CUSTOM CLUSTER"
                  title={collection?.name}
                  description={collection?.description || "Manual cluster ready for your saved items."}
                  onClick={() => router.push(`/clusters/custom/${collection?._id}`)}
                  theme={theme}
                />
              ))
            ) : (
              <div
                className="md:col-span-2 xl:col-span-3 flex min-h-[220px] flex-col items-center justify-center text-center"
                style={{
                  border: `1px dashed ${theme.lowBorder}`,
                  backgroundColor: theme.panelInner,
                }}
              >
                <p className="text-[11px] tracking-[0.42em]" style={{ color: theme.muted }}>
                  NO CUSTOM CLUSTERS YET
                </p>
                <p className="mt-4 max-w-md text-base" style={{ color: theme.hint }}>
                  Create a manual cluster here, then assign items to it from the library save flow or item detail screen.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-20">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] tracking-[0.34em]" style={{ color: theme.muted }}>
                AI CLUSTERS
              </p>
              <h2
                className="mt-4 text-[clamp(1rem,3vw,2rem)] font-black leading-[0.96] tracking-[-0.06em]"
                style={{ color: theme.heading }}
              >
                Related clusters generated by Memora.
              </h2>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {loading && !aiClusters.length ? (
              <div className="py-24 text-[11px] tracking-[0.35em]" style={{ color: theme.muted }}>
                LOADING AI CLUSTERS...
              </div>
            ) : aiClusters.length ? (
              aiClusters.map((cluster, clusterIndex) => (
                <ClusterGroupCard
                  key={cluster.clusterId}
                  eyebrow={`AI TOPIC ${String(clusterIndex + 1).padStart(2, "0")}`}
                  title={cluster.topicLabel}
                  description={`Open this topic cluster to view ${cluster.count} saved item${cluster.count === 1 ? "" : "s"} related to each other.`}
                  onClick={() => router.push(`/clusters/ai/${cluster.clusterId}`)}
                  theme={theme}
                />
              ))
            ) : (
              <div
                className="md:col-span-2 xl:col-span-3 flex min-h-[220px] flex-col items-center justify-center text-center"
                style={{
                  border: `1px dashed ${theme.lowBorder}`,
                  backgroundColor: theme.panelInner,
                }}
              >
                <p className="text-[11px] tracking-[0.42em]" style={{ color: theme.muted }}>
                  NO AI CLUSTERS YET
                </p>
                <p className="mt-4 max-w-md text-base" style={{ color: theme.hint }}>
                  Save at least two related items, then run refresh so AI can group them into a topic cluster.
                </p>
              </div>
            )}
          </div>
        </section>

        <footer
          className="mt-24 border-t pt-8 text-[11px] tracking-[0.32em]"
          style={{ borderColor: theme.lowBorder, color: theme.muted }}
        >
          2024 MEMORA. ALL RIGHTS RESERVED.
        </footer>

        <CreateCollectionModal
          open={createCollectionOpen}
          onClose={() => setCreateCollectionOpen(false)}
          onCreated={handleCollectionCreated}
        />
      </section>
    </main>
  )
}

export default CollectionPage
