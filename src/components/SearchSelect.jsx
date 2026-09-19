import { useMemo, useState } from "react";
import { Search, ChevronDown } from "lucide-react";

// A typeable dropdown: click to see all options, type to filter.
// options: [{ id, label, sub? }]
export default function SearchSelect({ options, value, onSelect, placeholder, disabled }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.id === value);

  const visible = useMemo(() => {
    if (!query) return options.slice(0, 50);
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q)).slice(0, 50);
  }, [query, options]);

  return (
    <div className="relative">
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
      <input
        value={open ? query : selected?.label ?? ""}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-xl border border-line bg-paper py-2.5 pl-9 pr-8 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-moss/40 focus:border-moss transition-shadow disabled:opacity-40 disabled:cursor-not-allowed"
      />
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/30 pointer-events-none" />
      {open && visible.length > 0 && (
        <ul className="absolute z-20 mt-1.5 w-full max-h-64 overflow-y-auto rounded-xl border border-line bg-paper shadow-xl">
          {visible.map((o) => (
            <li key={o.id}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(o.id);
                  setQuery("");
                  setOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-paper-dim text-sm text-ink"
              >
                {o.label}
                {o.sub && <span className="text-ink/40"> · {o.sub}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
