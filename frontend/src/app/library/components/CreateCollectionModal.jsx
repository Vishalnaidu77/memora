'use client'

import { useState } from "react";
import Button from "../../components/Button";
import TextInput from "../../components/TextInput";
import { useTheme } from "../../ThemeContext";
import useItem from "../../hooks/useItem";

export default function CreateCollectionModal({ open, onClose, onCreated }) {
  const { theme } = useTheme();
  const { handleCreateCollection, loading } = useItem();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Cluster name is required.");
      return;
    }

    try {
      setError("");
      const collection = await handleCreateCollection({
        name: trimmedName,
        description: description.trim(),
      });

      setName("");
      setDescription("");
      onCreated?.(collection);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create custom cluster.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center px-6"
      style={{ backgroundColor: "rgba(0,0,0,0.62)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg border p-6 md:p-8"
        style={{
          backgroundColor: theme.panelOuter,
          color: theme.foreground,
          borderColor: theme.lowBorder,
          boxShadow: `0 24px 80px ${theme.shadow}`,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-[11px] tracking-[0.34em]" style={{ color: theme.muted }}>
          CUSTOM CLUSTER
        </p>
        <h2
          className="mt-4 text-[clamp(1.7rem,3vw,2.4rem)] font-black leading-[0.95] tracking-[-0.04em]"
          style={{ color: theme.heading }}
        >
          Create a manual cluster.
        </h2>
        <p className="mt-4 text-sm leading-7" style={{ color: theme.hint }}>
          Use this for project buckets, research themes, client work, or any structure you want to control yourself.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <TextInput
            id="cluster-name"
            label="Cluster Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Startup Ideas"
            theme={theme}
          />

          <div className="space-y-2">
            <label
              htmlFor="cluster-description"
              className="block text-xs font-semibold uppercase tracking-wider ml-1"
              style={{ color: theme.muted }}
            >
              Description
            </label>
            <textarea
              id="cluster-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              className="w-full rounded-lg px-4 py-3.5 text-sm transition-all duration-200"
              style={{
                backgroundColor: theme.inputBg,
                color: theme.foreground,
                border: `1px solid ${theme.lowBorder}`,
                outline: "none",
              }}
            />
          </div>

          {error ? (
            <p className="text-sm" style={{ color: "#ff8a8a" }}>
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              theme={theme}
              variant="secondary"
              className="w-full text-[11px] tracking-[0.22em]"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              theme={theme}
              variant="auth"
              type="submit"
              className="w-full text-[11px] tracking-[0.22em]"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Cluster"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
