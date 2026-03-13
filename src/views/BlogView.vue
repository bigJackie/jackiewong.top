<script setup lang="ts">
import { ALL_POSTS, categories, type ArchiveItem, type YearItem } from '@/constants'
import { usePostStore } from '@/stores'
import { formatDateMonthDay, sortByDateDesc } from '@/utils'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

// const posts = [
//   { id: 'welcome', title: 'Welcome Post', date: '2020-06-22', category: 'tech' },
//   { id: 'vue-router', title: 'Vue Router Notes', date: '2021-07-15', category: 'tech' },
//   { id: 'deploy-netlify', title: 'Deploy to Netlify', date: '2025-08-10', category: 'tech' },
//   { id: 'typescript-tips', title: 'TypeScript Tips', date: '2023-09-05', category: 'tech' },
//   { id: 'css-grid', title: 'CSS Grid Layout', date: '2022-12-18', category: 'tech' },
//   { id: 'europe-trip', title: 'My Europe Trip', date: '2024-01-20', category: 'travel' },
//   { id: 'japan-adventure', title: 'Japan Adventure', date: '2023-03-12', category: 'travel' },
//   { id: 'usa-roadtrip', title: 'USA Roadtrip', date: '2022-05-30', category: 'travel' },
//   { id: 'southeast-asia', title: 'Southeast Asia Travels', date: '2021-11-08', category: 'travel' },
//   { id: 'daily-notes', title: 'Daily Notes', date: '2024-02-14', category: 'notes' },
//   { id: 'book-summaries', title: 'Book Summaries', date: '2023-04-22', category: 'notes' },
//   { id: 'coding-challenges', title: 'Coding Challenges', date: '2022-08-18', category: 'notes' },
//   { id: 'project-x', title: 'Project X Overview', date: '2023-06-22', category: 'projects' },
//   {
//     id: 'open-source-contribution',
//     title: 'Open Source Contribution',
//     date: '2022-10-05',
//     category: 'projects',
//   },
//   {
//     id: 'personal-website',
//     title: 'Building My Personal Website',
//     date: '2021-12-01',
//     category: 'projects',
//   },
//   { id: 'life-lessons', title: 'Life Lessons Learned', date: '2022-09-10', category: 'life' },
//   {
//     id: 'work-life-balance',
//     title: 'Work-Life Balance Tips',
//     date: '2023-01-15',
//     category: 'life',
//   },
// ]

const posts = usePostStore().posts

const { locale } = useI18n()

const active = ref(localStorage.getItem('activeCategory') ?? ALL_POSTS)

const filterPosts = computed<ArchiveItem[]>(() => {
  const filtered =
    !active.value || active.value === ALL_POSTS
      ? posts
      : posts.filter((post) => post.category === active.value)

  const sorted = [...filtered].sort(sortByDateDesc)

  if (!sorted.length) return []

  const group: ArchiveItem[] = []
  let currentYear = ''

  for (const post of sorted) {
    const year = post.date.slice(0, 4)

    if (year !== currentYear) {
      currentYear = year
      group.push({ type: 'year', year })
    }

    group.push({ type: 'post', post })
  }

  return group
})

function toggleCategory(categoryName: string) {
  active.value = categoryName
  localStorage.setItem('activeCategory', categoryName)
}
</script>

<template>
  <section class="view-shell">
    <div class="post-box">
      <nav class="post-nav">
        <ul class="nav-list">
          <li
            :class="['nav-item', { active: active === ALL_POSTS }]"
            @click="toggleCategory(ALL_POSTS)"
          >
            {{ $t('posts.all') }}
          </li>

          <li
            v-for="category in categories"
            :key="category.name"
            :class="['nav-item', { active: active === category.name }]"
            @click="toggleCategory(category.name)"
          >
            {{ $t(`posts.categories.${category.name}`) }}
          </li>
        </ul>
      </nav>

      <TransitionGroup name="post" tag="ul" class="post-list">
        <div
          v-for="(item, index) in filterPosts"
          :key="`${active}-${index}`"
          :style="{ '--enter-stage': index }"
          class="slide-item"
        >
          <div v-show="item.type === 'year'" class="year-box">
            <h1 class="year-title">{{ (item as YearItem).year }}</h1>
            <hr class="divider" />
          </div>

          <ul v-if="item.type === 'post'" class="post-item">
            <RouterLink :to="`/blog/${item.post?.id}`" class="post-link">
              <h2 class="post-title">{{ item.post?.title }}</h2>
              <p class="post-date">{{ formatDateMonthDay(item.post?.date ?? '', locale) }}</p>
            </RouterLink>
          </ul>
        </div>
      </TransitionGroup>
    </div>
  </section>
</template>

<style scoped lang="scss">
.post-box {
  max-width: 64.8rem;
  margin: 0 auto;

  .post-nav {
    margin-bottom: clamp(18px, 2vw, 24px);

    .nav-list {
      @include mx.flex(row, flex-start, center, clamp(1.2rem, 1.5vw, 1.8rem));
      padding: 0;
      margin: 0;
      list-style: none;

      @include mx.selectNone;

      .nav-item {
        font-size: var(--text-lg);
        font-weight: var(--weight-semibold);
        color: var(--text-color-tertiary);
        cursor: pointer;
        transition: all 0.25s ease;

        &:hover {
          color: var(--text-color-secondary);
        }

        &.active {
          color: var(--text-color-primary);
        }
      }
    }
  }

  .post-list {
    padding: 0;
    margin-bottom: 0;
    list-style: none;
  }

  .year-box {
    position: relative;
    @include mx.selectNone;

    .year-title {
      position: absolute;
      transform: translate(-10%, -100%);
      font-size: calc(var(--text-xl) * 2.8);
      font-weight: var(--weight-medium);
      color: transparent;
      -webkit-text-stroke-color: var(--text-color-secondary);
      opacity: 0.08;
      -webkit-text-stroke-width: 3px;
    }

    .divider {
      margin-top: 10rem;
    }
  }

  .slide-item {
    --enter-stage: 0;
    --enter-step: 60ms;
  }

  .post-item {
    position: relative;

    z-index: 998;

    &:hover {
      .post-title {
        color: var(--text-color-secondary);
      }

      .post-date {
        color: var(--text-color-tertiary);
      }
    }

    .post-link {
      text-decoration: none;
      @include mx.flex(row, flex-start, center, 1rem);
      padding: 0.6rem 0;
    }

    .post-title {
      margin: 0;
      color: var(--text-color-tertiary);
      font-size: var(--text-md);
      font-weight: var(--weight-medium);
      line-height: 1.5;
    }

    .post-date {
      margin: 0;
      color: var(--text-color-quaternary);
      font-size: var(--text-sm);
      white-space: nowrap;
    }
  }
}

@keyframes slide-enter {
  0% {
    transform: translateY(10px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .post-enter-active {
    animation: slide-enter 1s both 1;
    animation-delay: calc(var(--enter-stage) * var(--enter-step));
    will-change: transform, opacity;
  }
}

@media (prefers-reduced-motion: reduce) {
  .post-enter-active,
  .post-leave-active,
  .post-move {
    animation: none !important;
    transition: none !important;
  }
}

@include bp.down(bp.$bp-mobile) {
  .post-box {
    padding: 0 2.4rem;
  }
}
</style>
