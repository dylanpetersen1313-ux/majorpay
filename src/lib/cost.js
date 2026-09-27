export const INCOME_BRACKETS = ["0-30k", "30-48k", "48-75k", "75-110k", "110k+"];

export const INCOME_BRACKET_LABELS = {
  "0-30k": "$0–30k",
  "30-48k": "$30–48k",
  "48-75k": "$48–75k",
  "75-110k": "$75–110k",
  "110k+": "$110k+",
};

// Annual cost for one student.
// - With an income bracket: the school's net price for that bracket. Those
//   figures describe in-state students, so at a public school an out-of-state
//   student also pays the out-of-state tuition premium (their sticker price
//   minus the in-state sticker price). Private schools charge everyone the same.
// - Without one: the sticker price for the chosen residency, or the school's
//   average net price if residency isn't picked either.
export function outOfStatePremium(t) {
  if (t?.outOfStateSticker == null || t?.inStateSticker == null) return 0;
  return Math.max(0, t.outOfStateSticker - t.inStateSticker);
}

export function getAnnualCost(school, { residency, incomeBracket } = {}) {
  const t = school?.tuition;
  if (!t) return null;
  const net = incomeBracket ? t.netPriceByIncome?.[incomeBracket] : null;
  if (net != null) return residency === "out" ? net + outOfStatePremium(t) : net;
  if (residency === "out" && t.outOfStateSticker != null) return t.outOfStateSticker;
  if (residency === "in" && t.inStateSticker != null) return t.inStateSticker;
  return t.netPriceAvg ?? t.inStateSticker ?? t.outOfStateSticker ?? null;
}

export function getFourYearCost(school, opts) {
  const annual = getAnnualCost(school, opts);
  return annual == null ? null : annual * 4;
}

// Net yearly value: what's left of the salary after "paying off" the degree
// evenly over 4 years. Simple and easy to compare across options.
export function getRoi(salary, fourYearCost) {
  if (salary == null || fourYearCost == null) return null;
  return salary - fourYearCost / 4;
}
