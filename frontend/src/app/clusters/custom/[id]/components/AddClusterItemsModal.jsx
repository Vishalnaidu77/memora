'use client'

import { useMemo, useState } from "react";
import Button from "../../../../components/Button";
import { getBadge, getDisplayTitle, getMeta } from "../../../../library/utils";

function ItemSelectionCard({ item, selected, onToggle, theme }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="min-w-0 cursor-pointer w-full overflow-hidden border p-4 text-left transition duration-200"
      style={{
        borderColor: selected ? theme.foreground : theme.lowBorder,
        backgroundColor: selected ? theme.panelInner : theme.panelOuter,
        color: theme.foreground,
      }}
    >
      <p className="text-[11px] tracking-[0.28em]" style={{ color: theme.muted }}>
        {getBadge(item?.contentType || item?.type)}
      </p>
      <h3
        className="mt-3 max-w-full break-words text-lg font-black leading-[1.08] tracking-[-0.04em] [overflow-wrap:anywhere]"
        style={{ color: theme.heading }}
      >
        {getDisplayTitle(item?.title, 64)}
      </h3>
      <p className="mt-3 text-[11px] tracking-[0.22em]" style={{ color: theme.muted }}>
        {getMeta(item)}
      </p>
      <p className="mt-4 text-[11px] tracking-[0.28em]" style={{ color: selected ? theme.foreground : theme.muted }}>
        {selected ? "SELECTED" : "CLICK TO ADD"}
      </p>
    </button>
  );
}

export default function AddClusterItemsModal({
  open,
  items,
  collectionId,
  onClose,
  onSubmit,
  loading,
  theme,
}) {
  const [selectedIds, setSelectedIds] = useState([]);

  const availableItems = useMemo(() => {
    return items.filter((item) => String(item?.collectionId?._id || item?.collectionId || "") !== String(collectionId));
  }, [collectionId, items]);

  if (!open) return null;

  const toggleSelection = (itemId) => {
    setSelectedIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmit = async () => {
    if (!selectedIds.length) return;
    await onSubmit(selectedIds);
    setSelectedIds([]);
  };

  const handleClose = () => {
    if (loading) return;
    setSelectedIds([]);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[75] flex items-center justify-center px-6"
      style={{ backgroundColor: "rgba(0,0,0,0.62)", backdropFilter: "blur(8px)" }}
      onClick={handleClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-5xl overflow-hidden border p-6 md:p-8"
        style={{
          backgroundColor: theme.panelOuter,
          color: theme.foreground,
          borderColor: theme.lowBorder,
          boxShadow: `0 24px 80px ${theme.shadow}`,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between" style={{ borderColor: theme.lowBorder }}>
          <div>
            <p className="text-[11px] tracking-[0.34em]" style={{ color: theme.muted }}>
              ADD SAVED ITEMS
            </p>
            <h2
              className="mt-4 text-[clamp(1.8rem,3vw,2.6rem)] font-black leading-[0.95] tracking-[-0.05em]"
              style={{ color: theme.heading }}
            >
              Add library items to this cluster.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7" style={{ color: theme.hint }}>
              Choose from your existing saved items. Selecting an item here will place it into this custom cluster.
            </p>
          </div>

          <p className="text-[11px] tracking-[0.28em]" style={{ color: theme.muted }}>
            {selectedIds.length} SELECTED
          </p>
        </div>

        <div className="mt-6 max-h-[48vh] overflow-x-hidden overflow-y-auto pr-1">
          {availableItems.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {availableItems.map((item) => {
                const itemId = String(item?._id || item?.id || "");
                return (
                  <ItemSelectionCard
                    key={itemId}
                    item={item}
                    selected={selectedIds.includes(itemId)}
                    onToggle={() => toggleSelection(itemId)}
                    theme={theme}
                  />
                );
              })}
            </div>
          ) : (
            <div
              className="flex min-h-[240px] flex-col items-center justify-center text-center"
              style={{
                border: `1px dashed ${theme.lowBorder}`,
                backgroundColor: theme.panelInner,
              }}
            >
              <p className="text-[11px] tracking-[0.42em]" style={{ color: theme.muted }}>
                NOTHING TO ADD
              </p>
              <p className="mt-4 max-w-md text-base" style={{ color: theme.hint }}>
                Every saved item is already inside this cluster, or your library is still empty.
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            theme={theme}
            variant="secondary"
            className="w-full text-[11px] tracking-[0.22em]"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            theme={theme}
            variant="auth"
            className="w-full text-[11px] tracking-[0.22em]"
            onClick={handleSubmit}
            disabled={loading || !selectedIds.length}
          >
            {loading ? "Adding..." : `Add ${selectedIds.length || ""} Item${selectedIds.length === 1 ? "" : "s"}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
