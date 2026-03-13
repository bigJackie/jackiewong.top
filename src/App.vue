<script setup lang="ts">
import FooterBar from './components/FooterBar.vue'
import NavBar from './components/NavBar.vue'
import ScrollTop from './components/scrollTop.vue'
</script>

<template>
  <div class="app">
    <NavBar />
    <main class="main">
      <RouterView />
    </main>
    <ScrollTop />
    <FooterBar />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--background-color);
}

.main {
  flex: 1;
}
</style>
