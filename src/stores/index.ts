import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { type Post } from '@/constants'

export const usePostStore = defineStore('post', () => {
  const posts: Ref<Post[]> = ref([])

  const add = (post: Post) => {
    posts.value.push(post)
  }

  const clear = () => {
    posts.value = []
  }

  return { posts, add, clear }
})
