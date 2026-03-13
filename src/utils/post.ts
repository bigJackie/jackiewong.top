import type { Post } from '@/constants'
import { usePostStore } from '@/stores'

export const usePosts = () => {
  const posts = usePostStore()

  const createPosts = () => {
    const files = import.meta.glob('@public/posts/**/*.md')

    posts.clear()

    for (const i in files) {
      const file = files[i] as () => Promise<Post>
      const path = pathFilter(file.name, 'posts', 2)

      file().then((res) => {
        const post = res

        posts.add({
          id: path,
          title: post.title,
          category: post.category,
          date: post.date,
          default: res.default,
        })
      })
    }
  }

  const pathFilter = (path: string, prefix: string, index: number) =>
    path.replace(new RegExp(`(.*[${prefix}]\\/)(.*)\\/?.*`, 'gi'), `$${index}`)

  return { createPosts, pathFilter }
}
