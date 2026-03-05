<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Minus, Square, X, Copy } from 'lucide-vue-next'

const isMaximized = ref(false)

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

// Optional: listen for actual maximize events to keep state in sync
onMounted(() => {
  if (window.ipcRenderer) {
    window.ipcRenderer.on('window-maximized', (_event: any, value: boolean) => {
      isMaximized.value = value
    })
  }
})

// Type helper for the template
declare global {
  interface Window {
    ipcRenderer: any;
  }
}
</script>

<template>
  <div 
    class="flex items-center justify-between h-10 bg-slate-900 text-slate-400 select-none border-b border-slate-800" 
    style="-webkit-app-region: drag"
  >
    <!-- App Title / Logo -->
    <div class="flex items-center px-4 gap-2">
      <div class="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center">
        <span class="text-[10px] text-white font-bold italic">B</span>
      </div>
      <span class="text-xs font-semibold tracking-wide text-slate-300">BarFlow</span>
    </div>

    <!-- Window Controls -->
    <div class="flex h-full items-stretch" style="-webkit-app-region: no-drag">
      <button 
        @click="minimize" 
        class="flex items-center justify-center w-12 hover:bg-slate-800 transition-colors"
        title="Minimizar"
      >
        <Minus class="w-3.5 h-3.5" />
      </button>

      <button 
        @click="toggleMaximize" 
        class="flex items-center justify-center w-12 hover:bg-slate-800 transition-colors"
        title="Maximizar"
      >
        <component :is="isMaximized ? Copy : Square" class="w-3 h-3" :class="{'rotate-180': isMaximized}" />
      </button>

      <button 
        @click="close" 
        class="flex items-center justify-center w-12 hover:bg-red-600 hover:text-white transition-colors"
        title="Cerrar"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

