<script lang="ts" setup>
import { usePostStore } from '@/stores'
import { usePosts } from '@/utils'
import { onMounted, ref } from 'vue'

const { posts } = usePostStore()

const post = ref()

onMounted(() => {
  const id = usePosts().pathFilter(window.location.pathname, 'blog', 2)
  post.value = posts.find((post) => post.id === id)?.default
})
</script>

<template>
  <section>
    <component :is="post" class="md-post"></component>
  </section>
</template>
