import Button from "../../components/Button";
import { useTheme } from "../../ThemeContext";
import { FILTERS } from "../constants";
import { getDisplayTitle } from "../utils";

export default function DashboardHero({
  filter,
  setFilter,
  featuredItem,
  synthesisCount,
  setAddItemToggle
}) {

  const { theme } = useTheme();

  return (
    <div>
      <div>
        <div className="top-section flex justify-between items-center pr-8">
          <h1 className="text-[clamp(4rem,9vw,6.8rem)] font-black leading-[0.9] tracking-[-0.08em]">
            LIBRARY
          </h1>

          <Button theme={theme} variant="auth" className="px-8 py-4 text-[11px] tracking-[0.24em]" onClick={() => setAddItemToggle(true)}>
            Add Items
          </Button>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          {FILTERS.map((tab) => {
            const isActive =
              tab.value === "ALL OBJECTS" ? filter === "ALL OBJECTS" : filter === tab.value;

            return (
              <button
                key={tab.label}
                onClick={() => setFilter(tab.value === "ALL OBJECTS" ? "ALL OBJECTS" : tab.value)}
                className="min-w-[140px] border px-6 py-4 text-[11px] font-semibold tracking-[0.34em] transition"
                style={{
                  borderColor: isActive ? theme.foreground : theme.lowBorder,
                  backgroundColor: isActive ? theme.foreground : "transparent",
                  color: isActive ? theme.background : theme.foreground,
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
