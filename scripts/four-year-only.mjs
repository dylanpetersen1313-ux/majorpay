// One salary horizon for every result: College Scorecard EARN_MDN_4YR only.
// Earlier builds fell back to the 1-year figure when the 4-year one was
// suppressed, which mixed year-1 and year-4 pay in the same comparison.
// Programs without a 4-year figure are dropped; major medians are recomputed.
// Idempotent. process-bulk-data.mjs now applies the same rule on a fresh build.
import fs from "fs";

const file = new URL("../public/salaries.json", import.meta.url);
const data = JSON.parse(fs.readFileSync(file, "utf8"));

const before = data.schools.reduce((n, s) => n + s.programs.length, 0);
const byMajor = new Map();
for (const s of data.schools) {
  s.programs = s.programs
    .filter((p) => p.earnings4yr != null)
    .map(({ major, earnings4yr }) => ({ major, earnings4yr }));
  for (const p of s.programs) {
    if (!byMajor.has(p.major)) byMajor.set(p.major, []);
    byMajor.get(p.major).push(p.earnings4yr);
  }
}
data.schools = data.schools.filter((s) => s.programs.length);

const median = (arr) => {
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};
data.majors = [...byMajor.entries()]
  .map(([major, v]) => ({ major, medianEarnings: median(v), schoolCount: v.length }))
  .filter((m) => m.schoolCount >= 5)
  .sort((a, b) => b.medianEarnings - a.medianEarnings);

const after = data.schools.reduce((n, s) => n + s.programs.length, 0);
data.schoolCount = data.schools.length;
data.majorCount = data.majors.length;
data.earningsHorizonYears = 4;
data.source =
  "US Dept of Education College Scorecard (June 2026 release), Field of Study file, bachelor's degrees, EARN_MDN_4YR: median earnings in the 4th year after completion (2017-18 and 2018-19 completers, measured in calendar years 2022 and 2023, 2024 dollars). Tuition, sticker and net price by income bracket from the IPEDS-derived tuition CSVs.";

fs.writeFileSync(file, JSON.stringify(data));
console.log({ programsBefore: before, programsAfter: after, schools: data.schoolCount, majors: data.majorCount });
