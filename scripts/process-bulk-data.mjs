// Builds src/data/salaries.json from the full College Scorecard bulk CSV dumps
// (scripts/tmp/inst + scripts/tmp/fos) — no API, no rate limits, full national coverage.
import fs from "fs";
import readline from "readline";

const CONTROL_LABEL = { "1": "Public", "2": "Private nonprofit", "3": "Private for-profit" };

// Small, well-known colleges that would otherwise be cut by the enrollment floor.
const NOTABLE_SMALL = new Set([
  "Williams College","Amherst College","Swarthmore College","Bowdoin College",
  "Pomona College","Colby College","Middlebury College","Wellesley College",
  "Claremont McKenna College","Carleton College","Bates College","Haverford College",
  "Davidson College","Vassar College","Colgate University","Hamilton College",
  "Smith College","Barnard College","Reed College","Grinnell College",
  "Harvey Mudd College","Morehouse College","Spelman College","United States Military Academy",
  "United States Naval Academy","United States Air Force Academy","Franklin W Olin College of Engineering",
]);

function parseCsvLine(line) {
  // Field-of-study/institution files don't quote-escape commas in the columns we use,
  // except institution names which can contain commas inside quotes.
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}

function num(v) {
  if (v === "" || v === "PS" || v === "NULL" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function cleanMajor(title) {
  return title.replace(/\.$/, "").replace(/,\s*(General|Other)$/i, "").trim();
}

async function main() {
  // --- institutions ---
  const instRl = readline.createInterface({
    input: fs.createReadStream(new URL("tmp/inst/Most-Recent-Cohorts-Institution.csv", import.meta.url)),
  });
  let instHeader;
  const institutions = new Map(); // unitid -> {name, city, state, control, ugds}
  let li = 0;
  for await (const line of instRl) {
    if (li === 0) {
      instHeader = line.split(",");
      li++;
      continue;
    }
    li++;
    const cols = parseCsvLine(line);
    const unitid = cols[0];
    const name = cols[3];
    const city = cols[4];
    const state = cols[5];
    const control = cols[16];
    const ugds = num(cols[290]);
    institutions.set(unitid, { name, city, state, control, ugds });
  }
  console.log("institutions loaded:", institutions.size);

  // --- field of study ---
  const fosRl = readline.createInterface({
    input: fs.createReadStream(new URL("tmp/fos/Most-Recent-Cohorts-Field-of-Study.csv", import.meta.url)),
  });
  const schoolsByUnitid = new Map();
  const majorAgg = new Map();
  let lf = 0;
  let kept = 0;
  for await (const line of fosRl) {
    lf++;
    if (lf === 1) continue;
    const cols = parseCsvLine(line);
    const unitid = cols[0];
    const credlev = cols[7];
    if (credlev !== "3") continue; // bachelor's only

    const earn4 = num(cols[129]);
    const earn1 = num(cols[123]);
    if (earn4 == null && earn1 == null) continue;

    const inst = institutions.get(unitid);
    if (!inst || !inst.name) continue;
    const bigEnough = (inst.ugds ?? 0) >= 3000 || NOTABLE_SMALL.has(inst.name);
    if (!bigEnough) continue;

    const major = cleanMajor(cols[6]);
    if (!major || /^Reserved/i.test(major)) continue;

    if (!schoolsByUnitid.has(unitid)) {
      schoolsByUnitid.set(unitid, {
        id: unitid,
        name: inst.name,
        city: inst.city,
        state: inst.state,
        control: CONTROL_LABEL[inst.control] ?? null,
        size: inst.ugds,
        programs: [],
      });
    }
    schoolsByUnitid.get(unitid).programs.push({
      major,
      earnings4yr: earn4,
      earnings1yr: earn1,
    });

    const val = earn4 ?? earn1;
    if (!majorAgg.has(major)) majorAgg.set(major, []);
    majorAgg.get(major).push(val);
    kept++;
  }
  console.log("field-of-study rows kept:", kept, "schools:", schoolsByUnitid.size);

  function median(arr) {
    const s = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
  }

  const majors = [...majorAgg.entries()]
    .map(([major, values]) => ({
      major,
      medianEarnings: median(values),
      schoolCount: values.length,
    }))
    .filter((m) => m.schoolCount >= 8)
    .sort((a, b) => b.medianEarnings - a.medianEarnings);

  const schools = [...schoolsByUnitid.values()].sort((a, b) => a.name.localeCompare(b.name));

  const output = {
    generatedAt: new Date().toISOString(),
    source:
      "US Dept of Education College Scorecard — bulk Field of Study data, bachelor's degrees, median earnings 4 years after graduation (1 year fallback)",
    schoolCount: schools.length,
    majorCount: majors.length,
    majors,
    schools,
  };

  const outPath = new URL("../public/salaries.json", import.meta.url);
  fs.writeFileSync(outPath, JSON.stringify(output));
  const sizeMb = (fs.statSync(outPath).size / 1024 / 1024).toFixed(2);
  console.log(`\nWrote salaries.json: ${schools.length} schools, ${majors.length} majors, ${sizeMb} MB`);
}

main();
