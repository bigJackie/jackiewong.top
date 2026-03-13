import { type FileItem } from '@/constants'

type FileManifest = Record<string, { size?: number; modified?: string }>

let manifestCache: Promise<FileManifest | null> | null = null

async function loadFileManifest() {
  if (!manifestCache) {
    manifestCache = fetch(`${import.meta.env.BASE_URL}files-manifest.json`, { cache: 'no-cache' })
      .then(async (res) => {
        if (!res.ok) return null
        return (await res.json()) as FileManifest
      })
      .catch(() => null)
  }

  return manifestCache
}

const previewableExt = new Set([
  'png',
  'jpg',
  'jpeg',
  'webp',
  'gif',
  'avif',
  'svg',
  'pdf',
  'txt',
  'md',
  'mp3',
  'wav',
  'ogg',
  'm4a',
])

function normalizePublicFileUrl(url: string) {
  const clean = url.split('?')[0].split('#')[0]
  const marker = '/files/'
  const index = clean.indexOf(marker)
  if (index < 0) return null

  const rel = clean.slice(index + marker.length)
  const encoded = rel
    .split('/')
    .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
    .join('/')

  return {
    rel,
    url: `/files/${encoded}`,
  }
}

function parsePath(url: string, meta?: { size?: number; modified?: string }): FileItem | null {
  const normalized = normalizePublicFileUrl(url)
  if (!normalized) return null

  const rel = normalized.rel
  const parts = rel.split('/')
  if (!parts.length) return null

  const fileName = decodeURIComponent(parts[parts.length - 1] ?? '')
  if (!fileName) return null

  const dirs = parts.slice(0, -1)
  const firstDir = dirs[0] ?? ''
  const secondDir = dirs[1] ?? ''

  const category = /^\d{4}$/.test(firstDir) || !firstDir ? 'misc' : firstDir
  const year = /^\d{4}$/.test(firstDir) ? firstDir : /^\d{4}$/.test(secondDir) ? secondDir : ''
  const ext = fileName.includes('.') ? (fileName.split('.').pop()?.toLowerCase() ?? '') : ''
  const name = fileName.replace(/\.[^.]+$/, '')

  return {
    id: rel,
    name,
    category,
    ext,
    year,
    path: normalized.url,
    size: typeof meta?.size === 'number' ? meta.size : null,
    modified: typeof meta?.modified === 'string' ? meta.modified : '',
    previewable: previewableExt.has(ext),
  }
}

export async function createFileItems() {
  const manifest = await loadFileManifest()
  if (!manifest) return []

  const uniq = new Map<string, FileItem>()

  for (const [url, meta] of Object.entries(manifest)) {
    const item = parsePath(url, meta)
    if (!item) continue
    uniq.set(item.id, item)
  }

  return Array.from(uniq.values()).sort((a, b) => a.name.localeCompare(b.name))
}

export async function withFileMeta(items: FileItem[]) {
  return [...items].sort((a, b) => {
    const aTime = a.modified ? Date.parse(a.modified) : 0
    const bTime = b.modified ? Date.parse(b.modified) : 0
    if (aTime !== bTime) return bTime - aTime
    return a.name.localeCompare(b.name)
  })
}

export function formatFileSize(size: number | null) {
  if (size == null || Number.isNaN(size)) return '--'
  if (size < 1024) return `${size} B`

  const units = ['KB', 'MB', 'GB']
  let value = size / 1024
  let unit = units[0]

  for (let i = 1; i < units.length && value >= 1024; i += 1) {
    value /= 1024
    unit = units[i]
  }

  return `${value.toFixed(1)} ${unit}`
}
