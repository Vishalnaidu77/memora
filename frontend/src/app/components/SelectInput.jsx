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

      <select
        id={id}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3.5 rounded-lg text-sm transition-all duration-200"
        style={{
          backgroundColor: theme.inputBg,
          color: theme.foreground,
          border: `1px solid ${theme.lowBorder}`,
          outline: "none",
        }}
        onFocus={(event) => {
          event.target.style.border = `1px solid ${theme.accent}`;
          event.target.style.boxShadow = "0 0 0 2px rgba(255,255,255,0.12)";
        }}
        onBlur={(event) => {
          event.target.style.border = `1px solid ${theme.lowBorder}`;
          event.target.style.boxShadow = "none";
        }}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
