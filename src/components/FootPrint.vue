<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import worldMap from '@assets/world-map.min.svg'
import chinaMap from '@assets/china.svg'
import { visitedCountries, visitedProvinces } from '@/constants/foot'

const worldMapRef = ref<HTMLObjectElement | null>(null)
const chinaMapRef = ref<HTMLObjectElement | null>(null)
const isDark = ref(false)

function normalizeCodes(codes: string[]) {
  return codes.map((code) => code.trim().toLowerCase())
}

function syncThemeState() {
  isDark.value = document.documentElement.classList.contains('dark')
}

function getWorldSvgThemeStyle() {
  const dark = isDark.value

  const baseFill = dark ? 'rgba(255, 255, 255, 0.035)' : 'rgba(15, 23, 42, 0.035)'
  const baseStroke = dark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(15, 23, 42, 0.16)'
  const visitedFill = dark ? 'rgba(99, 210, 151, 0.18)' : 'rgba(47, 107, 69, 0.16)'
  const visitedStroke = dark ? '#63d297' : '#2f6b45'
  const shadowColor = dark ? 'rgba(99, 210, 151, 0.16)' : 'rgba(47, 107, 69, 0.12)'

  return `
    svg {
      overflow: visible;
    }

    path {
      fill: ${baseFill};
      stroke: ${baseStroke};
      stroke-width: 0.85;
      vector-effect: non-scaling-stroke;
      transition:
        fill 220ms ease,
        stroke 220ms ease,
        opacity 220ms ease,
        filter 220ms ease;
    }

    path.visited-country,
    g.visited-country > path,
    g.visited-country path {
      fill: ${visitedFill};
      stroke: ${visitedStroke};
      stroke-width: 1.05;
      filter: drop-shadow(0 0 5px ${shadowColor});
    }

    path:hover,
    g:hover > path,
    g:hover path {
      opacity: 0.92;
    }
  `
}

function getChinaSvgThemeStyle() {
  const dark = isDark.value

  const baseFill = dark ? 'rgba(255, 255, 255, 0.045)' : 'rgba(15, 23, 42, 0.045)'
  const baseStroke = dark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(15, 23, 42, 0.18)'
  const visitedFill = dark ? 'rgba(99, 210, 151, 0.26)' : 'rgba(47, 107, 69, 0.24)'
  const visitedStroke = dark ? '#7ce0aa' : '#2f6b45'
  const shadowColor = dark ? 'rgba(99, 210, 151, 0.2)' : 'rgba(47, 107, 69, 0.14)'

  return `
    svg {
      overflow: visible;
    }

    path {
      fill: ${baseFill};
      stroke: ${baseStroke};
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
      transition:
        fill 220ms ease,
        stroke 220ms ease,
        opacity 220ms ease,
        filter 220ms ease;
    }

    path.visited-province {
      fill: ${visitedFill};
      stroke: ${visitedStroke};
      stroke-width: 1.2;
      filter: drop-shadow(0 0 6px ${shadowColor});
    }

    path:hover {
      opacity: 0.95;
    }
  `
}

function injectSvgStyle(svgDoc: Document, styleId: string, cssText: string) {
  let styleEl = svgDoc.getElementById(styleId) as SVGStyleElement | null

  if (!styleEl) {
    styleEl = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'style')
    styleEl.setAttribute('id', styleId)
    svgDoc.documentElement.insertBefore(styleEl, svgDoc.documentElement.firstChild)
  }

  styleEl.textContent = cssText
}

function applyVisitedCountries() {
  const svgDoc = worldMapRef.value?.contentDocument
  if (!svgDoc) return

  injectSvgStyle(svgDoc, 'hybrid-world-runtime-style', getWorldSvgThemeStyle())

  svgDoc.querySelectorAll('.visited-country').forEach((el) => {
    el.classList.remove('visited-country')
  })

  const normalized = normalizeCodes(visitedCountries)

  normalized.forEach((code) => {
    const el = svgDoc.getElementById(code)
    if (el) {
      el.classList.add('visited-country')
    }
  })
}

function applyVisitedProvinces() {
  const svgDoc = chinaMapRef.value?.contentDocument
  if (!svgDoc) return

  injectSvgStyle(svgDoc, 'hybrid-china-runtime-style', getChinaSvgThemeStyle())

  const allPaths = svgDoc.querySelectorAll('path')
  allPaths.forEach((path) => path.classList.remove('visited-province'))

  const normalized = normalizeCodes(visitedProvinces)

  normalized.forEach((code) => {
    const el = svgDoc.getElementById(code)
    if (el) el.classList.add('visited-province')
  })
}

function applyAll() {
  applyVisitedCountries()
  applyVisitedProvinces()
}

function handleWorldLoad() {
  applyVisitedCountries()
}

function handleChinaLoad() {
  applyVisitedProvinces()
}

let observer: MutationObserver | null = null

onMounted(async () => {
  await nextTick()

  syncThemeState()

  const worldObj = worldMapRef.value
  const chinaObj = chinaMapRef.value

  if (worldObj?.contentDocument) {
    applyVisitedCountries()
  }

  if (chinaObj?.contentDocument) {
    applyVisitedProvinces()
  }

  worldObj?.addEventListener('load', handleWorldLoad)
  chinaObj?.addEventListener('load', handleChinaLoad)

  observer = new MutationObserver(() => {
    syncThemeState()
    applyAll()
  })

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
})

onBeforeUnmount(() => {
  worldMapRef.value?.removeEventListener('load', handleWorldLoad)
  chinaMapRef.value?.removeEventListener('load', handleChinaLoad)
  observer?.disconnect()
})
</script>

<template>
  <section class="footprint-section">
    <div class="section-head">
      <h2 class="title">{{ $t('footprint.title') }}</h2>
      <p class="header">{{ $t('footprint.header') }}</p>
    </div>

    <div class="footprint-shell">
      <div class="map-stage">
        <object
          ref="worldMapRef"
          class="world-map"
          :data="worldMap"
          type="image/svg+xml"
          aria-label="World travel footprint map"
        >
          {{ $t('footprint.svgLoadError') }}
        </object>

        <div class="connector connector-dot"></div>
      </div>

      <aside class="footprint-meta">
        <div class="china-inset">
          <div class="china-inset-inner">
            <div class="inset-head">
              <span class="inset-label">{{ $t('footprint.chinaDetail') }}</span>
            </div>

            <object
              ref="chinaMapRef"
              class="china-map"
              :data="chinaMap"
              type="image/svg+xml"
              aria-label="China travel footprint map"
            >
              {{ $t('footprint.svgLoadError') }}
            </object>
          </div>
        </div>

        <div class="meta-block">
          <span class="meta-label">{{ $t('footprint.world') }}</span>
          <p class="meta-value">{{ visitedCountries.length }} {{ $t('footprint.country') }}</p>
        </div>

        <div class="meta-block">
          <span class="meta-label">{{ $t('footprint.china') }}</span>
          <p class="meta-value">{{ visitedProvinces.length }} {{ $t('footprint.province') }}</p>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped lang="scss">
.footprint-section {
  --fp-line: rgba(15, 23, 42, 0.12);
  --fp-ring: rgba(15, 23, 42, 0.08);
  --fp-text: #111827;
  --fp-text-soft: rgba(17, 24, 39, 0.68);
  --fp-accent: #2f6b45;
  --fp-accent-soft: rgba(47, 107, 69, 0.12);
  --fp-shadow: rgba(15, 23, 42, 0.06);
  padding: clamp(4rem, 3rem + 2vw, 7rem) 1.6rem;
}

html.dark {
  .footprint-section {
    --fp-line: rgba(255, 255, 255, 0.14);
    --fp-ring: rgba(255, 255, 255, 0.08);
    --fp-text: #f9fafb;
    --fp-text-soft: rgba(249, 250, 251, 0.76);
    --fp-accent: #63d297;
    --fp-accent-soft: rgba(99, 210, 151, 0.12);
    --fp-shadow: rgba(0, 0, 0, 0.2);
  }
}

.section-head {
  width: min(100%, 110rem);
  margin: 0 auto 2.4rem;
  padding: 0 1.6rem;
}

.eyebrow {
  margin: 0 0 0.6rem;
  color: var(--fp-accent);
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.18rem;
}

.title {
  margin: 0;
  color: var(--text-color-primary, var(--fp-text));
  font-size: clamp(2.6rem, 2rem + 1.5vw, 4.2rem);
  line-height: 1.15;
}

.header {
  margin: 0.8rem 0 0;
  color: var(--text-color-tertiary, var(--fp-text-soft));
  font-size: 1.3rem;
  letter-spacing: 0.06rem;
  line-height: 1.8;
  max-width: 78rem;
}

.footprint-shell {
  position: relative;
  width: min(100%, 120rem);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 28rem;
  gap: 2.4rem;
  align-items: center;
}

.map-stage {
  position: relative;
  min-height: 42rem;
}

.world-map {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  height: clamp(28rem, 42vw, 52rem);
  border: 0;
  background: transparent;
}

.china-inset {
  z-index: 3;
  width: min(34vw, 28rem);
  min-width: 24rem;
}

.china-inset-inner {
  position: relative;
  padding: 1.2rem 1.2rem 0.9rem;
  border-radius: 1.8rem;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 28px var(--fp-shadow);
  border: 1px solid var(--fp-line);
}

html.dark .china-inset-inner {
  background: rgba(255, 255, 255, 0.03);
}

.inset-head {
  margin-bottom: 0.8rem;
}

.inset-label {
  color: var(--fp-accent);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.12rem;
}

.china-map {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 774 / 569;
  border: 0;
  background: transparent;
}

.connector {
  position: absolute;
  z-index: 2;
  pointer-events: none;
}

.connector-dot {
  top: 42%;
  right: 20.8%;
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 999px;
  background: var(--fp-accent);
  box-shadow: 0 0 0 0.5rem var(--fp-accent-soft);
  opacity: 0.9;
  transform: translate(-50%, -50%);
}

.footprint-meta {
  height: 100%;
  @include mx.flex(column, flex-start, flex-start, 1.6rem);
}

.meta-block {
  padding-left: 1.2rem;
  border-left: 1px solid var(--fp-line);
}

.meta-label {
  display: inline-block;
  margin-bottom: 0.55rem;
  color: var(--fp-accent);
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.14rem;
}

.meta-value {
  margin: 0;
  color: var(--fp-text);
  font-size: 1.7rem;
  line-height: 1.4;
}

@include bp.down(bp.$bp-laptop) {
  .footprint-shell {
    grid-template-columns: 1fr;
  }

  .footprint-meta {
    max-width: 64rem;
  }

  .map-stage {
    min-height: auto;
  }

  .ring-1 {
    width: min(78vw, 52rem);
    height: min(78vw, 52rem);
  }

  .ring-2 {
    width: min(96vw, 68rem);
    height: min(96vw, 68rem);
  }

  .china-inset {
    position: relative;
    right: auto;
    bottom: auto;
    width: 100%;
    min-width: 0;
    margin-top: 1.2rem;
  }

  .china-inset-inner {
    padding: 1rem 1rem 0.8rem;
    border-radius: 1.4rem;
  }

  .connector-dot {
    display: none;
  }
}

@include bp.down(bp.$bp-tablet) {
  .section-head {
    margin-bottom: 1.6rem;
  }

  .title {
    font-size: clamp(2.2rem, 1.8rem + 1vw, 3.2rem);
  }

  .header {
    font-size: 1.2rem;
    line-height: 1.7;
  }

  .footprint-shell {
    gap: 1.8rem;
  }

  .world-map {
    height: clamp(22rem, 58vw, 34rem);
  }

  .meta-value {
    font-size: 1.45rem;
  }
}
</style>
