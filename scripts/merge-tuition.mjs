// One-off merge: adds a `tuition` object onto each school in public/salaries.json,
// sourced from two tuition-tracker CSVs (sticker price + net price by income bracket).
// Run once whenever fresher tuition CSVs are provided; safe to re-run (idempotent).
import fs from "fs";
import readline from "readline";

const STICKER_CSV = process.argv[2];
const NET_CSV = process.argv[3];

if (!STICKER_CSV || !NET_CSV) {
  console.error("Usage: node merge-tuition.mjs <sticker.csv> <net.csv>");
  process.exit(1);
}

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') inQuotes = !inQuotes;
    else if (c === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out;
}

function num(v) {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// "13-14" -> 13, used only to find the latest row per school
function yearKey(y) {
  const m = /^(\d+)-/.exec(y);
  return m ? Number(m[1]) : -1;
}

async function latestByUnitid(path, mapRow) {
  const rl = readline.createInterface({ input: fs.createReadStream(path) });
  const latest = new Map(); // unitid -> { yearKey, ...mapped fields }
  let first = true;
  for await (const line of rl) {
    if (first) {
      first = false;
      continue;
    }
    if (!line.trim()) continue;
    const cols = parseCsvLine(line);
    const unitid = cols[0];
    const yk = yearKey(cols[2]);
    const existing = latest.get(unitid);
    if (existing && existing._yearKey >= yk) continue;
    latest.set(unitid, { _yearKey: yk, year: cols[2], ...mapRow(cols) });
  }
  return latest;
}

async function main() {
  const stickerByUnitid = await latestByUnitid(STICKER_CSV, (cols) => ({
    inState: num(cols[3]),
    outOfState: num(cols[4]),
  }));

  const netByUnitid = await latestByUnitid(NET_CSV, (cols) => ({
    avg: num(cols[3]),
    byIncome: {
      "0-30k": num(cols[4]),
      "30-48k": num(cols[5]),
      "48-75k": num(cols[6]),
      "75-110k": num(cols[7]),
      "110k+": num(cols[8]),
    },
  }));

  const dataPath = new URL("../public/salaries.json", import.meta.url);
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  let matched = 0;
  for (const school of data.schools) {
    const sticker = stickerByUnitid.get(school.id);
    const net = netByUnitid.get(school.id);
    if (!sticker && !net) continue;
    matched++;
    school.tuition = {
      priceYear: (net ?? sticker).year,
      inStateSticker: sticker?.inState ?? null,
      outOfStateSticker: sticker?.outOfState ?? null,
      netPriceAvg: net?.avg ?? null,
      netPriceByIncome: net?.byIncome ?? null,
    };
  }

  data.source += "; tuition and net-price by income bracket from College Tuition Tracker CSV export";

  fs.writeFileSync(dataPath, JSON.stringify(data));
  console.log(`Merged tuition data onto ${matched} of ${data.schools.length} schools.`);
}

main();
