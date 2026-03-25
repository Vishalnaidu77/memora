'use client'

import { useEffect, useState } from "react";
import Button from "../components/Button";
import { useTheme } from "../ThemeContext";
import useItem from "../hooks/useItem";
import ClusterItemCard from "./components/ClusterItemCard";

const CollectionPage = () => {
  const { theme } = useTheme();
  const { clusterGroups, handleGenerateClusters, handleGetClusters, loading } = useItem();
  const [error, setError] = useState("");

  useEffect(() => {
    const loadClusters = async () => {
      try {
        setError("");
        await handleGetClusters();
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load clusters.");
      }
    };

    loadClusters();
  }, []);

  const onRefreshClusters = async () => {
    try {
      setError("");
      await handleGenerateClusters();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to generate clusters.");
    }
  };

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
            <p className="mt-8 max-w-2xl text-base leading-8" style={{ color: theme.hint }}>
              Memora groups related saved objects into topic shelves using embeddings, DBSCAN,
              and AI-generated topic labels. Refresh the map whenever you want a new read of your archive.
            </p>
          </div>

          <aside
            className="min-w-0 overflow-hidden p-8 sm:p-10"
            style={{
              backgroundColor: theme.panelOuter,
              color: theme.foreground,
              border: `1px solid ${theme.lowBorder}`,
            }}
          >
            <p className="text-[11px] tracking-[0.42em]" style={{ color: theme.muted }}>
              TOPIC SIGNAL
            </p>
            <h2 className="mt-6 max-w-[11ch] text-[clamp(2.2rem,3vw,3.35rem)] font-black leading-[1.02] tracking-[-0.06em] break-words">
              {clusterGroups.length
                ? `${clusterGroups.length} topic groups are active.`
                : "Your archive is ready for its first cluster pass."}
            </h2>
            <p className="mt-8 max-w-[28ch] text-[1.05rem] leading-8" style={{ color: theme.hint }}>
              Clusters reveal the themes hidden across your saved items so the archive feels organized by meaning, not only by date.
            </p>
            <div className="mt-8">
              <Button
                onClick={onRefreshClusters}
                theme={theme}
                variant="secondary"
                disabled={loading}
                className="w-full py-3 text-[11px] font-bold tracking-[0.28em]"
              >
                {loading ? "MAPPING TOPICS..." : "REFRESH CLUSTERS"}
              </Button>
            </div>
          </aside>
        </div>

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

        <div className="mt-20 space-y-20">
          {loading && !clusterGroups.length ? (
            <div className="py-24 text-[11px] tracking-[0.35em]" style={{ color: theme.muted }}>
              LOADING CLUSTERS...
            </div>
          ) : clusterGroups.length ? (
            clusterGroups.map((cluster, clusterIndex) => (
              <section key={cluster.clusterId}>
                <div
                  className="flex flex-col gap-6 border-b pb-8 md:flex-row md:items-end md:justify-between"
                  style={{ borderColor: theme.lowBorder }}
                >
                  <div>
                    <p className="text-[11px] tracking-[0.34em]" style={{ color: theme.muted }}>
                      TOPIC {String(clusterIndex + 1).padStart(2, "0")}
                    </p>
                    <h2
                      className="mt-4 text-[clamp(2.2rem,4vw,3.6rem)] font-black leading-[0.95] tracking-[-0.07em]"
                      style={{ color: theme.heading }}
                    >
                      {cluster.topicLabel}
                    </h2>
                  </div>
                  <p className="text-[11px] tracking-[0.32em]" style={{ color: theme.muted }}>
                    {cluster.count} SAVED OBJECT{cluster.count === 1 ? "" : "S"}
                  </p>
                </div>

                <div className="mt-10 grid gap-x-10 gap-y-16 md:grid-cols-2 2xl:grid-cols-4">
                  {cluster.items.map((item, itemIndex) => (
                    <ClusterItemCard
                      key={item?._id || `${cluster.clusterId}-${itemIndex}`}
                      item={item}
                      index={itemIndex}
                    />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div
              className="flex min-h-[320px] flex-col items-center justify-center text-center"
              style={{
                border: `1px dashed ${theme.lowBorder}`,
                backgroundColor: theme.panelInner,
              }}
            >
              <p className="text-[11px] tracking-[0.42em]" style={{ color: theme.muted }}>
                NO CLUSTERS YET
              </p>
              <p className="mt-4 max-w-md text-base" style={{ color: theme.hint }}>
                Save a few related items, then run cluster refresh to generate topic groups for your archive.
              </p>
            </div>
          )}
        </div>

        <footer
          className="mt-24 border-t pt-8 text-[11px] tracking-[0.32em]"
          style={{ borderColor: theme.lowBorder, color: theme.muted }}
        >
          2024 MEMORA. ALL RIGHTS RESERVED.
        </footer>
      </section>
    </main>
  )
}

export default CollectionPage
