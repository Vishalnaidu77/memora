'use client'

export default function Button({
  type = "button",
  onClick,
  children,
  theme,
  variant = "primary",
  className = "",
  ...props
}) {
  const baseStyle = {
    fontFamily: "'Manrope', sans-serif",
    borderRadius: "8px",
    fontWeight: "600",
    transition: "all duration-200",
    border: "none",
    cursor: "pointer",
  };

  const variants = {
    primary: {
      background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentDark} 100%)`,
      color: "#00354a",
      boxShadow: `0 4px 24px ${theme.shadow || "rgba(255,255,255,0.1)"}`,
      padding: "0.875rem 1.5rem",
    },
    secondary: {
      backgroundColor: theme.panelInner,
      color: theme.foreground,
      border: `1px solid ${theme.lowBorder}`,
      padding: "0.5rem 1rem",
    },
  };

  const style = { ...baseStyle, ...variants[variant] };

  return (
    <button
      type={type}
      onClick={onClick}
      style={style}
      className={`${className}`}
      onMouseEnter={(e) => {
        if (variant === "primary") {
          e.currentTarget.style.transform = "scale(1.01)";
          e.currentTarget.style.boxShadow = `0 4px 32px ${theme.shadow || "rgba(255,255,255,0.15)"}`;
        }
      }}
      onMouseLeave={(e) => {
        if (variant === "primary") {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = `0 4px 24px ${theme.shadow || "rgba(255,255,255,0.1)"}`;
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
}
