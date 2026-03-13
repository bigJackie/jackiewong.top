<script setup lang="ts">
import { galleryCategories, type GalleryItem } from '@/constants'
import { createGalleryItems, groupGalleryByYear, sortGalleryItemsByKind } from '@/utils'
import type { Directive } from 'vue'
import { computed, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, te } = useI18n()

const active = ref(
  (localStorage.getItem('activeGalleryCategory') as 'albums' | 'posters' | null) ?? 'albums',
)
const items = createGalleryItems()
const visibleMap = ref<Record<string, boolean>>({})
const loadedMap = ref<Record<string, boolean>>({})

const PLACEHOLDER_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='

const observerCallbacks = new WeakMap<Element, () => void>()
let lazyObserver: IntersectionObserver | null = null

function getLazyObserver() {
  if (lazyObserver) return lazyObserver

  lazyObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue

        const callback = observerCallbacks.get(entry.target)
        callback?.()

        lazyObserver?.unobserve(entry.target)
        observerCallbacks.delete(entry.target)
      }
    },
    { rootMargin: '240px 0px' },
  )

  return lazyObserver
}

const vLazySrc: Directive<HTMLImageElement, string> = {
  mounted(el, binding) {
    const key = binding.value
    if (!key) return
    if (visibleMap.value[key] || loadedMap.value[key]) return

    observerCallbacks.set(el, () => {
      visibleMap.value[key] = true
    })

    getLazyObserver().observe(el)
  },
  unmounted(el) {
    lazyObserver?.unobserve(el)
    observerCallbacks.delete(el)
  },
}

onBeforeUnmount(() => {
  lazyObserver?.disconnect()
  lazyObserver = null
})

const filtered = computed(() => items.filter((item) => item.kind === active.value))

const grouped = computed(() =>
  groupGalleryByYear(filtered.value, 'desc').map((group) => ({
    ...group,
    list: sortGalleryItemsByKind(group.list, active.value),
  })),
)

function toggleCategory(category: 'albums' | 'posters') {
  active.value = category
  localStorage.setItem('activeGalleryCategory', category)
}

function categoryText(category: 'albums' | 'posters') {
  return t(`galleryView.categories.${category}`)
}

function itemTitle(item: GalleryItem) {
  if (item.kind !== 'posters') return ''
  const key = `galleryView.posters.${item.titleKey}`
  return te(key) ? t(key) : item.title
}

function isReady(id: string) {
  return !!visibleMap.value[id] || !!loadedMap.value[id]
}

function publicPath(url: string) {
  try {
    const parsed = new URL(url)
    return `${parsed.pathname}${parsed.search}`
  } catch {
    return url
  }
}

function netlifyImage(url: string, width: number) {
  const path = publicPath(url)
  return `/.netlify/images?url=${encodeURIComponent(path)}&w=${width}&q=72&fm=webp`
}

function responsiveSrc(item: GalleryItem) {
  if (!import.meta.env.PROD) return item.image
  return netlifyImage(item.image, item.kind === 'posters' ? 480 : 960)
}

function responsiveSrcSet(item: GalleryItem) {
  if (!import.meta.env.PROD) return ''

  const widths = item.kind === 'posters' ? [240, 320, 480, 640] : [320, 480, 720, 960, 1280]
  return widths.map((w) => `${netlifyImage(item.image, w)} ${w}w`).join(', ')
}

function responsiveSizes(item: GalleryItem) {
  if (item.kind === 'posters') {
    return '(max-width: 480px) 50vw, (max-width: 1024px) 33vw, 22rem'
  }

  return '(max-width: 480px) 50vw, (max-width: 1024px) 33vw, 25vw'
}

function onImageLoad(id: string, event: Event) {
  const target = event.target as HTMLImageElement | null
  if (!target || target.currentSrc.startsWith('data:image/gif')) return
  visibleMap.value[id] = true
  loadedMap.value[id] = true
}
</script>

<template>
  <section class="view-shell">
    <div class="collection-box gallery-box">
      <nav class="collection-nav">
        <ul class="nav-list">
          <li
            v-for="category in galleryCategories"
            :key="category.name"
            :class="['nav-item', { active: active === category.name }]"
            @click="toggleCategory(category.name)"
          >
            {{ categoryText(category.name) }}
          </li>
        </ul>
      </nav>

      <template v-if="grouped.length">
        <section v-for="year in grouped" :key="year.year" class="year-section">
          <div class="year-box">
            <h1 class="year-title">{{ year.year }}</h1>
            <div class="divider" />
          </div>

          <ul class="gallery-grid" :class="`gallery-grid--${active}`">
            <li
              v-for="item in year.list"
              :key="item.id"
              class="gallery-item"
              :class="`gallery-item--${item.kind}`"
            >
              <a
                :href="`${item.href}${itemTitle(item)}`"
                target="_blank"
                rel="noopener noreferrer"
                class="gallery-link"
                :title="
                  item.kind === 'posters'
                    ? $t('galleryView.openPosterLink')
                    : $t('galleryView.previewAlbum')
                "
              >
                <figure class="thumb-wrap" :class="`thumb-wrap--${item.kind}`">
                  <img
                    v-lazy-src="item.id"
                    :src="isReady(item.id) ? responsiveSrc(item) : PLACEHOLDER_GIF"
                    :srcset="isReady(item.id) ? responsiveSrcSet(item) : undefined"
                    :sizes="isReady(item.id) ? responsiveSizes(item) : undefined"
                    :alt="item.title"
                    loading="lazy"
                    decoding="async"
                    fetchpriority="low"
                    class="thumb"
                    :class="[`thumb--${item.kind}`, { 'thumb--loaded': loadedMap[item.id] }]"
                    @load="onImageLoad(item.id, $event)"
                  />
                </figure>

                <h2 v-if="item.kind === 'posters'" class="item-title">{{ itemTitle(item) }}</h2>
              </a>
            </li>
          </ul>
        </section>
      </template>

      <p v-else class="empty-tip">{{ $t('galleryView.empty') }}</p>
    </div>
  </section>
</template>

<style scoped lang="scss">
.gallery-box {
  .year-section {
    margin-top: 2rem;
  }

  .gallery-grid {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .gallery-grid--posters {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(22rem, 1fr));
    gap: 1.2rem;
  }

  .gallery-grid--albums {
    column-count: 4;
    column-gap: 1.2rem;
  }

  .gallery-item {
    transition: opacity 0.25s ease;

    &:hover {
      opacity: 0.9;

      .item-title {
        color: var(--text-color-primary);
      }
    }
  }

  .gallery-item--albums {
    break-inside: avoid;
    margin-bottom: 1.2rem;
  }

  .gallery-link {
    display: block;
    text-decoration: none;
  }

  .thumb-wrap {
    margin: 0;
    border-radius: var(--radius-sm);
    overflow: hidden;
    background: var(--background-color);
  }

  .thumb-wrap--posters {
    aspect-ratio: 2 / 3;
  }

  .thumb {
    width: 100%;
    height: auto;
    opacity: 0.28;
    filter: blur(10px);
    transform: translateZ(0);
    transition: transform 0.25s ease;
  }

  .thumb--loaded {
    opacity: 1;
    filter: blur(0);
    transition:
      transform 0.25s ease,
      opacity 0.35s ease,
      filter 0.35s ease;
  }

  .thumb--posters {
    height: 100%;
    object-fit: cover;
  }

  .gallery-link:hover .thumb {
    transform: scale(1.02);
  }

  .item-title {
    margin: 0.8rem 0 0;
    color: var(--text-color-secondary);
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    line-height: 1.35;
  }
}

@include bp.down(bp.$bp-laptop) {
  .gallery-box {
    .gallery-grid--albums {
      column-count: 3;
    }
  }
}

@include bp.down(bp.$bp-mobile) {
  .gallery-box {
    padding: 0 2.4rem;

    .gallery-grid--posters {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }

    .gallery-grid--albums {
      column-count: 2;
      column-gap: 1rem;
    }

    .gallery-item--albums {
      margin-bottom: 1rem;
    }
  }
}
</style>
