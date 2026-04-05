'use client'

import Button from "./Button";

export default function DeleteConfirmModal({
  theme,
  open,
  title = "Delete this item?",
  message = "This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center px-6"
      style={{ backgroundColor: "rgba(0,0,0,0.62)", backdropFilter: "blur(8px)" }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md border p-6 md:p-8"
        style={{
          backgroundColor: theme.panelOuter,
          color: theme.foreground,
          borderColor: theme.lowBorder,
          boxShadow: `0 24px 80px ${theme.shadow}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[11px] tracking-[0.34em]" style={{ color: theme.muted }}>
          DELETE ITEM
        </p>
        <h2
          className="mt-4 text-[clamp(1.7rem,3vw,2.4rem)] font-black leading-[0.95] tracking-[-0.04em]"
          style={{ color: theme.heading }}
        >
          {title}
        </h2>
        <p className="mt-4 text-sm leading-7" style={{ color: theme.hint }}>
          {message}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            theme={theme}
            variant="secondary"
            className="w-full text-[11px] tracking-[0.22em]"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            theme={theme}
            variant="auth"
            className="w-full text-[11px] tracking-[0.22em]"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
