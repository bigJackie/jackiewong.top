import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/Home.vue'),
    },
    {
      path: '/blog',
      name: 'Blog',
      component: () => import('../views/Blog.vue'),
    },
    {
      path: '/blog/:id',
      name: 'BlogPost',
      component: () => import('../views/BlogPost.vue'),
    },
    {
      path: '/gallery',
      name: 'Gallery',
      component: () => import('../views/Gallery.vue'),
    },
    {
      path: '/gallery/:id',
      name: 'GalleryItem',
      component: () => import('../views/GalleryItem.vue'),
    },
    {
      path: '/files',
      name: 'Files',
      component: () => import('../views/Files.vue'),
    },
    {
      path: '/about',
      name: 'About',
      component: () => import('../views/About.vue'),
    },
  ],
})

export default router
