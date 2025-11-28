import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { enUS } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get locale string for Intl formatting (e.g., "en-US", "de-DE", "fr-FR")
function getIntlLocale(country: string | null | undefined): string {
  if (!country) return "en-US"
  
  // Map common country codes to locale strings
  const localeMap: Record<string, string> = {
    US: "en-US",
    GB: "en-GB",
    CA: "en-CA",
    AU: "en-AU",
    NZ: "en-NZ",
    DE: "de-DE",
    FR: "fr-FR",
    ES: "es-ES",
    IT: "it-IT",
    NL: "nl-NL",
    PL: "pl-PL",
    PT: "pt-PT",
    SE: "sv-SE",
    DK: "da-DK",
    FI: "fi-FI",
    CZ: "cs-CZ",
    HU: "hu-HU",
    RO: "ro-RO",
    SK: "sk-SK",
    SI: "sl-SI",
    HR: "hr-HR",
    BG: "bg-BG",
    GR: "el-GR",
    EE: "et-EE",
    LV: "lv-LV",
    LT: "lt-LT",
    MT: "mt-MT",
    AT: "de-AT",
    BE: "nl-BE",
    IE: "en-IE",
    LU: "fr-LU",
    CY: "el-CY",
    CH: "de-CH",
    NO: "nb-NO",
    JP: "ja-JP",
    CN: "zh-CN",
    IN: "en-IN",
    BR: "pt-BR",
    MX: "es-MX",
    ZA: "en-ZA",
  }
  
  return localeMap[country.toUpperCase()] ?? "en-US"
}

export function formatCurrency(
  amount: number,
  currency = "USD",
  country?: string | null,
) {
  const locale = getIntlLocale(country)
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount)
}

// Format date using Intl.DateTimeFormat for locale-aware formatting
export function formatDateIntl(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {},
  country?: string | null,
) {
  const locale = getIntlLocale(country)
  return new Intl.DateTimeFormat(locale, options).format(new Date(date))
}

// Format date in a locale-appropriate short format
export function formatDateShort(date: Date | string | number, country?: string | null) {
  // US: M/d/yyyy, Others: d/M/yyyy
  if (country === "US") {
    return formatDateIntl(date, { month: "numeric", day: "numeric", year: "numeric" }, country)
  }
  return formatDateIntl(date, { day: "numeric", month: "numeric", year: "numeric" }, country)
}

// Format date in a locale-appropriate long format
export function formatDateLong(date: Date | string | number, country?: string | null) {
  // US: "January 1, 2024", Others: "1 January 2024" or similar
  if (country === "US") {
    return formatDateIntl(date, { month: "long", day: "numeric", year: "numeric" }, country)
  }
  return formatDateIntl(date, { day: "numeric", month: "long", year: "numeric" }, country)
}

// Format date with custom format string (for date-fns compatibility)
export function formatDate(
  date: Date | string | number,
  formatStr: string,
  _country?: string | null,
) {
  // For now, use enUS locale. Can be extended with more locales if needed
  return format(new Date(date), formatStr, { locale: enUS })
}
