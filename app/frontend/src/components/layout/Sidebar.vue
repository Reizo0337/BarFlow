<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Home, Receipt, Settings, BarChart3, ChevronLeft, ChevronRight, Menu, ShieldCheck } from 'lucide-vue-next'
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()
const isHovered = ref(false)

const isExpanded = computed(() => !uiStore.isSidebarCollapsed)
</script>

<template>
    <aside 
        class="h-screen bg-card flex flex-col overflow-hidden border-r border-border transition-all duration-300 ease-in-out fixed md:relative z-[60] shadow-xl md:translate-x-0"
        :class="[
            isExpanded ? 'w-72' : 'w-16',
            uiStore.isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        ]"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
    >
        <!-- Sidebar Header (Toggle + Logo) -->
        <div 
            class="p-4 flex select-none transition-all duration-300" 
            :class="isExpanded ? 'flex-row items-center gap-3 px-6' : 'flex-col items-center gap-4 justify-center'"
            style="-webkit-app-region: drag"
        >
            <button 
                @click="uiStore.toggleSidebar()"
                class="hidden md:flex w-10 h-10 flex-shrink-0 items-center justify-center rounded-xl text-foreground/50 hover:text-primary hover:bg-primary/10 transition-all active:scale-95"
                style="-webkit-app-region: no-drag"
            >
                <ChevronLeft v-if="!uiStore.isSidebarCollapsed" class="w-6 h-6" />
                <Menu v-else class="w-6 h-6" />
            </button>
            
            <div 
                class="flex items-center transition-all duration-300 overflow-hidden"
                :class="isExpanded ? 'gap-3' : 'justify-center'"
                style="-webkit-app-region: no-drag"
            >
                <div 
                    class="rounded-lg flex-shrink-0 flex items-center justify-center transition-all duration-300"
                    :class="isExpanded ? 'w-7 h-7 bg-primary text-white shadow-lg shadow-primary/20' : 'w-8 h-8 bg-primary/10 text-primary shadow-sm'"
                >
                    <span class="font-bold italic" :class="isExpanded ? 'text-[10px]' : 'text-xs'">B</span>
                </div>
                <h1 
                    v-if="isExpanded"
                    class="text-lg font-black text-foreground tracking-tighter uppercase whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300"
                >
                    BarFlow
                </h1>
            </div>

            <!-- Mobile Close Button -->
            <button 
                @click="uiStore.toggleMobileSidebar(false)"
                class="md:hidden ml-auto w-10 h-10 flex items-center justify-center rounded-xl text-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-all"
            >
                <ChevronLeft class="w-6 h-6" />
            </button>
        </div>

        <nav class="flex-1 px-3 py-6 space-y-4 overflow-y-auto no-scrollbar">
            <ul class="space-y-2">
                <li v-for="link in [
                    { to: '/', icon: Home, label: 'Inicio' },
                    { to: '/ventas', icon: Receipt, label: 'Ventas' },
                    { to: '/admin', icon: Settings, label: 'Administración' },
                    { to: '/panel-admin', icon: ShieldCheck, label: 'Panel Admin' },
                    { to: '/reportes', icon: BarChart3, label: 'Reportes' }
                ]" :key="link.to">
                    <RouterLink 
                        :to="link.to" 
                        class="flex items-center text-foreground/70 rounded-xl hover:bg-primary/10 hover:text-primary transition-all group overflow-hidden h-12" 
                        :class="isExpanded ? 'gap-4 px-4' : 'justify-center w-10 mx-auto'"
                        active-class="!bg-primary !text-white shadow-lg shadow-primary/20"
                        @click="uiStore.toggleMobileSidebar(false)"
                    >
                        <component :is="link.icon" class="w-6 h-6 flex-shrink-0 group-hover:scale-110 transition-transform" />
                        <span 
                            class="text-base font-semibold whitespace-nowrap transition-all duration-300"
                            :class="isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 w-0'"
                        >
                            {{ link.label }}
                        </span>
                    </RouterLink>
                </li>
            </ul>
        </nav>
    </aside>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
