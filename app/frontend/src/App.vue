<template>
  <div class="flex h-screen bg-background overflow-hidden text-foreground relative">
    <!-- Mobile Sidebar Backdrop -->
    <div 
      v-if="uiStore.isMobileSidebarOpen"
      @click="uiStore.toggleMobileSidebar(false)"
      class="md:hidden fixed inset-0 bg-black/50 z-[55] backdrop-blur-sm transition-all"
    ></div>

    <Sidebar />
    <div class="flex flex-col flex-1 overflow-hidden">
      <Header />
      <main 
        class="flex-1 overflow-auto bg-background transition-colors duration-300"
        :class="[
          uiStore.isMaximized ? 'p-3 md:p-6' : 'p-4 md:p-16',
          'max-w-full'
        ]"
      >
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import Header from './components/layout/Header.vue'
import Sidebar from './components/layout/Sidebar.vue'
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()
</script>

<style scoped></style>
