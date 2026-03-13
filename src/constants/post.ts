import type { Component } from 'vue'

export type Post = {
  id: string
  title: string
  date: string
  category: string
  default: Component
}

export type YearItem = {
  type: 'year'
  year: string
}

export type PostItem = {
  type: 'post'
  post: Post
}

export type ArchiveItem = YearItem | PostItem

export const ALL_POSTS = 'All'

export const categories = [
  { name: 'tech' },
  { name: 'travel' },
  { name: 'notes' },
  { name: 'projects' },
  { name: 'life' },
]
