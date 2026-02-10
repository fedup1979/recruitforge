/**
 * Country mapping — single source of truth.
 * Used by jobs/index, jobs/detail, apply/index, admin pages.
 */

export interface CountryInfo {
  name: string;
  flag: string;
  currency: string;
}

export const countryMap: Record<string, CountryInfo> = {
  MG: { name: 'Madagascar', flag: '\uD83C\uDDF2\uD83C\uDDEC', currency: 'MGA' },
  MA: { name: 'Maroc', flag: '\uD83C\uDDF2\uD83C\uDDE6', currency: 'MAD' },
  TG: { name: 'Togo', flag: '\uD83C\uDDF9\uD83C\uDDEC', currency: 'XOF' },
  SN: { name: 'Sénégal', flag: '\uD83C\uDDF8\uD83C\uDDF3', currency: 'XOF' },
  CI: { name: "Côte d'Ivoire", flag: '\uD83C\uDDE8\uD83C\uDDEE', currency: 'XOF' },
  BF: { name: 'Burkina Faso', flag: '\uD83C\uDDE7\uD83C\uDDEB', currency: 'XOF' },
  NE: { name: 'Niger', flag: '\uD83C\uDDF3\uD83C\uDDEA', currency: 'XOF' },
  TN: { name: 'Tunisie', flag: '\uD83C\uDDF9\uD83C\uDDF3', currency: 'TND' },
  CD: { name: 'RD Congo', flag: '\uD83C\uDDE8\uD83C\uDDE9', currency: 'CDF' },
  CM: { name: 'Cameroun', flag: '\uD83C\uDDE8\uD83C\uDDF2', currency: 'XAF' },
  FR: { name: 'France', flag: '\uD83C\uDDEB\uD83C\uDDF7', currency: 'EUR' },
};

/** Resolve country code to display name with flag */
export function getCountryDisplay(code: string): string {
  const info = countryMap[code];
  if (!info) return code;
  return `${info.flag} ${info.name}`;
}

/** Get country name only */
export function getCountryName(code: string): string {
  return countryMap[code]?.name ?? code;
}

/** Get country flag only */
export function getCountryFlag(code: string): string {
  return countryMap[code]?.flag ?? '';
}
