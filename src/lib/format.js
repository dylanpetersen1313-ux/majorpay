export function formatMoney(n) {
  if (n == null) return "—";
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

export function formatMoneyShort(n) {
  if (n == null) return "—";
  if (n >= 1000) return `$${Math.round(n / 1000)}k`;
  return `$${Math.round(n)}`;
}
