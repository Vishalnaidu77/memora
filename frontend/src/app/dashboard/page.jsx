'use client'

import { useEffect, useMemo, useState } from "react";
import DashboardHeader from "./components/DashboardHeader";
import DashboardHero from "./components/DashboardHero";
import DashboardSidebar from "./components/DashboardSidebar";
import ItemCard from "./components/ItemCard";
import useItem from "../hooks/useItem";

export default function DashboardPage() {
  const { allItems, handleGetItems, loading } = useItem();
  const [filter, setFilter] = useState("ALL OBJECTS");

  useEffect(() => {
    handleGetItems();
  }, []);

  const items = useMemo(() => allItems.flat().filter(Boolean), [allItems]);

  const filteredItems = useMemo(() => {
    if (filter === "ALL OBJECTS") return items;
    return items.filter((item) => item?.type === filter);
  }, [filter, items]);

  const featuredItem = filteredItems[0];
  const synthesisCount = filteredItems.length;

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white">
      <DashboardHeader />

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-12 px-6 py-8 md:px-8 xl:grid-cols-[260px_minmax(0,1fr)]">
        <DashboardSidebar />

        <section className="pb-10">
          <DashboardHero
            filter={filter}
            setFilter={setFilter}
            featuredItem={featuredItem}
            synthesisCount={synthesisCount}
          />

          <div className="mt-20">
            {loading ? (
              <div className="py-24 text-[11px] tracking-[0.35em] text-white/55">LOADING LIBRARY...</div>
            ) : filteredItems.length ? (
              <div className="grid gap-x-10 gap-y-20 md:grid-cols-2 2xl:grid-cols-4">
                {filteredItems.map((item, index) => (
                  <ItemCard
                    key={item?._id || item?.id || `${item?.title || "item"}-${index}`}
                    item={item}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="flex min-h-[320px] flex-col items-center justify-center border border-dashed border-white/10 bg-white/[0.02] text-center">
                <p className="text-[11px] tracking-[0.42em] text-white/50">NO ITEMS FOUND</p>
                <p className="mt-4 max-w-md text-base text-white/70">
                  Try another filter, or add a few saved objects to populate the library.
                </p>
              </div>
            )}
          </div>

          <footer className="mt-24 border-t border-white/10 pt-8 text-[11px] tracking-[0.32em] text-white/30">
            2024 MEMORA. ALL RIGHTS RESERVED.
          </footer>
        </section>
      </div>
    </main>
  );
}
