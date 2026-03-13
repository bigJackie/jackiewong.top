<template>
  <footer class="footer">
    <span class="footer-text">Designed and developed by Jackie Wong.</span>
  </footer>
</template>

<style scoped lang="scss">
.footer {
  @include mx.flex;
  border-top: 1px solid var(--line-color);
  background: var(--background-color);
  min-height: clamp(2.4rem, 2rem + 0.6vw, 3.6rem);

  .footer-text {
    &:hover {
      color: var(--text-color-secondary);
    }

    @include mx.flex;
    font-size: var(--text-xs);
    color: var(--text-color-tertiary);
    letter-spacing: 0.06rem;
    text-align: center;
    cursor: default;
  }
}
</style>
