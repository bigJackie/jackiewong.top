<script setup lang="ts">
const files = [
  { name: 'resume.pdf', path: '/files/resume.pdf' },
  { name: 'portfolio.zip', path: '/files/portfolio.zip' },
]
</script>

<template>
  <section class="page">
    <h1>Files</h1>
    <ul class="list">
      <li v-for="file in files" :key="file.name">
        <a :href="file.path" target="_blank" rel="noopener">{{ file.name }}</a>
      </li>
    </ul>
    <p class="tip">提示：请把真实文件放到 public/files 目录。</p>
  </section>
</template>

<style scoped>
.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 16px;
}
.list {
  padding-left: 20px;
}
.tip {
  margin-top: 12px;
  color: #6b7280;
}
</style>
