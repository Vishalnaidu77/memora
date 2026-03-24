'use client'

export default function Button({
  type = "button",
  onClick,
  children,
  theme,
  variant = "primary",
  className = "",
  disabled = false,
  ...props
}) {
  const baseStyle = {
    fontFamily: "'Manrope', sans-serif",
    borderRadius: "0px",
    fontWeight: "600",
    transition: "all 200ms ease",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.7 : 1,
  };

  const variants = {
    primary: {
      background: `linear-gradient(135deg, ${theme?.accent} 0%, ${theme?.accentDark} 100%)`,
      color: "#00354a",
      boxShadow: `0 4px 24px ${theme?.shadow || "rgba(255,255,255,0.1)"}`,
      padding: "0.875rem 1.5rem",
    },
    secondary: {
      backgroundColor: theme?.panelInner,
      color: theme?.foreground,
      border: `1px solid ${theme?.lowBorder}`,
      padding: "0.5rem 1rem",
    },
    auth: {
      backgroundColor: theme?.foreground,
      color: theme?.background,
      padding: "1rem 1.5rem",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      fontSize: "0.875rem",
      fontWeight: "700",
    },
  };

  const style = { ...baseStyle, ...variants[variant] };

  return (
    <button
      type={type}
      onClick={onClick}
      style={style}
      className={`${className}`}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (variant === "primary") {
          e.currentTarget.style.transform = "scale(1.01)";
          e.currentTarget.style.boxShadow = `0 4px 32px ${theme.shadow || "rgba(255,255,255,0.15)"}`;
        }
        if (variant === "auth" && !disabled) {
          e.currentTarget.style.opacity = "0.9";
        }
      }}
      onMouseLeave={(e) => {
        if (variant === "primary") {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = `0 4px 24px ${theme.shadow || "rgba(255,255,255,0.1)"}`;
        }
        if (variant === "auth") {
          e.currentTarget.style.opacity = disabled ? "0.7" : "1";
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
}
