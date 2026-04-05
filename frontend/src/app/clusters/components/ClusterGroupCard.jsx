'use client'

export default function ClusterGroupCard({
  eyebrow,
  title,
  description,
  meta,
  onClick,
  theme,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group h-full w-full border p-6 text-left transition duration-200 cursor-pointer hover:-translate-y-1"
      style={{
        borderColor: theme.lowBorder,
        backgroundColor: theme.panelOuter,
        color: theme.foreground,
      }}
    >
      <p className="text-[11px] tracking-[0.32em]" style={{ color: theme.muted }}>
        {eyebrow}
      </p>

      <h3
        className="mt-4 text-[clamp(1.5rem,2vw,2rem)] font-black leading-[1.02] tracking-[-0.05em]"
        style={{ color: theme.heading }}
      >
        {title}
      </h3>

      <p className="mt-4 min-h-[84px] text-sm leading-7" style={{ color: theme.hint }}>
        {description}
      </p>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-[11px] tracking-[0.28em]" style={{ color: theme.muted }}>
          {meta}
        </p>
        <span
          className="text-[11px] font-semibold tracking-[0.28em] transition-transform duration-200 group-hover:translate-x-1"
          style={{ color: theme.foreground }}
        >
          OPEN
        </span>
      </div>
    </button>
  );
}
