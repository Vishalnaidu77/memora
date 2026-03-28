'use client'

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../ThemeContext";
import DashboardHero from "./components/DashboardHero";
import ItemCard from "./components/ItemCard";
import useItem from "../hooks/useItem";
import FormContainer from "./components/FormContainer";

export default function DashboardPage() {
  const { theme } = useTheme();
  const { allItems, handleGetItems, loading } = useItem();
  const [filter, setFilter] = useState("ALL OBJECTS");
  const [ addItemToggle, setAddItemToggle ] = useState(false)

  useEffect(() => {
     const renderItems = async () => {
      await handleGetItems()
     }

     renderItems()
  }, []);

  const items = useMemo(() => allItems.filter(Boolean), [allItems]);

  const filteredItems = useMemo(() => {
    if (filter === "ALL OBJECTS") return items;
    return items.filter((item) => item?.type === filter);
  }, [filter, items]);

  const featuredItem = filteredItems[0];
  const synthesisCount = filteredItems.length;

  return (
    <main
      className="min-h-[calc(100vh-81px)]"
      style={{ backgroundColor: theme.background, color: theme.foreground }}
    >
      <section className="mx-auto max-w-[1600px] px-6 py-8 pb-10 md:px-8">
        <DashboardHero
          filter={filter}
          setFilter={setFilter}
          featuredItem={featuredItem}
          synthesisCount={synthesisCount}
          setAddItemToggle={setAddItemToggle}
        />

        {addItemToggle && <FormContainer setAddItemToggle={setAddItemToggle}/>}
        <div className="mt-20">
          {loading ? (
            <div className="py-24 text-[11px] tracking-[0.35em]" style={{ color: theme.muted }}>LOADING LIBRARY...</div>
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
            <div
              className="flex min-h-[320px] flex-col items-center justify-center text-center"
              style={{
                border: `1px dashed ${theme.lowBorder}`,
                backgroundColor: theme.panelInner,
              }}
            >
              <p className="text-[11px] tracking-[0.42em]" style={{ color: theme.muted }}>NO ITEMS FOUND</p>
              <p className="mt-4 max-w-md text-base" style={{ color: theme.hint }}>
                Try another filter, or add a few saved objects to populate the library.
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
  );
}
