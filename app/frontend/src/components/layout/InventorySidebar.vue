<script setup lang="ts">
import { Sparkles, Plus, ArrowLeft, Box, Tag, Zap, Cpu, History } from 'lucide-vue-next'
import { useUIStore } from '@/stores/ui'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import InventoryAiAssistant from '@/components/inventory/InventoryAiAssistant.vue'
import CategoryModal from '@/components/inventory/CategoryModal.vue'
import ProductModal from '@/components/inventory/ProductModal.vue'

const uiStore = useUIStore()
const router = useRouter()

const showCategoryModal = ref(false)
const showProductModal = ref(false)

const exitInventory = () => {
    uiStore.toggleInventoryMode(false)
    router.push('/app/dashboard')
}
</script>

<template>
    <aside class="h-screen w-[380px] bg-card border-r border-border flex flex-col shadow-[20px_0_60px_rgba(0,0,0,0.05)] z-[70] relative overflow-hidden">
        <!-- Abstract Background Decoration -->
        <div class="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
        <div class="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

        <!-- Modals -->
        <CategoryModal :is-open="showCategoryModal" @close="showCategoryModal = false" />
        <ProductModal :is-open="showProductModal" @close="showProductModal = false" />

        <!-- Header -->
        <div class="p-8 border-b border-border/50 relative z-10">
            <button 
                @click="exitInventory"
                class="flex items-center gap-2 text-foreground/30 hover:text-primary transition-all mb-8 group"
            >
                <div class="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-primary/10 group-hover:-translate-x-1 transition-all">
                    <ArrowLeft class="w-4 h-4" />
                </div>
                <span class="text-[10px] font-black uppercase tracking-[0.2em]">Cerrar Panel</span>
            </button>
            
            <div class="flex items-start justify-between">
                <div class="space-y-1">
                    <h2 class="text-2xl font-black tracking-tighter uppercase leading-none">Inteligencia</h2>
                    <p class="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        Neural Engine v2.0
                    </p>
                </div>
                <div class="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/40 group overflow-hidden relative">
                    <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                    <Cpu class="w-6 h-6 relative z-10" />
                </div>
            </div>
        </div>

        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto no-scrollbar p-8 space-y-10 relative z-10">
            <!-- Actions -->
            <div class="space-y-6">
                <p class="px-2 text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">Gestión Manual</p>
                <div class="grid grid-cols-1 gap-3">
                    <button 
                        @click="showCategoryModal = true"
                        class="group w-full flex items-center justify-between px-8 py-5 bg-card hover:bg-accent text-foreground/70 hover:text-foreground rounded-[2rem] border border-border/60 hover:border-border transition-all duration-300"
                    >
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-xl bg-accent/30 flex items-center justify-center text-foreground/40 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                <Tag class="w-5 h-5" />
                            </div>
                            <span class="text-sm font-black uppercase tracking-tight">Categorías</span>
                        </div>
                        <Plus class="w-4 h-4 text-foreground/20 group-hover:text-primary transition-colors" />
                    </button>
                    
                    <button 
                        @click="showProductModal = true"
                        class="group w-full flex items-center justify-between px-8 py-6 bg-primary text-white rounded-[2rem] shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
                    >
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <Box class="w-5 h-5" />
                            </div>
                            <div class="text-left">
                                <span class="block text-sm font-black uppercase tracking-tight leading-none">Nuevo Producto</span>
                                <span class="text-[9px] font-bold text-white/50 uppercase tracking-widest">Manual Entry</span>
                            </div>
                        </div>
                        <Zap class="w-4 h-4 text-white/40 animate-pulse" />
                    </button>
                </div>
            </div>

            <!-- Quick Tips / System Status -->
            <div class="p-6 bg-accent/5 rounded-3xl border border-border/50 space-y-3">
                <div class="flex items-center gap-2 text-primary">
                    <Sparkles class="w-4 h-4" />
                    <p class="text-[10px] font-black uppercase tracking-widest">Pro Tip</p>
                </div>
                <p class="text-xs font-bold text-foreground/50 leading-relaxed italic">
                    "Puedes pedirme que subas el precio de todos los refrescos un 10% de una sola vez."
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div class="p-8 border-t border-border/50 bg-accent/5 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                <p class="text-[10px] font-black text-foreground/40 uppercase tracking-widest">System Live</p>
            </div>
            <p class="text-[10px] font-bold text-foreground/20 uppercase tracking-tighter">BarFlow AI v2.0</p>
        </div>
    </aside>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
