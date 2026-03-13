<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { brands, links } from '@/constants'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

onMounted(() => {
  initTheme()
})

const route = useRoute()
const darkMode = ref(false)

const brand = computed(() =>
  darkMode.value
    ? new URL(brands.dark, import.meta.url).href
    : new URL(brands.light, import.meta.url).href,
)

function initTheme() {
  const theme = localStorage.getItem('theme')
  locale.value = localStorage.getItem('locale') || 'zh-CN'

  if (theme === 'dark') {
    darkMode.value = true
  } else if (theme === 'light') {
    darkMode.value = false
  } else {
    darkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  document.documentElement.classList.toggle('dark', darkMode.value)
}

function isActive(path: string) {
  if (path === '/') {
    return route.path === '/'
  }

  return route.path === path || route.path.startsWith(`${path}/`)
}

function toggleLocale() {
  locale.value = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN'
  localStorage.setItem('locale', locale.value)
}

function toggleTheme() {
  const root = document.documentElement
  root.classList.add('theme-transition')

  darkMode.value = !darkMode.value
  root.classList.toggle('dark', darkMode.value)
  localStorage.setItem('theme', darkMode.value ? 'dark' : 'light')

  window.setTimeout(() => {
    root.classList.remove('theme-transition')
  }, 800)
}
</script>

<template>
  <header class="nav-wrap">
    <nav class="nav">
      <RouterLink to="/">
        <img :src="brand" class="brand" alt="Brand" />
      </RouterLink>

      <ul class="nav-items">
        <li v-for="item in links" :key="item.to" class="nav-item">
          <RouterLink :to="item.to" class="nav-link" :class="{ active: isActive(item.to) }">
            {{ $t(item.key) }}
          </RouterLink>
        </li>
      </ul>

      <div class="nav-actions">
        <ul class="nav-items">
          <li v-for="item in links" :key="item.to" class="nav-item">
            <RouterLink
              :to="item.to"
              class="nav-link"
              :class="{ active: isActive(item.to) }"
              :title="$t(item.key)"
            >
              <Icon class="iconify" :icon="item.icon"></Icon>
            </RouterLink>
          </li>
        </ul>
        <a
          class="action-link"
          target="_blank"
          title="github"
          href="https://github.com/bigJackie/"
          rel="noreferrer"
        >
          <Icon class="iconify action-button" icon="mdi:github"></Icon>
        </a>
        <Icon
          class="iconify action-button"
          :icon="locale === 'zh-CN' ? 'mdi:ideogram-cjk-variant' : 'mdi:alphabetical-variant'"
          @click="toggleLocale"
        ></Icon>
        <Icon
          class="iconify action-button"
          :icon="darkMode ? 'mdi:weather-night' : 'mdi:white-balance-sunny'"
          @click="toggleTheme"
        ></Icon>
      </div>
    </nav>
  </header>
</template>

<style scoped lang="scss">
.nav-wrap {
  border-bottom: 1px solid var(--line-color);
  background: var(--background-color);

  .iconify {
    width: 2.8rem;
    height: auto;
  }

  .nav {
    margin: 0 auto;
    padding: 0 1.6rem;
    min-height: 7.2rem;
    @include mx.flex(row, space-between);

    .brand {
      display: block;
      min-width: 12rem;
      height: 6rem;
      object-fit: contain;
    }
  }

  .nav-items {
    list-style: none;
    margin: 0;
    padding: 0;
    @include mx.flex(row, center, center, 2rem);

    .nav-link {
      &:hover,
      &.active {
        color: var(--text-hover-color-primary);
      }

      text-decoration: none;
      color: var(--text-color-secondary);
      font-size: var(--text-md);
      letter-spacing: 0.1rem;
      transition: color 0.2s ease;
    }
  }

  .nav-actions {
    @include mx.flex(row, center, center, 2rem);

    .nav-items {
      .nav-link {
        display: inline-flex;
        align-items: center;
      }
    }

    .action-link {
      display: inline-flex;
      align-items: center;
    }

    .action-button {
      &:hover {
        color: var(--text-hover-color-primary);
      }

      color: var(--text-color-secondary);
      cursor: pointer;
    }
  }
}

@include bp.down(bp.$bp-tablet) {
  .nav-wrap {
    .iconify {
      width: 2.4rem;
      height: 2.4rem;
    }

    .nav {
      height: auto;
      min-height: 5rem;
      gap: 1.2rem;
      padding: 0 1.2rem;

      .brand {
        min-width: 8rem;
        height: 4rem;
      }

      .nav-items {
        display: none;
      }

      .nav-actions {
        min-width: 30rem;

        .nav-items {
          @include mx.flex(row, space-between, center, 2.4rem);

          .nav-item {
            height: 2.4rem;
          }
        }
      }
    }
  }
}

@include bp.up(bp.$bp-tablet) {
  .nav-wrap {
    .nav {
      height: auto;

      .nav-items {
        flex-wrap: wrap;
        gap: 1rem 1.4rem;
      }

      .nav-actions {
        .nav-items {
          display: none;
        }
      }
    }
  }
}
</style>
