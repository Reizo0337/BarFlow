<template>
  <div class="flex flex-col h-screen bg-slate-900 overflow-hidden">
    <Header />
    <main class="flex-1 overflow-auto bg-slate-900">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import Header from './components/layout/Header.vue'
</script>

<style scoped></style>
