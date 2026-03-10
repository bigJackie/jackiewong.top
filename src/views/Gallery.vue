<script setup lang="ts">
const items = [
  { id: 'cover-1', title: 'Cover 1' },
  { id: 'cover-2', title: 'Cover 2' },
  { id: 'cover-3', title: 'Cover 3' },
]
</script>

<template>
  <section class="page">
    <h1>Gallery</h1>
    <ul class="grid">
      <li v-for="item in items" :key="item.id" class="tile">
        <h2>{{ item.title }}</h2>
        <RouterLink :to="`/gallery/${item.id}`">查看图片详情</RouterLink>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 16px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  list-style: none;
  padding: 0;
}
.tile {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
}
</style>
