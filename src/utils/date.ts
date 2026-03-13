function formatter(locale: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(locale, options)
}

export function formatDateFull(d: string, locale: string) {
  return formatter(locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(d))
}

export function formatDateYear(d: string, locale: string) {
  return formatter(locale, { year: 'numeric' }).format(new Date(d))
}

export function formatDateMonth(d: string, locale: string) {
  return formatter(locale, { month: 'short' }).format(new Date(d))
}

export function formatDateDay(d: string, locale: string) {
  return formatter(locale, { day: 'numeric' }).format(new Date(d))
}

export function formatDateMonthDay(d: string, locale: string) {
  return formatter(locale, { month: 'short', day: 'numeric' }).format(new Date(d))
}

export function sortByDateDesc<T extends { date: string }>(a: T, b: T): number {
  return Date.parse(b.date) - Date.parse(a.date)
}

export function sortByDateAsc<T extends { date: string }>(a: T, b: T): number {
  return Date.parse(a.date) - Date.parse(b.date)
}
