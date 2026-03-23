'use client'

export default function PanelCard({ theme, children }) {
  return (
    <div
      className="rounded-lg p-[1px] shadow-2xl overflow-hidden transition-all duration-500"
      style={{ backgroundColor: theme.panelOuter }}
    >
      <div className="rounded-lg p-6 md:p-8" style={{ backgroundColor: theme.panelInner }}>
        {children}
      </div>
    </div>
  );
}
