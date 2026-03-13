import { type GalleryItem, type GalleryKind } from '@/constants'

const galleryModules = {
  ...(import.meta.glob(
    '@public/images/{albums,posters}/**/*.{jpg,jpeg,png,webp,avif,gif,bmp,tif,tiff,svg}',
    {
      eager: true,
      import: 'default',
    },
  ) as Record<string, string>),
  ...(import.meta.glob(
    '@public/images/{albums,posters}/**/*.{JPG,JPEG,PNG,WEBP,AVIF,GIF,BMP,TIF,TIFF,SVG}',
    {
      eager: true,
      import: 'default',
    },
  ) as Record<string, string>),
}

function formatTitle(name: string) {
  return decodeURIComponent(name).replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()
}

function toTitleKey(name: string) {
  return decodeURIComponent(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toTimeValue(value: string) {
  const y = Number(value.slice(0, 4))
  const m = Number(value.slice(4, 6)) - 1
  const d = Number(value.slice(6, 8))
  const hh = Number(value.slice(8, 10) || '00')
  const mm = Number(value.slice(10, 12) || '00')
  const ss = Number(value.slice(12, 14) || '00')
  return new Date(y, m, d, hh, mm, ss).getTime()
}

function parseCapturedAt(slug: string) {
  const value = decodeURIComponent(slug)

  const patterns = [
    /(?:^|\D)(20\d{2}[01]\d[0-3]\d[_-]?[0-2]\d[0-5]\d[0-5]\d)(?:\D|$)/, // YYYYMMDDHHmmss
    /(?:^|\D)(20\d{2}[01]\d[0-3]\d)(?:\D|$)/, // YYYYMMDD
  ]

  for (const regex of patterns) {
    const matched = value.match(regex)
    if (!matched?.[1]) continue
    const numeric = matched[1].replace(/[^\d]/g, '')
    if (numeric.length < 8) continue
    return toTimeValue(numeric)
  }

  return null
}

function parsePath(path: string): GalleryItem | null {
  const matched = path.match(/images\/(albums|posters)\/(\d{4})\/(.+)\.[^.]+$/i)
  if (!matched) return null

  const [, type, year, slug] = matched
  if (!type) return null

  const kind = type.toLowerCase() as GalleryKind
  const image = galleryModules[path] ?? ''

  return {
    id: `${kind}-${year}-${slug}`,
    title: formatTitle(slug ?? ''),
    titleKey: toTitleKey(slug ?? ''),
    year: year ?? '',
    capturedAt: parseCapturedAt(slug ?? ''),
    kind,
    image,
    href: kind === 'posters' ? `https://www.douban.com/search?cat=1002&q=` : image,
  }
}

export function createGalleryItems() {
  return Object.keys(galleryModules)
    .map((path) => parsePath(path))
    .filter((item): item is GalleryItem => !!item)
}

export function groupGalleryByYear(items: GalleryItem[], order: 'asc' | 'desc' = 'desc') {
  const grouped = new Map<string, GalleryItem[]>()

  for (const item of items) {
    const list = grouped.get(item.year) ?? []
    list.push(item)
    grouped.set(item.year, list)
  }

  return Array.from(grouped.entries())
    .map(([year, list]) => ({ year, list }))
    .sort((a, b) => {
      if (order === 'asc') return Number(a.year) - Number(b.year)
      return Number(b.year) - Number(a.year)
    })
}

export function sortGalleryItemsByKind(items: GalleryItem[], kind: GalleryKind) {
  if (kind === 'posters') {
    return [...items].sort((a, b) => a.title.localeCompare(b.title))
  }

  return [...items].sort((a, b) => {
    const aTime = a.capturedAt ?? 0
    const bTime = b.capturedAt ?? 0
    if (aTime !== bTime) return bTime - aTime
    return b.title.localeCompare(a.title)
  })
}
