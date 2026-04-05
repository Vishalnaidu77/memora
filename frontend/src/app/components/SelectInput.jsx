'use client'

export default function SelectInput({
  id,
  label,
  value,
  onChange,
  theme,
  children,
  ...props
}) {
  return (
    <div className="space-y-2">
      {label ? (
        <label
          htmlFor={id}
          className="block text-xs font-semibold uppercase tracking-wider ml-1"
          style={{ color: theme.muted }}
        >
          {label}
        </label>
      ) : null}

      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-3.5 pr-10 rounded-lg text-sm transition-all duration-200 appearance-none cursor-pointer font-medium"
          style={{
            backgroundColor: theme.inputBg,
            color: theme.foreground,
            border: `1.5px solid ${theme.lowBorder}`,
            outline: "none",
          }}
          onFocus={(event) => {
            event.target.style.border = `1.5px solid ${theme.accent}`;
            event.target.style.boxShadow = `0 0 0 3px ${theme.accent}22`;
          }}
          onBlur={(event) => {
            event.target.style.border = `1.5px solid ${theme.lowBorder}`;
            event.target.style.boxShadow = "none";
          }}
          {...props}
        >
          {children}
        </select>
        
        <svg
          className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none w-5 h-5"
          style={{ color: theme.muted }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

      <style jsx>{`
        select option {
          background-color: ${theme.panelInner};
          color: ${theme.foreground};
          font-weight: 500;
          padding: 8px 12px;
        }
        select option:checked {
          background: linear-gradient(${theme.accent}, ${theme.accent});
          background-color: ${theme.accent};
          color: #00354a;
        }
        select option:hover {
          background-color: ${theme.accent}33;
        }
      `}</style>
    </div>
  );
}
