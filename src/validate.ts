// Form checks shared by all 10 designs. Pure functions: nothing here touches the network.

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export type Strength = { score: 0 | 1 | 2 | 3 | 4; label: string; hints: string[] };

/** Simple, explainable strength score: length + character variety, minus obvious patterns. */
export function passwordStrength(pw: string): Strength {
  const hints: string[] = [];
  if (pw.length < 12) hints.push("12+ characters");
  if (!/[a-z]/.test(pw) || !/[A-Z]/.test(pw)) hints.push("upper and lower case");
  if (!/\d/.test(pw)) hints.push("a number");
  if (!/[^A-Za-z0-9]/.test(pw)) hints.push("a symbol");
  let score = 4 - hints.length;
  if (/(.)\1{2,}|1234|abcd|password|qwerty/i.test(pw)) score -= 1;
  if (pw.length < 8) score = Math.min(score, 1);
  if (!pw) score = 0;
  const s = Math.max(0, Math.min(4, score)) as Strength["score"];
  return { score: s, label: ["Too short", "Weak", "Fair", "Good", "Strong"][s], hints };
}

export type Brand = "visa" | "mastercard" | "amex" | "discover" | "unknown";

export function cardBrand(num: string): Brand {
  const n = num.replace(/\D/g, "");
  if (/^4/.test(n)) return "visa";
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  if (/^(6011|65|64[4-9])/.test(n)) return "discover";
  return "unknown";
}

/** Groups digits like the card shows them: Amex 4-6-5, others 4-4-4-4. */
export function formatCard(raw: string): string {
  const n = raw.replace(/\D/g, "").slice(0, cardBrand(raw) === "amex" ? 15 : 16);
  if (cardBrand(n) === "amex") return [n.slice(0, 4), n.slice(4, 10), n.slice(10)].filter(Boolean).join(" ");
  return n.replace(/(.{4})(?=.)/g, "$1 ");
}

export function luhn(num: string): boolean {
  const d = num.replace(/\D/g, "");
  if (d.length < 13) return false;
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let x = Number(d[d.length - 1 - i]);
    if (i % 2 === 1) { x *= 2; if (x > 9) x -= 9; }
    sum += x;
  }
  return sum % 10 === 0;
}

export const formatExpiry = (raw: string) => {
  const d = raw.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

/** MM/YY not in the past (relative to `now`). */
export function expiryOk(v: string, now = new Date()): boolean {
  const m = /^(\d{2})\/(\d{2})$/.exec(v);
  if (!m) return false;
  const month = Number(m[1]), year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
}

export const cvcOk = (v: string, brand: Brand) => (brand === "amex" ? /^\d{4}$/ : /^\d{3}$/).test(v);
