// Pulls real earnings-by-major data from the US Dept of Education College Scorecard API
// (public, free, no auth beyond the shared DEMO_KEY). Run once at build/update time —
// output is committed as static JSON so the live site never depends on this API or its rate limits.
import { writeFileSync } from "fs";

const API_KEY = "DEMO_KEY";
const BASE = "https://api.data.gov/ed/collegescorecard/v1/schools";

// Recognizable schools across public flagships, Ivies, and well-known privates —
// chosen so search results feel familiar rather than dominated by the biggest online schools.
const SCHOOL_NAMES = [
  "Harvard University","Yale University","Princeton University","Columbia University",
  "University of Pennsylvania","Cornell University","Dartmouth College","Brown University",
  "Stanford University","Massachusetts Institute of Technology","California Institute of Technology",
  "Duke University","Northwestern University","Johns Hopkins University","Vanderbilt University",
  "Rice University","University of Notre Dame","Georgetown University","Carnegie Mellon University",
  "University of Southern California","New York University","Boston University","Boston College",
  "Tufts University","University of Chicago","Emory University","University of Miami",
  "University of California-Berkeley","University of California-Los Angeles",
  "University of California-San Diego","University of California-Davis",
  "University of California-Irvine","University of California-Santa Barbara",
  "University of Michigan-Ann Arbor","University of Virginia","University of North Carolina at Chapel Hill",
  "Georgia Institute of Technology","University of Florida","University of Texas at Austin",
  "University of Wisconsin-Madison","University of Illinois Urbana-Champaign",
  "Ohio State University-Main Campus","Pennsylvania State University-Main Campus",
  "University of Washington-Seattle Campus","University of Georgia","University of Maryland-College Park",
  "Purdue University-Main Campus","Indiana University-Bloomington","Michigan State University",
  "Rutgers University-New Brunswick","University of Minnesota-Twin Cities","Texas A & M University-College Station",
  "Arizona State University Campus Immersion","University of Arizona","Florida State University",
  "University of Colorado Boulder","University of Iowa","University of Connecticut",
  "University of Massachusetts-Amherst","Virginia Polytechnic Institute and State University",
  "North Carolina State University at Raleigh","Clemson University","University of Tennessee-Knoxville",
  "University of Kentucky","University of South Carolina-Columbia","University of Oregon",
  "University of Utah","University of Pittsburgh-Pittsburgh Campus","Syracuse University",
  "University of Rochester","Case Western Reserve University","Rensselaer Polytechnic Institute",
  "Worcester Polytechnic Institute","Lehigh University","Northeastern University",
  "University of California-Santa Cruz","San Diego State University","San Jose State University",
  "Baylor University","Southern Methodist University","Texas Christian University",
  "University of Alabama","Auburn University","Louisiana State University",
  "University of Oklahoma","University of Kansas","University of Nebraska-Lincoln",
  "University of Missouri-Columbia","Iowa State University","University of Delaware",
  "Colorado State University","Brigham Young University-Provo","Villanova University",
  "Wake Forest University","University of Richmond","William & Mary",
  "Howard University","Morehouse College","Spelman College","Colby College",
  "Bowdoin College","Williams College","Amherst College","Swarthmore College",
];

function median(arr) {
  const nums = arr.filter((n) => typeof n === "number").sort((a, b) => a - b);
  if (!nums.length) return null;
  const mid = Math.floor(nums.length / 2);
  return nums.length % 2 ? nums[mid] : Math.round((nums[mid - 1] + nums[mid]) / 2);
}

async function fetchSchool(name) {
  const params = new URLSearchParams({
    "school.name": name,
    fields: [
      "id",
      "school.name",
      "school.city",
      "school.state",
      "school.ownership",
      "latest.student.size",
      "latest.programs.cip_4_digit.title",
      "latest.programs.cip_4_digit.credential.level",
      "latest.programs.cip_4_digit.earnings.4_yr.overall_median_earnings",
      "latest.programs.cip_4_digit.earnings.1_yr.overall_median_earnings",
    ].join(","),
    per_page: "1",
    api_key: API_KEY,
  });
  const res = await fetch(`${BASE}?${params}`);
  if (!res.ok) throw new Error(`${name}: ${res.status}`);
  const data = await res.json();
  return data.results?.[0] ?? null;
}

// Cleans a CIP title down to a normalized major label people search for.
function cleanMajor(title) {
  return title.replace(/\.$/, "").replace(/,\s*(General|Other)$/i, "").trim();
}

const schools = [];
const majorAgg = new Map(); // major -> [earnings]

let i = 0;
for (const name of SCHOOL_NAMES) {
  i++;
  try {
    const r = await fetchSchool(name);
    if (!r) {
      console.log(`[${i}/${SCHOOL_NAMES.length}] MISS  ${name}`);
      continue;
    }
    const programs = (r["latest.programs.cip_4_digit"] || [])
      .filter((p) => p.credential?.level === 3) // bachelor's only
      .map((p) => ({
        major: cleanMajor(p.title),
        earnings4yr: p.earnings?.["4_yr"]?.overall_median_earnings ?? null,
        earnings1yr: p.earnings?.["1_yr"]?.overall_median_earnings ?? null,
      }))
      .filter((p) => p.earnings4yr || p.earnings1yr);

    if (programs.length) {
      schools.push({
        id: r.id,
        name: r["school.name"],
        city: r["school.city"],
        state: r["school.state"],
        size: r["latest.student.size"],
        programs,
      });
      for (const p of programs) {
        const val = p.earnings4yr ?? p.earnings1yr;
        if (!majorAgg.has(p.major)) majorAgg.set(p.major, []);
        majorAgg.get(p.major).push(val);
      }
    }
    console.log(`[${i}/${SCHOOL_NAMES.length}] ok    ${name} (${programs.length} majors)`);
  } catch (e) {
    console.log(`[${i}/${SCHOOL_NAMES.length}] ERROR ${name}: ${e.message}`);
  }
  // stay well under DEMO_KEY's rate limit
  await new Promise((r) => setTimeout(r, 900));
}

const majors = [...majorAgg.entries()]
  .map(([major, values]) => ({
    major,
    medianEarnings: median(values),
    schoolCount: values.length,
  }))
  .filter((m) => m.schoolCount >= 3)
  .sort((a, b) => b.medianEarnings - a.medianEarnings);

const output = {
  generatedAt: new Date().toISOString(),
  source: "US Dept of Education College Scorecard API — median earnings 4 years after graduation",
  schoolCount: schools.length,
  majorCount: majors.length,
  majors,
  schools,
};

writeFileSync(new URL("../src/data/salaries.json", import.meta.url), JSON.stringify(output));
console.log(`\nDone. ${schools.length} schools, ${majors.length} majors with sufficient data.`);
