export function formatPrice(value: number | string, currency = "ZAR"): string {
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "-";
  try {
    return new Intl.NumberFormat(currency === "ZAR" ? "en-ZA" : "en", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${currency} ${n.toFixed(0)}`;
  }
}

export function vendorTag(id: string): string {
  return `VND-${id.slice(0, 4).toUpperCase()}`;
}
