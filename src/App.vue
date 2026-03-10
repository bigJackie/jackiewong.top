<template>
  <div class="app">
    <header class="header">
      <nav class="nav">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/blog">Blog</RouterLink>
        <RouterLink to="/gallery">Gallery</RouterLink>
        <RouterLink to="/files">Files</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: #f8fafc;
  color: #111827;
}

.header {
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}

.nav {
  max-width: 960px;
  margin: 0 auto;
  padding: 16px;
  display: flex;
  gap: 16px;
}

.nav a {
  text-decoration: none;
  color: #374151;
}

.nav a.router-link-active {
  color: #2563eb;
  font-weight: 600;
}
</style>
