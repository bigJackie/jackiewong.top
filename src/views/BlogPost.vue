<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const postId = computed(() => String(route.params.id ?? ''))
</script>

<template>
  <section class="page">
    <h1>Blog Post</h1>
    <p>当前文章 ID：<strong>{{ postId }}</strong></p>
    <RouterLink to="/blog">返回博客列表</RouterLink>
  </section>
</template>

<style scoped>
.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 16px;
}
</style>
