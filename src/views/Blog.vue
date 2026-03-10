<script setup lang="ts">
const posts = [
  { id: 'welcome', title: 'Welcome Post', summary: '项目初始化完成。' },
  { id: 'vue-router', title: 'Vue Router Notes', summary: '路由结构与页面拆分。' },
  { id: 'deploy-netlify', title: 'Deploy to Netlify', summary: '静态站点部署记录。' },
]
</script>

<template>
  <section class="page">
    <h1>Blog</h1>
    <ul class="list">
      <li v-for="post in posts" :key="post.id" class="card">
        <h2>{{ post.title }}</h2>
        <p>{{ post.summary }}</p>
        <RouterLink :to="`/blog/${post.id}`">查看详情</RouterLink>
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
.list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  list-style: none;
  padding: 0;
}
.card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
}
</style>
