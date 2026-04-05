'use client'

import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { useTheme } from "../../../ThemeContext";
import { getClusterById } from "../../../services/items.api";
import ClusterItemCard from "../../components/ClusterItemCard";

export default function Page({ params }) {
  const { theme } = useTheme();
  const { id } = use(params);
  const [cluster, setCluster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCluster = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getClusterById(id);
      setCluster(res.cluster ?? null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load AI cluster.");
      setCluster(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCluster();
  }, [loadCluster]);

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

        {loading ? (
          <div className="mt-16 text-[11px] tracking-[0.35em]" style={{ color: theme.muted }}>
            LOADING AI CLUSTER...
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
        ) : cluster ? (
          <>
            <div className="mt-10 border-b pb-8" style={{ borderColor: theme.lowBorder }}>
              <p className="text-[11px] tracking-[0.34em]" style={{ color: theme.muted }}>
                AI CLUSTER
              </p>
              <h1
                className="mt-4 text-[clamp(2.6rem,5vw,4.6rem)] font-black leading-[0.92] tracking-[-0.07em]"
                style={{ color: theme.heading }}
              >
                {cluster?.topicLabel}
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8" style={{ color: theme.hint }}>
                These items were grouped together by Memora because at least two saved items showed strong semantic similarity.
              </p>
              <p className="mt-6 text-[11px] tracking-[0.28em]" style={{ color: theme.muted }}>
                {cluster?.count || cluster?.items?.length || 0} SAVED OBJECT{(cluster?.count || cluster?.items?.length || 0) === 1 ? "" : "S"}
              </p>
            </div>

            {cluster?.items?.length ? (
              <div className="mt-12 grid gap-x-10 gap-y-16 md:grid-cols-2 2xl:grid-cols-4">
                {cluster.items.map((item, itemIndex) => (
                  <ClusterItemCard
                    key={item?._id || `${cluster?.clusterId}-${itemIndex}`}
                    item={item}
                    index={itemIndex}
                    onDeleted={loadCluster}
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
                  Refresh AI clustering again after you save more related items.
                </p>
              </div>
            )}
          </>
        ) : null}
      </section>
    </main>
  );
}
