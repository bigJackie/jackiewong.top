import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './i18n'
import './styles/index.scss'
import { usePosts } from './utils'

const app = createApp(App)

app.use(createPinia()).use(router).use(i18n)

usePosts().createPosts()

app.mount('#app')
