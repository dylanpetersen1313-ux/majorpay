export const INCOME_BRACKETS = ["0-30k", "30-48k", "48-75k", "75-110k", "110k+"];

export const INCOME_BRACKET_LABELS = {
  "0-30k": "$0–30k",
  "30-48k": "$30–48k",
  "48-75k": "$48–75k",
  "75-110k": "$75–110k",
  "110k+": "$110k+",
};

// Falls back from most-specific (income bracket net price) to least-specific
// (average net price) when the user skips the optional fields.
export function getAnnualCost(school, { residency, incomeBracket } = {}) {
  const t = school?.tuition;
  if (!t) return null;
  if (incomeBracket && t.netPriceByIncome?.[incomeBracket] != null) {
    return t.netPriceByIncome[incomeBracket];
  }
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
