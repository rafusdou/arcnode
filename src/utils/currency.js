export const RATES = { USD: 1, ARS: 1500, EUR: 0.92 };
export const SYMBOLS = { USD: "US$", ARS: "$", EUR: "€" };

const fmtARS = (n) => "$" + n.toLocaleString("es-AR");

export const fmtPrice = (usd, currency, arsOverride) => {
  if (usd === 0) return SYMBOLS[currency] + "0";
  if (currency === "ARS" && arsOverride != null) return fmtARS(arsOverride);
  const v = usd * RATES[currency];
  if (currency === "ARS") return fmtARS(Math.round(v / 100) * 100);
  if (currency === "EUR") return "€" + v.toFixed(2);
  return "US$" + v.toFixed(2);
};
