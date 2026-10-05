const BRANDS = [
  { id: "visa", label: "Visa", pattern: /^4/ },
  { id: "mastercard", label: "Mastercard", pattern: /^(5[1-5]|2[2-7])/ },
  { id: "amex", label: "American Express", pattern: /^3[47]/ },
  { id: "diners", label: "Diners Club", pattern: /^3(0[0-5]|[68])/ },
  { id: "discover", label: "Discover", pattern: /^(6011|65)/ },
];

export function detectCardBrand(digits) {
  return BRANDS.find((b) => b.pattern.test(digits)) || null;
}

export function formatCardNumber(value) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  const brand = detectCardBrand(digits);
  if (brand?.id === "amex") {
    return digits.replace(/^(\d{0,4})(\d{0,6})(\d{0,5})/, (_, a, b, c) =>
      [a, b, c].filter(Boolean).join(" ")
    );
  }
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function isValidLength(digits, brand) {
  const expected = brand?.id === "amex" ? 15 : brand?.id === "diners" ? 14 : 16;
  return digits.length === expected;
}

export function isExpiryValid(value) {
  const match = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!match) return false;
  const month = Number(match[1]);
  if (month < 1 || month > 12) return false;
  const year = 2000 + Number(match[2]);
  const now = new Date();
  const expiry = new Date(year, month); // first day of month AFTER expiry
  return expiry > now;
}
