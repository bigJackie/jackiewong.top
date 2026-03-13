import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/blog',
      name: 'Blog',
      component: () => import('../views/BlogView.vue'),
    },
    {
      path: '/blog/:category/:id',
      name: 'BlogPost',
      component: () => import('../views/BlogPost.vue'),
    },
    {
      path: '/gallery',
      name: 'Gallery',
      component: () => import('../views/GalleryView.vue'),
    },
    {
      path: '/files',
      name: 'Files',
      component: () => import('../views/FilesView.vue'),
    },
  ],
})

export default router
