<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import { useUIStore } from '@/stores/ui'
import { Minus, Square, X, Copy, Sun, Moon, Menu } from 'lucide-vue-next'

const themeStore = useThemeStore()
const uiStore = useUIStore()

const minimize = () => {
  if (window.ipcRenderer) {
    window.ipcRenderer.minimize()
  }
}

const toggleMaximize = () => {
  if (window.ipcRenderer) {
    window.ipcRenderer.maximize()
  }
}

const close = () => {
  if (window.ipcRenderer) {
    window.ipcRenderer.close()
  }
}

declare global {
  interface Window {
    ipcRenderer: any;
  }
}
</script>


<template>
  <div 
    class="flex items-center justify-between lg:justify-end h-14 bg-card text-foreground select-none border-b border-border transition-colors duration-300 px-4" 
    style="-webkit-app-region: drag"
  >
    <!-- Mobile Menu Toggle -->
    <button 
      @click="uiStore.toggleMobileSidebar(true)"
      class="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-foreground/50 hover:text-primary hover:bg-primary/10 transition-all active:scale-95"
      style="-webkit-app-region: no-drag"
    >
      <Menu class="w-6 h-6" />
    </button>

    <div class="flex h-full items-stretch" style="-webkit-app-region: no-drag">
      <!-- Dark Mode Toggle -->
      <button 
        @click="themeStore.toggleTheme" 
        class="flex items-center justify-center w-14 hover:bg-primary/10 transition-colors text-foreground"
        title="Cambiar Tema"
      >
        <Sun v-if="themeStore.isDark" class="w-5 h-5 text-amber-400" />
        <Moon v-else class="w-5 h-5 text-indigo-600" />
      </button>

      <!-- Window Controls -->
      <button 
        @click="minimize" 
        class="flex items-center justify-center w-14 hover:bg-primary/10 transition-colors"
        title="Minimizar"
      >
        <Minus class="w-5 h-5" />
      </button>

      <button 
        @click="toggleMaximize" 
        class="flex items-center justify-center w-14 hover:bg-primary/10 transition-colors"
        title="Maximizar"
      >
        <component :is="uiStore.isMaximized ? Copy : Square" class="w-4 h-4" />
      </button>

      <button 
        @click="close" 
        class="flex items-center justify-center w-14 hover:bg-red-500 hover:text-white transition-colors"
        title="Cerrar"
      >
        <X class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

