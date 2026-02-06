import { useEffect, useMemo, useRef, useState } from "react";
import { countryCodes } from "../../data/countryCodes";

function normalizeDial(value) {
  if (!value) return "";
  const cleaned = value.replace(/[^\d+]/g, "");
  if (!cleaned) return "";
  return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
}

export default function CountryCodeSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);

  const normalizedValue = normalizeDial(value);
  const selected =
    countryCodes.find((c) => c.dial === normalizedValue) || {
      flag: "🌐",
      dial: normalizedValue || "+91",
      name: "Custom",
    };

  const filtered = useMemo(() => {
    if (!query) return countryCodes;
    const q = query.toLowerCase();
    return countryCodes.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        c.code.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDialInput = (event) => {
    const next = normalizeDial(event.target.value);
    onChange(next);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 bg-[var(--surface-alt)] border border-[var(--border-color)] rounded-md px-2 py-2">
        <span className="text-base">{selected.flag}</span>
        <input
          type="text"
          value={normalizedValue}
          onChange={handleDialInput}
          onFocus={() => setOpen(true)}
          className="w-14 bg-transparent text-[var(--text-main)] text-sm focus:outline-none"
          placeholder="+91"
        />
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="text-xs text-[var(--text-muted)]"
        >
          ▼
        </button>
      </div>

      {open && (
        <div className="absolute left-0 mt-2 w-64 bg-[var(--surface)] border border-[var(--border-color)] rounded-md shadow-lg z-50">
          <div className="p-2 border-b border-[var(--border-color)]">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search country or code"
              className="w-full bg-[var(--surface-alt)] border border-[var(--border-color)] rounded-md px-2 py-1 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none"
            />
          </div>
          <div className="max-h-56 overflow-auto">
            {filtered.map((country) => (
              <button
                key={`${country.code}-${country.dial}`}
                type="button"
                onClick={() => {
                  onChange(country.dial);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-[var(--text-main)] hover:bg-[var(--surface-alt)]"
              >
                <span className="mr-2">{country.flag}</span>
                {country.name}
                <span className="ml-2 text-xs text-[var(--text-muted)]">
                  {country.dial}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
