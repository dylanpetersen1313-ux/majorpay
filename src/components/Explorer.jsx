import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, GraduationCap, Landmark } from "lucide-react";
import { useSalaryData } from "../lib/useSalaryData";
import { formatMoney } from "../lib/format";

function RankedBar({ label, sub, value, max, index, accent = "moss" }) {
  const pct = Math.max(4, Math.round((value / max) * 100));
  const barColor = accent === "gold" ? "bg-gold" : "bg-moss";
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group"
    >
      <div className="flex items-baseline justify-between gap-4 mb-1.5">
        <div className="min-w-0">
          <div className="font-medium text-ink truncate">{label}</div>
          {sub && <div className="text-xs text-ink/50 truncate">{sub}</div>}
        </div>
        <div className="font-display text-lg tabular text-ink shrink-0">
          {formatMoney(value)}
        </div>
      </div>
      <div className="h-2.5 rounded-full bg-paper-dim overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, delay: index * 0.05 + 0.1, ease: [0.22, 1, 0.36, 1] }}
          className={`h-full rounded-full ${barColor} group-hover:brightness-110`}
        />
      </div>
    </motion.div>
  );
}

export default function Explorer() {
  const { byMajor, majorNames, schools } = useSalaryData();
  const [mode, setMode] = useState("major"); // "major" | "school"
  const [query, setQuery] = useState("");
  const [selectedMajor, setSelectedMajor] = useState(majorNames[0] ?? "");
  const [selectedSchoolId, setSelectedSchoolId] = useState(schools[0]?.id ?? null);

  const majorSuggestions = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return majorNames.filter((m) => m.toLowerCase().includes(q)).slice(0, 8);
  }, [query, majorNames]);

  const schoolSuggestions = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return schools.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query, schools]);

  const majorResults = byMajor.get(selectedMajor) ?? [];
  const majorMax = majorResults[0]?.earnings ?? 1;

  const selectedSchool = schools.find((s) => s.id === selectedSchoolId);
  const schoolResults = useMemo(() => {
    if (!selectedSchool) return [];
    return [...selectedSchool.programs]
      .map((p) => ({ ...p, earnings: p.earnings4yr ?? p.earnings1yr }))
      .sort((a, b) => b.earnings - a.earnings);
  }, [selectedSchool]);
  const schoolMax = schoolResults[0]?.earnings ?? 1;

  return (
    <section id="explore" className="px-6 py-24 bg-paper-dim/50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h2 className="font-display text-3xl sm:text-4xl tracking-tight text-ink">
            Look it up
          </h2>
          <p className="mt-3 text-ink/60 max-w-lg">
            Pick a major to see which colleges pay the most for it, or pick a
            college to see which of its majors pay the most.
          </p>
        </div>

        <div className="inline-flex p-1 rounded-full bg-paper border border-line mb-6">
          <button
            onClick={() => {
              setMode("major");
              setQuery("");
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              mode === "major" ? "bg-ink text-paper" : "text-ink/60 hover:text-ink"
            }`}
          >
            <GraduationCap size={15} /> By major
          </button>
          <button
            onClick={() => {
              setMode("school");
              setQuery("");
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              mode === "school" ? "bg-ink text-paper" : "text-ink/60 hover:text-ink"
            }`}
          >
            <Landmark size={15} /> By college
          </button>
        </div>

        <div className="relative mb-8">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              mode === "major"
                ? "Search a major, e.g. Computer Science"
                : "Search a college, e.g. Harvard University"
            }
            className="w-full rounded-2xl border border-line bg-paper py-3.5 pl-11 pr-4 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-moss/40 focus:border-moss transition-shadow"
          />
          <AnimatePresence>
            {query && (mode === "major" ? majorSuggestions : schoolSuggestions).length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute z-10 mt-2 w-full rounded-2xl border border-line bg-paper shadow-xl overflow-hidden"
              >
                {mode === "major"
                  ? majorSuggestions.map((m) => (
                      <li key={m}>
                        <button
                          onClick={() => {
                            setSelectedMajor(m);
                            setQuery("");
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-paper-dim text-sm text-ink"
                        >
                          {m}
                        </button>
                      </li>
                    ))
                  : schoolSuggestions.map((s) => (
                      <li key={s.id}>
                        <button
                          onClick={() => {
                            setSelectedSchoolId(s.id);
                            setQuery("");
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-paper-dim text-sm text-ink"
                        >
                          {s.name}
                          <span className="text-ink/40">
                            {" "}
                            · {s.city}, {s.state}
                          </span>
                        </button>
                      </li>
                    ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        <div className="rounded-3xl border border-line bg-paper p-6 sm:p-8">
          {mode === "major" ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl text-ink">{selectedMajor}</h3>
                <span className="text-xs text-ink/45">
                  {majorResults.length} colleges · sorted by median earnings
                </span>
              </div>
              <div className="space-y-5">
                {majorResults.slice(0, 12).map((r, i) => (
                  <RankedBar
                    key={r.schoolName}
                    label={r.schoolName}
                    sub={`${r.city}, ${r.state}`}
                    value={r.earnings}
                    max={majorMax}
                    index={i}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl text-ink">
                  {selectedSchool?.name}
                </h3>
                <span className="text-xs text-ink/45">
                  {schoolResults.length} majors · sorted by median earnings
                </span>
              </div>
              <div className="space-y-5">
                {schoolResults.slice(0, 12).map((r, i) => (
                  <RankedBar
                    key={r.major}
                    label={r.major}
                    value={r.earnings}
                    max={schoolMax}
                    index={i}
                    accent="gold"
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
