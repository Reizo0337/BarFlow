<script setup lang="ts">
import { ref } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { useShiftsStore } from '@/stores/shifts'
import { Minus, Square, X, Copy, Sun, Moon, Menu, ChevronDown, User, LogOut } from 'lucide-vue-next'

import { useRouter } from 'vue-router'

const themeStore = useThemeStore()
const uiStore = useUIStore()
const authStore = useAuthStore()
const shiftsStore = useShiftsStore()
const router = useRouter()

const isUserMenuOpen = ref(false)

const handleLogout = async () => {
  // End shift if active before logging out
  if (shiftsStore.currentShift) {
    await shiftsStore.endShift()
  }
  authStore.logout()
  isUserMenuOpen.value = false
  router.push('/portal')
}

declare global {
  interface Window {
    ipcRenderer: any;
  }
}
</script>


<template>
  <div 
    class="flex items-center justify-between h-14 bg-card text-foreground select-none border-b border-border transition-colors duration-300 px-4 relative z-[100]" 
    style="-webkit-app-region: drag"
  >
    <div class="flex items-center gap-4 h-full" style="-webkit-app-region: no-drag">
      <!-- Mobile Menu Toggle -->
      <button 
        @click="uiStore.toggleMobileSidebar(true)"
        class="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-foreground/50 hover:text-primary hover:bg-primary/10 transition-all active:scale-95"
      >
        <Menu class="w-6 h-6" />
      </button>

      <!-- User Profile -->
      <div v-if="authStore.user" class="relative h-full flex items-center">
        <button 
          @click="isUserMenuOpen = !isUserMenuOpen"
          class="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-2xl hover:bg-accent/30 transition-all active:scale-95 group"
        >
          <div class="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary to-primary/40 text-white text-xs font-black border border-primary/20 shadow-sm">
            {{ authStore.user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) }}
          </div>
          <div class="hidden sm:block text-left">
            <p class="text-xs font-black leading-none mb-1 text-foreground/80 uppercase tracking-tighter">{{ authStore.user.name }}</p>
            <p class="text-[10px] font-bold leading-none text-primary/60 uppercase">{{ authStore.user.role }}</p>
          </div>
          <ChevronDown class="w-4 h-4 text-foreground/30 group-hover:text-primary transition-colors" />
        </button>

        <!-- User Dropdown -->
        <div 
          v-if="isUserMenuOpen"
          class="absolute top-full left-0 mt-2 w-56 bg-card border border-border shadow-2xl rounded-3xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div class="p-4 bg-accent/10 border-b border-border flex items-center gap-3">
             <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User class="w-5 h-5 text-primary" />
             </div>
             <div>
                <p class="text-xs font-black text-foreground uppercase tracking-tighter">{{ authStore.user.name }}</p>
                <p class="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">{{ authStore.user.role }}</p>
             </div>
          </div>
          <div class="p-2">
            <button 
              @click="handleLogout"
              class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-destructive/10 text-destructive transition-all font-black text-xs uppercase letter-spacing-widest"
            >
              <LogOut class="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
      <div v-else-if="authStore.isLoading" class="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-2xl animate-pulse">
        <div class="w-8 h-8 rounded-xl bg-accent/20"></div>
        <div class="w-20 h-3 bg-accent/20 rounded-full"></div>
      </div>
    </div>

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

    </div>
  </div>
</template>

