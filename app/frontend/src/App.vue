<template>
  <div class="flex h-screen bg-background overflow-hidden text-foreground relative">
    <!-- UI components only visible inside the functional app (/app/...) -->
    <template v-if="$route.path.startsWith('/app')">
      <!-- Mobile Sidebar Backdrop -->
      <div 
        v-if="uiStore.isMobileSidebarOpen && !uiStore.isZenMode"
        @click="uiStore.toggleMobileSidebar(false)"
        class="md:hidden fixed inset-0 bg-black/50 z-[55] backdrop-blur-sm transition-all"
      ></div>

      <Sidebar v-if="!uiStore.isZenMode && !uiStore.isSidebarHidden" />
      <div class="flex flex-col flex-1 overflow-hidden">
        <Header v-if="!uiStore.isZenMode && !uiStore.isSidebarHidden" />
        <main 
          class="flex-1 overflow-auto bg-background transition-colors duration-300"
          :class="[
            uiStore.isMaximized ? 'p-3 md:p-6' : 'p-4 md:p-16',
            (uiStore.isZenMode || uiStore.isSidebarHidden) ? '!p-0' : '',
            'max-w-full'
          ]"
        >
          <RouterView />
        </main>
      </div>
    </template>
    
    <!-- Full screen views for Landing, Portal, etc. -->
    <template v-else>
      <main class="flex-1 overflow-auto bg-[#0a0a0c]">
        <RouterView />
      </main>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import Header from './components/layout/Header.vue'
import Sidebar from './components/layout/Sidebar.vue'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'

const uiStore = useUIStore()
const authStore = useAuthStore()

onMounted(() => {
  authStore.fetchEmployees()
})
</script>

<style scoped></style>
