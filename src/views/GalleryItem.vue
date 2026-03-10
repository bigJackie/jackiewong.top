<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const imageId = computed(() => String(route.params.id ?? ''))
</script>

<template>
  <section class="page">
    <h1>Gallery Item</h1>
    <p>当前图片 ID：<strong>{{ imageId }}</strong></p>
    <RouterLink to="/gallery">返回画廊</RouterLink>
  </section>
</template>

<style scoped>
.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 16px;
}
</style>
