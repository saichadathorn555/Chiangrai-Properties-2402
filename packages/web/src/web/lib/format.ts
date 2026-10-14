import type { Lang } from "../i18n/dict";

export function fmtNum(n: number, lang: Lang = "en") {
  return new Intl.NumberFormat(lang === "th" ? "th-TH" : "en-US", { maximumFractionDigits: 2 }).format(n);
}
export function fmtPrice(n: number, lang: Lang = "en") {
  return `฿${fmtNum(n, lang)}`;
}
