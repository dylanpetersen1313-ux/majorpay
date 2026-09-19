import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { useSalaryData } from "../lib/SalaryDataContext";
import { formatMoney } from "../lib/format";
import { INCOME_BRACKETS, INCOME_BRACKET_LABELS, getAnnualCost, getFourYearCost, getRoi } from "../lib/cost";
import SearchSelect from "./SearchSelect";

let nextId = 1;
function makeTab() {
  return { id: nextId++, schoolId: null, major: null, residency: null, incomeBracket: null };
}

function computeTabResult(tab, schoolsById) {
  const school = tab.schoolId != null ? schoolsById.get(tab.schoolId) : null;
  const program = school?.programs.find((p) => p.major === tab.major);
  const salary = program ? program.earnings4yr ?? program.earnings1yr : null;
  const annualCost = school ? getAnnualCost(school, tab) : null;
  const fourYearCost = school ? getFourYearCost(school, tab) : null;
  const roi = getRoi(salary, fourYearCost);
  return { school, salary, annualCost, fourYearCost, roi };
}

function TabLabel({ tab, schoolsById }) {
  const school = tab.schoolId != null ? schoolsById.get(tab.schoolId) : null;
  if (!school) return "New";
  return school.name.length > 22 ? school.name.slice(0, 20) + "…" : school.name;
}

function Stat({ label, value, big }) {
  return (
    <div>
      <div className={`font-display tabular text-ink ${big ? "text-4xl sm:text-5xl" : "text-2xl"}`}>
        {value == null ? "—" : formatMoney(value)}
      </div>
      <div className="text-xs uppercase tracking-wide text-ink/50 mt-1.5">{label}</div>
    </div>
  );
}

function CalculatorForm({ tab, onChange, schools, schoolsById }) {
  const school = tab.schoolId != null ? schoolsById.get(tab.schoolId) : null;
  const result = useMemo(() => computeTabResult(tab, schoolsById), [tab, schoolsById]);

  const schoolOptions = useMemo(
    () => schools.map((s) => ({ id: s.id, label: s.name, sub: `${s.city}, ${s.state}` })),
    [schools]
  );
  const majorOptions = useMemo(
    () => (school ? [...school.programs].sort((a, b) => a.major.localeCompare(b.major)).map((p) => ({ id: p.major, label: p.major })) : []),
    [school]
  );

  const isPrivate = school?.control && school.control !== "Public";

  return (
    <div className="rounded-3xl border border-line bg-paper p-6 sm:p-8">
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink/50 mb-1.5">
            College
          </label>
          <SearchSelect
            options={schoolOptions}
            value={tab.schoolId}
            onSelect={(id) => onChange({ ...tab, schoolId: id, major: null })}
            placeholder="Search a college…"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink/50 mb-1.5">
            Major
          </label>
          <SearchSelect
            options={majorOptions}
            value={tab.major}
            onSelect={(major) => onChange({ ...tab, major })}
            placeholder={school ? "Search a major…" : "Pick a college first"}
            disabled={!school}
          />
        </div>
      </div>

      <details className="mb-6 group">
        <summary className="cursor-pointer text-sm font-medium text-ink/60 hover:text-ink select-none">
          + Add cost details (optional)
        </summary>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-ink/50 mb-1.5">
              Residency
            </label>
            <div className="inline-flex w-full p-1 rounded-xl bg-paper-dim border border-line">
              {[
                { id: "in", label: "In-state" },
                { id: "out", label: "Out-of-state" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isPrivate}
                  onClick={() => onChange({ ...tab, residency: tab.residency === opt.id ? null : opt.id })}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 ${
                    tab.residency === opt.id ? "bg-ink text-paper" : "text-ink/60 hover:text-ink"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {isPrivate && (
              <p className="text-xs text-ink/40 mt-1">Private school — same price for everyone.</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-ink/50 mb-1.5">
              Family income
            </label>
            <select
              value={tab.incomeBracket ?? ""}
              onChange={(e) => onChange({ ...tab, incomeBracket: e.target.value || null })}
              className="w-full rounded-xl border border-line bg-paper py-2.5 px-3.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-moss/40 focus:border-moss"
            >
              <option value="">Not specified</option>
              {INCOME_BRACKETS.map((b) => (
                <option key={b} value={b}>
                  {INCOME_BRACKET_LABELS[b]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </details>

      <div className="grid grid-cols-3 gap-6 border-t border-line pt-6">
        <Stat label="Estimated salary" value={result.salary} big />
        <Stat label="Annual cost" value={result.annualCost} />
        <Stat label="4-year cost" value={result.fourYearCost} />
      </div>
      {school?.tuition && (
        <p className="text-xs text-ink/40 mt-4">
          Cost figures for {school.tuition.priceYear} — recent years are projected from IPEDS
          historical growth rates, not directly reported.
        </p>
      )}
      {!school?.tuition && school && (
        <p className="text-xs text-ink/40 mt-4">No cost data available for this school.</p>
      )}
    </div>
  );
}

function ComparisonTable({ tabs, schoolsById }) {
  const rows = tabs.map((tab) => ({ tab, ...computeTabResult(tab, schoolsById) }));

  return (
    <div className="rounded-3xl border border-line bg-paper overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink/50">
            <th className="px-5 py-3 font-semibold">College</th>
            <th className="px-5 py-3 font-semibold">Major</th>
            <th className="px-5 py-3 font-semibold text-right">Salary</th>
            <th className="px-5 py-3 font-semibold text-right">Annual cost</th>
            <th className="px-5 py-3 font-semibold text-right">4-year cost</th>
            <th className="px-5 py-3 font-semibold text-right">Est. ROI</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ tab, school, salary, annualCost, fourYearCost, roi }) => (
            <tr key={tab.id} className="border-b border-line last:border-0">
              <td className="px-5 py-3 font-medium text-ink truncate max-w-[10rem]">
                {school?.name ?? "—"}
              </td>
              <td className="px-5 py-3 text-ink/70 truncate max-w-[10rem]">{tab.major ?? "—"}</td>
              <td className="px-5 py-3 text-right tabular">{formatMoney(salary)}</td>
              <td className="px-5 py-3 text-right tabular">{formatMoney(annualCost)}</td>
              <td className="px-5 py-3 text-right tabular">{formatMoney(fourYearCost)}</td>
              <td className="px-5 py-3 text-right tabular font-semibold text-moss">{formatMoney(roi)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Calculator() {
  const { schools, schoolsById } = useSalaryData();
  const [tabs, setTabs] = useState([makeTab()]);
  const [activeId, setActiveId] = useState(tabs[0].id);

  const activeTab = tabs.find((t) => t.id === activeId) ?? tabs[0];

  function updateTab(updated) {
    setTabs((ts) => ts.map((t) => (t.id === updated.id ? updated : t)));
  }

  function addTab() {
    if (tabs.length >= 5) return;
    const t = makeTab();
    setTabs((ts) => [...ts, t]);
    setActiveId(t.id);
  }

  function removeTab(id) {
    setTabs((ts) => {
      const next = ts.filter((t) => t.id !== id);
      if (next.length === 0) {
        const fresh = makeTab();
        setActiveId(fresh.id);
        return [fresh];
      }
      if (activeId === id) setActiveId(next[0].id);
      return next;
    });
  }

  return (
    <section id="explore" className="px-6 py-24 bg-paper-dim/50">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="font-display text-3xl sm:text-4xl tracking-tight text-ink">
            Run the numbers
          </h2>
          <p className="mt-3 text-ink/60 max-w-lg">
            Pick a college and major to see the payoff. Add more to compare side by side.
          </p>
        </div>

        <div className="flex items-center gap-1.5 mb-5 flex-wrap">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`group flex items-center gap-2 pl-4 pr-2.5 py-2 rounded-full text-sm font-medium cursor-pointer transition-colors ${
                activeId === tab.id ? "bg-ink text-paper" : "bg-paper border border-line text-ink/60 hover:text-ink"
              }`}
              onClick={() => setActiveId(tab.id)}
            >
              <TabLabel tab={tab} schoolsById={schoolsById} />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTab(tab.id);
                }}
                aria-label="Clear this pick"
                className={`rounded-full p-0.5 ${activeId === tab.id ? "hover:bg-paper/20" : "hover:bg-paper-dim"}`}
              >
                <X size={13} />
              </button>
            </div>
          ))}
          {tabs.length < 5 && (
            <button
              type="button"
              onClick={addTab}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-line text-ink/50 hover:text-ink hover:border-moss transition-colors"
              aria-label="Add another college"
            >
              <Plus size={16} />
            </button>
          )}
        </div>

        <CalculatorForm tab={activeTab} onChange={updateTab} schools={schools} schoolsById={schoolsById} />

        {tabs.filter((t) => t.schoolId != null && t.major).length >= 2 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-ink/60 mb-3">Comparison</h3>
            <ComparisonTable
              tabs={tabs.filter((t) => t.schoolId != null && t.major)}
              schoolsById={schoolsById}
            />
          </div>
        )}
      </div>
    </section>
  );
}
