import { type FileItem } from '@/constants'

const fileModules = import.meta.glob('@public/files/**/*.*', {
  eager: true,
  import: 'default',
}) as Record<string, string>

type FileManifest = Record<string, { size?: number; modified?: string }>

let manifestCache: Promise<FileManifest | null> | null = null

async function loadFileManifest() {
  if (!manifestCache) {
    manifestCache = fetch('/files-manifest.json', { cache: 'no-cache' })
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

function parsePath(path: string): FileItem | null {
  const resolvedPath = fileModules[path]
  if (!resolvedPath) return null

  const marker = '/files/'
  const index = path.lastIndexOf(marker)
  if (index < 0) return null

  const rel = path.slice(index + marker.length)
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
    path: resolvedPath,
    size: null,
    modified: '',
    previewable: previewableExt.has(ext),
  }
}

export function createFileItems() {
  return Object.keys(fileModules)
    .map((path) => parsePath(path))
    .filter((item): item is FileItem => !!item)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function withFileMeta(items: FileItem[]) {
  const manifest = await loadFileManifest()

  if (manifest) {
    return items
      .map((item) => {
        const meta = manifest[item.path]
        return {
          ...item,
          size: typeof meta?.size === 'number' ? meta.size : item.size,
          modified: typeof meta?.modified === 'string' ? meta.modified : item.modified,
        }
      })
      .sort((a, b) => {
        const aTime = a.modified ? Date.parse(a.modified) : 0
        const bTime = b.modified ? Date.parse(b.modified) : 0
        if (aTime !== bTime) return bTime - aTime
        return a.name.localeCompare(b.name)
      })
  }

  const list = await Promise.all(
    items.map(async (item) => {
      try {
        const response = await fetch(item.path, { method: 'HEAD' })
        const size = Number(response.headers.get('content-length'))
        const modified = response.headers.get('last-modified') || ''

        return {
          ...item,
          size: Number.isFinite(size) ? size : null,
          modified,
        }
      } catch {
        return item
      }
    }),
  )

  return list.sort((a, b) => {
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
