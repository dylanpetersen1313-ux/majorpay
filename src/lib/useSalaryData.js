import { useMemo } from "react";
import raw from "../data/salaries.json";

// Builds a major -> ranked school list index once, on top of the flat JSON dump.
export function useSalaryData() {
  return useMemo(() => {
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

    const schoolsSorted = [...raw.schools].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return {
      generatedAt: raw.generatedAt,
      source: raw.source,
      schoolCount: raw.schoolCount,
      majorCount: raw.majorCount,
      topMajors: raw.majors,
      byMajor,
      majorNames: [...byMajor.keys()].sort(),
      schools: schoolsSorted,
    };
  }, []);
}
