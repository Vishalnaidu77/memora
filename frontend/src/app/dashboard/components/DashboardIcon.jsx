export default function DashboardIcon({ name, className = "" }) {
  const icons = {
    smart_display: ">",
    autorenew: "*",
    analytics: "#",
    settings: "S",
    inventory_2: "A",
    account_circle: "U",
  };

  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-5 w-5 items-center justify-center text-[0.8rem] font-bold leading-none ${className}`}
    >
      {icons[name] || "+"}
    </span>
  );
}
