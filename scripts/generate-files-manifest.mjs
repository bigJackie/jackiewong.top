import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')
const filesRoot = path.join(root, 'public', 'files')
const outputFile = path.join(root, 'public', 'files-manifest.json')

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)))
      continue
    }

    if (entry.isFile()) files.push(fullPath)
  }

  return files
}

async function buildManifest() {
  try {
    await fs.access(filesRoot)
  } catch {
    await fs.writeFile(outputFile, JSON.stringify({}, null, 2), 'utf8')
    return
  }

  const allFiles = await walk(filesRoot)
  const manifest = {}

  for (const fullPath of allFiles) {
    const stat = await fs.stat(fullPath)
    const rel = fullPath
      .replace(filesRoot + path.sep, '')
      .split(path.sep)
      .join('/')
    const meta = {
      size: stat.size,
      modified: stat.mtime.toISOString(),
    }

    const rawUrl = `/files/${rel}`
    const encodedUrl = `/files/${rel
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/')}`

    manifest[rawUrl] = meta
    manifest[encodedUrl] = meta
  }

  await fs.writeFile(outputFile, JSON.stringify(manifest, null, 2), 'utf8')
}

buildManifest()
