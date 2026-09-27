import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { useSalaryData } from "../lib/SalaryDataContext";
import { formatMoney } from "../lib/format";
import { INCOME_BRACKETS, INCOME_BRACKET_LABELS, getAnnualCost, getFourYearCost, getRoi, outOfStatePremium } from "../lib/cost";
import SearchSelect from "./SearchSelect";

let nextId = 1;
function makeTab() {
  return { id: nextId++, schoolId: null, major: null, residency: null, incomeBracket: null };
}

function computeTabResult(tab, schoolsById) {
  const school = tab.schoolId != null ? schoolsById.get(tab.schoolId) : null;
  const program = school?.programs.find((p) => p.major === tab.major);
  const salary = program?.earnings4yr ?? null;
  const annualCost = school ? getAnnualCost(school, tab) : null;
  const fourYearCost = school ? getFourYearCost(school, tab) : null;
  const roi = getRoi(salary, fourYearCost);
  return { school, salary, annualCost, fourYearCost, roi };
}

// Says in plain words which price the annual cost is, since it changes with the inputs.
function costBasis(school, { residency, incomeBracket }) {
  const t = school?.tuition;
  if (!t) return null;
  const isPublic = school.control === "Public";
  if (incomeBracket && t.netPriceByIncome?.[incomeBracket] != null) {
    const base = `Net price for families earning ${INCOME_BRACKET_LABELS[incomeBracket]}`;
    if (residency === "out" && outOfStatePremium(t) > 0) return `${base}, plus the ${formatMoney(outOfStatePremium(t))} out-of-state premium`;
    if (isPublic && !residency) return `${base} (in-state)`;
    return base;
  }
  if (residency === "out" && t.outOfStateSticker != null) return "Out-of-state sticker price";
  if (residency === "in" && t.inStateSticker != null) return "In-state sticker price";
  return "Average net price, all incomes";
}

function TabLabel({ tab, schoolsById }) {
  const school = tab.schoolId != null ? schoolsById.get(tab.schoolId) : null;
  if (!school) return "New";
  return school.name.length > 24 ? school.name.slice(0, 22) + "…" : school.name;
}

const label = "block text-[13px] font-medium text-ink/70 mb-1";

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
  const basis = costBasis(school, tab);

  return (
    <div className="border border-line bg-paper rounded-md">
      <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
        <div>
          <label className={label}>College</label>
          <SearchSelect
            options={schoolOptions}
            value={tab.schoolId}
            onSelect={(id) => onChange({ ...tab, schoolId: id, major: null })}
            placeholder="Type a school name"
          />
        </div>
        <div>
          <label className={label}>Major</label>
          <SearchSelect
            options={majorOptions}
            value={tab.major}
            onSelect={(major) => onChange({ ...tab, major })}
            placeholder={school ? `${school.programs.length} majors with salary data` : "Pick a college first"}
            disabled={!school}
          />
        </div>
        <div>
          <label className={label}>Residency</label>
          <div className="inline-flex w-full border border-line rounded-md overflow-hidden">
            {[
              { id: "in", label: "In-state" },
              { id: "out", label: "Out-of-state" },
            ].map((opt, i) => (
              <button
                key={opt.id}
                type="button"
                disabled={isPrivate}
                onClick={() => onChange({ ...tab, residency: tab.residency === opt.id ? null : opt.id })}
                className={`flex-1 px-3 py-2 text-sm transition-colors disabled:opacity-40 ${i ? "border-l border-line" : ""} ${
                  tab.residency === opt.id ? "bg-ink text-paper" : "text-ink/65 hover:bg-paper-dim"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {isPrivate && <p className="text-xs text-ink/45 mt-1">Private school. Everyone pays the same.</p>}
        </div>
        <div>
          <label className={label}>Family income</label>
          <select
            value={tab.incomeBracket ?? ""}
            onChange={(e) => onChange({ ...tab, incomeBracket: e.target.value || null })}
            className="w-full rounded-md border border-line bg-paper py-2 px-3 text-sm text-ink focus:outline-none focus:border-moss"
          >
            <option value="">Skip (use sticker or average price)</option>
            {INCOME_BRACKETS.map((b) => (
              <option key={b} value={b}>
                {INCOME_BRACKET_LABELS[b]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-t border-line px-5 sm:px-6 py-5 bg-paper-dim/40">
        <div className="flex flex-wrap items-end gap-x-10 gap-y-5">
          <div className="min-w-[12rem]">
            <div className="font-display tabular text-4xl sm:text-5xl leading-none">
              {result.salary == null ? <span className="text-ink/30">n/a</span> : formatMoney(result.salary)}
            </div>
            <div className="text-[13px] text-ink/60 mt-2">Median salary, 4 years after graduation</div>
          </div>
          <div>
            <div className="font-display tabular text-2xl leading-none">{formatMoney(result.annualCost) ?? "n/a"}</div>
            <div className="text-[13px] text-ink/60 mt-2">Per year</div>
          </div>
          <div>
            <div className="font-display tabular text-2xl leading-none">{formatMoney(result.fourYearCost) ?? "n/a"}</div>
            <div className="text-[13px] text-ink/60 mt-2">Four years at that price</div>
          </div>
        </div>

        <div className="mt-4 space-y-1 text-xs text-ink/50 leading-relaxed">
          {school && tab.major && result.salary == null && (
            <p>No 4-year salary is published for this program. The Dept. of Education withholds it when too few graduates are in the data.</p>
          )}
          {basis && <p>Cost used: {basis.charAt(0).toLowerCase() + basis.slice(1)}, {school.tuition.priceYear} (recent years projected from IPEDS trends).</p>}
          {school && !school.tuition && <p>We don't have cost data for this school.</p>}
        </div>
      </div>
    </div>
  );
}

function ComparisonTable({ tabs, schoolsById }) {
  const rows = tabs.map((tab) => ({ tab, ...computeTabResult(tab, schoolsById) }));
  const cell = (v) => formatMoney(v) ?? <span className="text-ink/30">n/a</span>;

  return (
    <div className="border border-line bg-paper rounded-md overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-[13px] text-ink/60">
            <th className="px-4 py-2.5 font-medium">College</th>
            <th className="px-4 py-2.5 font-medium">Major</th>
            <th className="px-4 py-2.5 font-medium text-right">Salary, yr 4</th>
            <th className="px-4 py-2.5 font-medium text-right">Per year</th>
            <th className="px-4 py-2.5 font-medium text-right">4 years</th>
            <th className="px-4 py-2.5 font-medium text-right">Salary minus yearly cost</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ tab, school, salary, annualCost, fourYearCost, roi }) => (
            <tr key={tab.id} className="border-b border-line last:border-0">
              <td className="px-4 py-2.5 font-medium text-ink truncate max-w-[11rem]">{school?.name ?? "n/a"}</td>
              <td className="px-4 py-2.5 text-ink/70 truncate max-w-[10rem]">{tab.major ?? "n/a"}</td>
              <td className="px-4 py-2.5 text-right tabular">{cell(salary)}</td>
              <td className="px-4 py-2.5 text-right tabular">{cell(annualCost)}</td>
              <td className="px-4 py-2.5 text-right tabular">{cell(fourYearCost)}</td>
              <td className="px-4 py-2.5 text-right tabular font-semibold text-moss">{cell(roi)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-4 py-2 border-t border-line text-xs text-ink/45">
        Last column: the year-4 salary minus a quarter of the 4-year cost. A rough payoff check, not a forecast. <a href="/methodology.html" className="underline">How it's calculated</a>.
      </p>
    </div>
  );
}

export default function Calculator() {
  const { schools, schoolsById } = useSalaryData();
  const [tabs, setTabs] = useState([makeTab()]);
  const [activeId, setActiveId] = useState(tabs[0].id);

  const activeTab = tabs.find((t) => t.id === activeId) ?? tabs[0];
  const complete = tabs.filter((t) => t.schoolId != null && t.major);

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
    <section className="px-5 sm:px-6 pt-10 pb-20">
      <div className="max-w-3xl mx-auto">
        <div>
          <h1 className="font-display text-3xl sm:text-[2.35rem] leading-tight tracking-tight">What a degree costs, and what it pays</h1>
          <p className="mt-2 text-ink/60 max-w-xl">
            Pick a school and a major. Compare up to five.
          </p>

          <div className="mt-7 flex items-end gap-0.5 border-b border-line overflow-x-auto">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveId(tab.id)}
                className={`flex items-center gap-1.5 pl-3 pr-1.5 py-2 -mb-px text-sm cursor-pointer whitespace-nowrap border rounded-t-md ${
                  activeId === tab.id ? "bg-paper border-line border-b-paper text-ink font-medium" : "border-transparent text-ink/55 hover:text-ink"
                }`}
              >
                <TabLabel tab={tab} schoolsById={schoolsById} />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTab(tab.id);
                  }}
                  aria-label="Clear this pick"
                  className="rounded p-0.5 text-ink/40 hover:text-ink hover:bg-paper-dim"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
            {tabs.length < 5 && (
              <button
                type="button"
                onClick={addTab}
                className="flex items-center gap-1 px-3 py-2 text-sm text-ink/55 hover:text-ink whitespace-nowrap"
              >
                <Plus size={14} /> Compare another
              </button>
            )}
          </div>

          <div className="mt-4">
            <CalculatorForm tab={activeTab} onChange={updateTab} schools={schools} schoolsById={schoolsById} />
          </div>

          {complete.length >= 2 && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold mb-2">Side by side</h2>
              <ComparisonTable tabs={complete} schoolsById={schoolsById} />
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
