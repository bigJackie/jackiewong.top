export type GalleryKind = 'albums' | 'posters'

export type GalleryItem = {
  id: string
  title: string
  titleKey: string
  year: string
  capturedAt: number | null
  kind: GalleryKind
  image: string
  href: string
}

export const galleryCategories: Array<{ name: GalleryKind }> = [
  { name: 'albums' },
  { name: 'posters' },
]
