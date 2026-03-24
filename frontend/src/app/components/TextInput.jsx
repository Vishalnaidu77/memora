'use client'

export default function TextInput({ id, label, type = "text", placeholder, value, onChange, theme, ...props }) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-xs font-semibold uppercase tracking-wider ml-1"
        style={{ color: theme.muted }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3.5 rounded-lg text-sm transition-all duration-200"
        style={{
          backgroundColor: theme.inputBg,
          color: theme.foreground,
          border: "1px solid " + theme.lowBorder,
          outline: "none",
        }}
        onFocus={(e) => {
          e.target.style.border = `1px solid ${theme.accent}`;
          e.target.style.boxShadow = "0 0 0 2px rgba(255,255,255,0.12)";
        }}
        onBlur={(e) => {
          e.target.style.border = "1px solid " + theme.lowBorder;
          e.target.style.boxShadow = "none";
        }}
        {...props}
      />
    </div>
  );
}
