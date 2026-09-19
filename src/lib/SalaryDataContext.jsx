import { createContext, useContext, useEffect, useMemo, useState } from "react";

const SalaryDataContext = createContext(null);

export function SalaryDataProvider({ children }) {
  const [raw, setRaw] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/salaries.json")
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json();
      })
      .then(setRaw)
      .catch((e) => setError(e));
  }, []);

  const value = useMemo(() => {
    if (!raw) return null;

    const byMajor = new Map();
    for (const school of raw.schools) {
      for (const p of school.programs) {
        const earnings = p.earnings4yr ?? p.earnings1yr;
        if (!byMajor.has(p.major)) byMajor.set(p.major, []);
        byMajor.get(p.major).push({
          schoolName: school.name,
          city: school.city,
          state: school.state,
          earnings,
        });
      }
    }
    for (const list of byMajor.values()) {
      list.sort((a, b) => b.earnings - a.earnings);
    }

    const schoolsSorted = [...raw.schools].sort((a, b) => a.name.localeCompare(b.name));
    const schoolsById = new Map(raw.schools.map((s) => [s.id, s]));

    return {
      generatedAt: raw.generatedAt,
      source: raw.source,
      schoolCount: raw.schoolCount,
      majorCount: raw.majorCount,
      topMajors: raw.majors,
      byMajor,
      majorNames: [...byMajor.keys()].sort(),
      schools: schoolsSorted,
      schoolsById,
    };
  }, [raw]);

  return (
    <SalaryDataContext.Provider value={{ data: value, error }}>
      {children}
    </SalaryDataContext.Provider>
  );
}

export function useSalaryData() {
  const ctx = useContext(SalaryDataContext);
  if (!ctx) throw new Error("useSalaryData must be used within SalaryDataProvider");
  return ctx.data;
}

export function useSalaryDataStatus() {
  const ctx = useContext(SalaryDataContext);
  if (!ctx) throw new Error("useSalaryDataStatus must be used within SalaryDataProvider");
  return { ready: !!ctx.data, error: ctx.error };
}
