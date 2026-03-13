<script setup lang="ts">
import { type FileItem } from '@/constants'
import { createFileItems, formatDateFull, formatFileSize, withFileMeta } from '@/utils'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const files = ref<FileItem[]>(createFileItems())

onMounted(async () => {
  files.value = await withFileMeta(files.value)
})

function modifiedText(modified: string) {
  if (!modified) return '--'
  return formatDateFull(modified, locale.value)
}
</script>

<template>
  <section class="view-shell">
    <div class="collection-box files-box">
      <ul v-if="files.length" class="file-list">
        <li v-for="file in files" :key="file.id" class="file-item">
          <div class="file-main">
            <a :href="file.path" target="_blank" rel="noopener" class="file-name text-link">
              {{ file.name }}
            </a>
          </div>

          <div class="file-meta">
            <p class="meta-line">
              <span>{{ $t('filesView.meta.type') }}</span>
              <strong>{{ file.ext || '--' }}</strong>
            </p>
            <p class="meta-line">
              <span>{{ $t('filesView.meta.size') }}</span>
              <strong>{{ formatFileSize(file.size) }}</strong>
            </p>
            <p class="meta-line">
              <span>{{ $t('filesView.meta.modified') }}</span>
              <strong>{{ modifiedText(file.modified) }}</strong>
            </p>
          </div>

          <div class="file-actions">
            <a
              v-if="file.previewable"
              :href="file.path"
              target="_blank"
              rel="noopener"
              class="text-link"
            >
              {{ $t('filesView.actions.preview') }}
            </a>
            <a :href="file.path" class="text-link" download>
              {{ $t('filesView.actions.download') }}
            </a>
          </div>
        </li>
      </ul>

      <p v-else class="empty-tip">{{ $t('filesView.empty') }}</p>
    </div>
  </section>
</template>

<style scoped lang="scss">
.files-box {
  .file-list {
    margin: 0;
    padding: 0;
    list-style: none;
    @include mx.flex(column, flex-start, stretch, 1.2rem);
  }

  .file-item {
    border: 1px solid var(--line-color);
    border-radius: var(--radius-md);
    background: var(--surface-color);
    padding: 1.2rem 1.4rem;
    @include mx.flex(row, space-between, center, 1.6rem);
    flex-wrap: wrap;
  }

  .file-main {
    min-width: 18rem;
    flex: 1;
  }

  .file-name {
    font-size: var(--text-md);
    font-weight: var(--weight-medium);
  }

  .file-meta {
    min-width: 22rem;
  }

  .meta-line {
    margin: 0;
    @include mx.flex(row, space-between, center, 1rem);
    font-size: var(--text-sm);
    color: var(--text-color-tertiary);

    strong {
      color: var(--text-color-secondary);
      font-weight: var(--weight-medium);
    }
  }

  .meta-line + .meta-line {
    margin-top: 0.2rem;
  }

  .file-actions {
    @include mx.flex(row, flex-start, center, 1rem);
    white-space: nowrap;
  }
}

@include bp.down(bp.$bp-tablet) {
  .files-box {
    .file-item {
      align-items: flex-start;
    }

    .file-meta {
      width: 100%;
      min-width: 0;
    }
  }
}
</style>
