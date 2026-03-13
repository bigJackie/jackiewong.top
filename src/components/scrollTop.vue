<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Icon } from '@iconify/vue'

const y = ref(0)

const visible = computed(() => y.value > 120)

const onScroll = () => {
  y.value = window.scrollY || window.pageYOffset
}

function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <button class="scroll-top" :class="{ show: visible }" type="button" @click="scrollTop">
    <Icon class="iconify icon-scroll" icon="mdi:arrow-up"></Icon>
  </button>
</template>

<style scoped lang="scss">
.scroll-top {
  position: fixed;
  z-index: 999;
  right: clamp(12px, 3vw, 42px);
  bottom: clamp(12px, 3vw, 42px);
  width: clamp(36px, 4.2vw, 46px);
  height: clamp(36px, 4.2vw, 46px);
  border: none;
  background-color: transparent;
  color: var(--text-color-primary);
  font-size: clamp(1rem, 1.2vw, 1.15rem);
  cursor: pointer;
  opacity: 0;
  transform: translateY(12px);
  transition: all 0.25s ease;

  &:hover {
    color: var(--text-hover-color-primary);
  }

  &.show {
    opacity: 1;
    transform: translateY(0);
  }
}

.icon-scroll {
  width: clamp(20px, 1.5vw, 24px);
  height: clamp(20px, 1.5vw, 24px);
}

@include bp.down(bp.$bp-mobile) {
  .scroll-top {
    border-radius: 100%;
    border: 1px solid var(--line-color);
  }
}
</style>
