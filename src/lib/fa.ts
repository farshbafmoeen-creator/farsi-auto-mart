const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toFa(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return "";
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

export function formatToman(amount: number | bigint | null | undefined): string {
  if (amount === null || amount === undefined) return "۰";
  const n = typeof amount === "bigint" ? Number(amount) : amount;
  return toFa(n.toLocaleString("en-US"));
}
