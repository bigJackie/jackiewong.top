<script setup lang="ts">
import {
  centerLabel,
  skillLinks,
  mySkills,
  type Point,
  type SkillNode,
  type SkillStatus,
} from '@/constants'
import { t } from '@/i18n'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    width?: number
    height?: number
  }>(),
  {
    width: 920,
    height: 720,
  },
)

const shellRef = ref<HTMLElement | null>(null)
const hoveredId = ref<string | null>(null)
const selectedId = ref<string | null>(null)
const skills = ref<SkillNode[]>(mySkills)
const time = ref(0)

const tooltip = ref<{
  visible: boolean
  x: number
  y: number
  skill: SkillNode | null
}>({
  visible: false,
  x: 0,
  y: 0,
  skill: null,
})

const center = computed<Point>(() => ({
  x: props.width / 2,
  y: props.height / 2,
}))

const activeId = computed(() => selectedId.value ?? hoveredId.value)

const activeSkill = computed(() =>
  activeId.value ? (skills.value.find((item) => item.id === activeId.value) ?? null) : null,
)

const nodeViews = computed(() => {
  const cx = center.value.x
  const cy = center.value.y

  return skills.value.map((node) => {
    const amp = node.amplitude ?? 4
    const speed = node.speed ?? 0.001
    const phase = node.phase ?? 0

    const x = cx + node.x + Math.sin(time.value * speed + phase) * amp
    const y = cy + node.y + Math.cos(time.value * speed * 1.1 + phase) * amp

    const startX = cx
    const startY = cy
    const endX = x
    const endY = y
    const midX = (startX + endX) / 2
    const midY = (startY + endY) / 2
    const dx = endX - startX
    const dy = endY - startY
    const length = Math.hypot(dx, dy) || 1
    const normalX = -dy / length
    const normalY = dx / length
    const lineAmp = node.lineAmplitude ?? 12
    const lineSpeed = node.lineSpeed ?? 0.001
    const linePhase = node.linePhase ?? 0
    const offset = Math.sin(time.value * lineSpeed + linePhase) * lineAmp

    return {
      ...node,
      x,
      y,
      radius: node.radius ?? 28,
      linePath: `M ${startX} ${startY} Q ${midX + normalX * offset} ${midY + normalY * offset} ${endX} ${endY}`,
    }
  })
})

const nodePositionMap = computed<Record<string, Point>>(() =>
  Object.fromEntries(nodeViews.value.map((node) => [node.id, { x: node.x, y: node.y }])),
)

const linkViews = computed(
  () =>
    skillLinks
      .map(([fromId, toId]) => {
        const p1 = nodePositionMap.value[fromId]
        const p2 = nodePositionMap.value[toId]
        if (!p1 || !p2) return null

        const midX = (p1.x + p2.x) / 2
        const midY = (p1.y + p2.y) / 2
        const dx = p2.x - p1.x
        const dy = p2.y - p1.y
        const length = Math.hypot(dx, dy) || 1
        const normalX = -dy / length
        const normalY = dx / length
        const phase = (fromId.length + toId.length) * 0.7
        const offset = Math.sin(time.value * 0.0009 + phase) * 8

        return {
          key: `${fromId}-${toId}`,
          fromId,
          toId,
          path: `M ${p1.x} ${p1.y} Q ${midX + normalX * offset} ${midY + normalY * offset} ${p2.x} ${p2.y}`,
        }
      })
      .filter(Boolean) as Array<{
      key: string
      fromId: string
      toId: string
      path: string
    }>,
)

const isDimmedNode = (id: string) => !!activeId.value && activeId.value !== id
const isActiveLink = (fromId: string, toId: string) =>
  !!activeId.value && (activeId.value === fromId || activeId.value === toId)
const isDimmedLink = (fromId: string, toId: string) =>
  !!activeId.value && activeId.value !== fromId && activeId.value !== toId

const getStatusClass = (status: SkillStatus) => `is-${status}`
const getStatusLabel = (status: SkillStatus) => t(`skill.${status}`)

let rafId = 0
const animate = (now: number) => {
  time.value = now
  rafId = requestAnimationFrame(animate)
}

onMounted(() => {
  rafId = requestAnimationFrame(animate)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
})

function updateTooltipPosition(event: MouseEvent) {
  const rect = shellRef.value?.getBoundingClientRect()
  if (!rect) return
  tooltip.value.x = event.clientX - rect.left + 14
  tooltip.value.y = event.clientY - rect.top + 14
}

function showTooltip(event: MouseEvent, node: SkillNode) {
  hoveredId.value = node.id
  tooltip.value.visible = true
  tooltip.value.skill = node
  updateTooltipPosition(event)
}

function moveTooltip(event: MouseEvent) {
  if (tooltip.value.visible) updateTooltipPosition(event)
}

function hideTooltip() {
  hoveredId.value = null
  tooltip.value.visible = false
  tooltip.value.skill = null
}

function toggleSelected(id: string) {
  selectedId.value = selectedId.value === id ? null : id
}

function clearSelection() {
  selectedId.value = null
}
</script>

<template>
  <section class="skill-constellation">
    <div class="section-head">
      <h2 class="title">{{ $t('skill.title') }}</h2>
      <p class="header">{{ $t('skill.header') }}</p>
    </div>

    <div ref="shellRef" class="constellation-shell">
      <svg
        class="constellation-svg"
        :viewBox="`0 0 ${width} ${height}`"
        :style="{ maxWidth: `${width}px` }"
      >
        <defs>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle class="ambient-ring ring-1" :cx="center.x" :cy="center.y" r="120" />
        <circle class="ambient-ring ring-2" :cx="center.x" :cy="center.y" r="210" />
        <circle class="ambient-ring ring-3" :cx="center.x" :cy="center.y" r="305" />

        <template v-for="link in linkViews" :key="link.key">
          <path
            class="skill-link"
            :class="{
              active: isActiveLink(link.fromId, link.toId),
              dimmed: isDimmedLink(link.fromId, link.toId),
            }"
            :d="link.path"
            fill="none"
          />
        </template>

        <template v-for="node in nodeViews" :key="`line-${node.id}`">
          <path
            class="skill-line"
            :class="[
              getStatusClass(node.status),
              { active: activeId === node.id, dimmed: isDimmedNode(node.id) },
            ]"
            :d="node.linePath"
            fill="none"
            filter="url(#softGlow)"
          />
        </template>

        <g class="center-group" @click="clearSelection">
          <circle class="center-core" :cx="center.x" :cy="center.y" r="46" />
          <circle class="center-pulse" :cx="center.x" :cy="center.y" r="56" />
          <text class="center-text" :x="center.x" :y="center.y + 6" text-anchor="middle">
            {{ centerLabel }}
          </text>
        </g>

        <template v-for="node in nodeViews" :key="node.id">
          <g
            class="skill-node"
            :class="[
              getStatusClass(node.status),
              { active: activeId === node.id, dimmed: isDimmedNode(node.id) },
            ]"
            :transform="`translate(${node.x}, ${node.y})`"
            @mouseenter="showTooltip($event, node)"
            @mousemove="moveTooltip"
            @mouseleave="hideTooltip"
            @click="toggleSelected(node.id)"
          >
            <circle class="node-orbit" :r="node.radius + 8" />
            <circle class="node-core" :r="node.radius" />
            <text class="node-label" text-anchor="middle" dy="0.35em">
              {{ $t(`skill.item.${node.id}.label`) }}
            </text>
          </g>
        </template>
      </svg>

      <div
        v-if="tooltip.visible && tooltip.skill"
        class="skill-tooltip"
        :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }"
      >
        <p class="skill-tooltip__status">{{ getStatusLabel(tooltip.skill.status) }}</p>
        <h4 class="skill-tooltip__title">{{ $t(`skill.item.${tooltip.skill.id}.label`) }}</h4>
        <p class="skill-tooltip__desc">{{ $t(`skill.item.${tooltip.skill.id}.description`) }}</p>
      </div>

      <aside class="detail-panel">
        <div class="detail-card">
          <template v-if="activeSkill">
            <div class="detail-meta">
              <span class="detail-tag" :class="getStatusClass(activeSkill.status)">
                {{ getStatusLabel(activeSkill.status) }}
              </span>
            </div>
            <h3 class="detail-title">{{ $t(`skill.item.${activeSkill.id}.label`) }}</h3>
            <p class="detail-desc">{{ $t(`skill.item.${activeSkill.id}.description`) }}</p>
          </template>

          <template v-else>
            <div class="detail-meta">
              <span class="detail-tag neutral">{{ $t('skill.overview') }}</span>
            </div>
            <h3 class="detail-title">{{ $t('skill.skillMap') }}</h3>
            <p class="detail-desc">{{ $t('skill.skillDesc') }}</p>
          </template>
        </div>

        <div class="legend">
          <div class="legend-item">
            <span class="legend-dot mastered"></span>
            <span>{{ $t('skill.mastered') }}</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot learning"></span>
            <span>{{ $t('skill.learning') }}</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot planned"></span>
            <span>{{ $t('skill.planned') }}</span>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped lang="scss">
.skill-constellation {
  --sk-bg: rgba(255, 255, 255, 0.9);
  --sk-surface: rgba(255, 255, 255, 0.94);
  --sk-line: rgba(15, 23, 42, 0.12);
  --sk-ring: rgba(15, 23, 42, 0.1);
  --sk-text: #111827;
  --sk-text-soft: rgba(17, 24, 39, 0.68);
  --sk-mastered: #2f6b45;
  --sk-learning: #9a6632;
  --sk-planned: #767676;
  --sk-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  padding: clamp(4rem, 3rem + 2vw, 7rem) 0;
}

html.dark {
  .skill-constellation {
    --sk-bg: rgba(17, 24, 39, 0.9);
    --sk-surface: rgba(17, 24, 39, 0.94);
    --sk-line: rgba(255, 255, 255, 0.14);
    --sk-ring: rgba(255, 255, 255, 0.12);
    --sk-text: #f9fafb;
    --sk-text-soft: rgba(249, 250, 251, 0.76);
    --sk-mastered: #63d297;
    --sk-learning: #ffbf75;
    --sk-planned: #c4c4c4;
    --sk-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }
}

.section-head {
  width: min(100%, 110rem);
  margin: 0 auto 2.4rem;
  padding: 0 1.6rem;
}

.header {
  margin: 0.8rem 0 0;
  color: var(--text-color-tertiary, var(--sk-text-soft));
  font-size: 1.3rem;
  letter-spacing: 0.14rem;
}

.title {
  margin: 0;
  color: var(--text-color-primary, var(--sk-text));
  font-size: clamp(2.6rem, 2rem + 1.5vw, 4.2rem);
  line-height: 1.15;
  max-width: 72rem;
}

.constellation-shell {
  position: relative;
  width: min(100%, 120rem);
  margin: 0 auto;
  padding: 0 1.6rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 28rem;
  gap: 2.4rem;
  align-items: center;
}

.constellation-svg {
  width: 100%;
  height: auto;
  display: block;
  overflow: visible;
}

.ambient-ring {
  fill: none;
  stroke: var(--sk-ring);
  stroke-width: 1;
  opacity: 0.7;
}

.ring-1 {
  stroke-dasharray: 8 10;
}

.ring-2 {
  stroke-dasharray: 5 12;
}

.ring-3 {
  stroke-dasharray: 4 14;
}

.skill-link {
  stroke: var(--sk-line);
  stroke-width: 1.4;
  opacity: 0.55;
  transition:
    opacity 220ms ease,
    stroke-width 220ms ease;
}

.skill-link.active {
  opacity: 0.95;
  stroke-width: 2;
}

.skill-link.dimmed {
  opacity: 0.1;
}

.skill-line {
  stroke-width: 2;
  transition:
    opacity 220ms ease,
    stroke-width 220ms ease;
}

.skill-line.is-mastered {
  stroke: var(--sk-mastered);
  opacity: 0.62;
}

.skill-line.is-learning {
  stroke: var(--sk-learning);
  opacity: 0.52;
}

.skill-line.is-planned {
  stroke: var(--sk-planned);
  opacity: 0.36;
  stroke-dasharray: 5 6;
}

.skill-line.active {
  opacity: 1;
  stroke-width: 3;
}

.skill-line.dimmed {
  opacity: 0.12;
}

.center-core {
  fill: var(--sk-surface);
  stroke: var(--sk-mastered);
  stroke-width: 2;
  filter: drop-shadow(0 0 16px rgba(127, 127, 127, 0.12));
}

.center-pulse {
  fill: none;
  stroke: var(--sk-learning);
  stroke-width: 1.2;
  animation: pulse-ring 3.6s ease-in-out infinite;
}

.center-text {
  fill: var(--sk-text);
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.06rem;
}

.skill-node {
  cursor: pointer;
  transition:
    opacity 220ms ease,
    transform 220ms ease;
}

.skill-node.dimmed {
  opacity: 0.28;
}

.node-orbit {
  fill: none;
  stroke-width: 1.2;
  opacity: 0.48;
}

.node-core {
  stroke-width: 1.5;
  transition:
    transform 220ms ease,
    filter 220ms ease,
    opacity 220ms ease;
}

.node-label {
  fill: var(--sk-text);
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: 0.03rem;
  pointer-events: none;
  user-select: none;
}

.skill-node.is-mastered .node-orbit {
  stroke: var(--sk-mastered);
}

.skill-node.is-mastered .node-core {
  fill: color-mix(in srgb, var(--sk-mastered) 12%, var(--sk-surface));
  stroke: var(--sk-mastered);
}

.skill-node.is-learning .node-orbit {
  stroke: var(--sk-learning);
}

.skill-node.is-learning .node-core {
  fill: color-mix(in srgb, var(--sk-learning) 10%, var(--sk-surface));
  stroke: var(--sk-learning);
  animation: breathing 3.4s ease-in-out infinite;
}

.skill-node.is-planned .node-orbit {
  stroke: var(--sk-planned);
  stroke-dasharray: 4 4;
}

.skill-node.is-planned .node-core {
  fill: transparent;
  stroke: var(--sk-planned);
}

.skill-node.active .node-core {
  transform: scale(1.06);
  filter: drop-shadow(0 0 14px rgba(127, 127, 127, 0.16));
}

.skill-tooltip {
  position: absolute;
  z-index: 10;
  width: min(24rem, calc(100vw - 4rem));
  padding: 1.2rem 1.4rem;
  border: 1px solid var(--sk-line);
  border-radius: 1.2rem;
  background: var(--sk-bg);
  backdrop-filter: blur(10px);
  box-shadow: var(--sk-shadow);
  pointer-events: none;
}

.skill-tooltip__status {
  margin: 0 0 0.4rem;
  color: var(--sk-text-soft);
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.08rem;
}

.skill-tooltip__title {
  margin: 0 0 0.4rem;
  color: var(--sk-text);
  font-size: 1.5rem;
  line-height: 1.3;
}

.skill-tooltip__desc {
  margin: 0;
  color: var(--sk-text-soft);
  font-size: 1.25rem;
  line-height: 1.6;
}

.detail-panel {
  @include mx.flex(column, flex-start, normal, 1.6rem);
}

.detail-card {
  min-height: 18rem;
  padding: 2rem;
  border: 1px solid var(--sk-line);
  border-radius: 2rem;
  background: var(--sk-surface);
  box-shadow: var(--sk-shadow);
}

.detail-meta {
  margin-bottom: 1rem;
}

.detail-tag {
  display: inline-flex;
  align-items: center;
  height: 2.8rem;
  padding: 0 1rem;
  border-radius: 999px;
  font-size: 1.2rem;
  letter-spacing: 0.04rem;
  border: 1px solid var(--sk-line);
  background: transparent;
}

.detail-tag.is-mastered {
  color: var(--sk-mastered);
}

.detail-tag.is-learning {
  color: var(--sk-learning);
}

.detail-tag.is-planned {
  color: var(--sk-planned);
}

.detail-tag.neutral {
  color: var(--sk-text-soft);
}

.detail-title {
  margin: 0 0 0.8rem;
  color: var(--sk-text);
  font-size: 2.2rem;
  line-height: 1.2;
}

.detail-desc {
  margin: 0;
  color: var(--sk-text-soft);
  font-size: 1.45rem;
  line-height: 1.7;
}

.legend {
  display: grid;
  gap: 1rem;
}

.legend-item {
  @include mx.flex(row, flex-start, center, 0.8rem);
  color: var(--text-color-primary, var(--sk-text));
  font-size: 1.3rem;
}

.legend-dot {
  width: 1rem;
  height: 1rem;
  border-radius: 999px;
}

.legend-dot.mastered {
  background: var(--sk-mastered);
}

.legend-dot.learning {
  background: var(--sk-learning);
}

.legend-dot.planned {
  background: var(--sk-planned);
}

@keyframes pulse-ring {
  0%,
  100% {
    opacity: 0.35;
    transform: scale(0.98);
  }
  50% {
    opacity: 0.75;
    transform: scale(1.03);
  }
}

@keyframes breathing {
  0%,
  100% {
    opacity: 0.88;
  }
  50% {
    opacity: 1;
  }
}

@include bp.down(bp.$bp-laptop) {
  .constellation-shell {
    grid-template-columns: 1fr;
  }

  .detail-panel {
    max-width: 64rem;
  }
}

@include bp.down(bp.$bp-tablet) {
  .section-head {
    margin-bottom: 1.6rem;
  }

  .title {
    font-size: clamp(2.2rem, 1.8rem + 1vw, 3.2rem);
  }

  .detail-card {
    min-height: auto;
  }

  .skill-tooltip {
    display: none;
  }
}
</style>
