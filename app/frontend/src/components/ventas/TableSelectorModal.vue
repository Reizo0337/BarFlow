<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, Edit3, Save, Plus, Trash2, Box, Circle, Armchair, Beer, Move } from 'lucide-vue-next'
import { useTablesStore } from '@/stores/tables'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps<{
  isOpen: boolean
  selectedTable: string
  pendingOrders: Record<string, any[]>
}>()

const emit = defineEmits(['close', 'select'])
const tablesStore = useTablesStore()

const isEditMode = ref(false)
const draggedTableId = ref<string | null>(null)
const mapRef = ref<HTMLElement | null>(null)

// Local copy for editing
const localLayout = ref<any[]>([])

// Sync local copy when opening
const openModal = () => {
    localLayout.value = JSON.parse(JSON.stringify(tablesStore.tableLayout))
}

const toggleEditMode = () => {
    if (isEditMode.value) {
        // Saving
        tablesStore.saveTableLayout(localLayout.value)
    } else {
        localLayout.value = JSON.parse(JSON.stringify(tablesStore.tableLayout))
    }
    isEditMode.value = !isEditMode.value
}

const addTable = (type: 'square' | 'circle' | 'sofa' | 'bar') => {
    // Find highest label number to avoid duplicates
    const labels = localLayout.value.map(t => parseInt(t.label) || 0)
    const maxLabel = labels.length > 0 ? Math.max(...labels) : 0
    const nextNum = (maxLabel + 1).toString().padStart(2, '0')
    
    localLayout.value.push({
        id: crypto.randomUUID ? crypto.randomUUID() : `T-${Math.random().toString(36).substr(2, 9)}`,
        label: nextNum,
        x: 20 + (Math.random() * 60),
        y: 20 + (Math.random() * 60),
        type
    })
}

const isOccupied = (label: string) => {
    return props.pendingOrders[label]?.length > 0
}

const removeTable = (id: string, label: string) => {
    if (isOccupied(label)) return
    localLayout.value = localLayout.value.filter(t => t.id !== id)
}

// Drag & Drop
const onDragStart = (e: DragEvent, id: string, label: string) => {
    if (!isEditMode.value || isOccupied(label)) {
        e.preventDefault()
        return
    }
    draggedTableId.value = id
}

const onDrop = (e: DragEvent) => {
    if (!isEditMode.value || !draggedTableId.value || !mapRef.value) return
    
    const rect = mapRef.value.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    const table = localLayout.value.find(t => t.id === draggedTableId.value)
    if (table) {
        table.x = Math.max(0, Math.min(95, x))
        table.y = Math.max(0, Math.min(95, y))
    }
    draggedTableId.value = null
}

const getTableIcon = (type: string) => {
    switch (type) {
        case 'square': return 'square'
        case 'circle': return 'circle'
        case 'sofa': return 'sofa'
        case 'bar': return 'bar'
        default: return 'square'
    }
}
</script>

<template>
  <div v-if="isOpen" @vue:mounted="openModal" class="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] flex items-center justify-center p-4 lg:p-10 animate-in fade-in duration-300">
    <div class="bg-card w-full max-w-7xl h-full rounded-[3rem] border border-border shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
      
      <!-- Header -->
      <div class="p-8 border-b border-border flex items-center justify-between bg-accent/5">
        <div class="flex items-center gap-6">
            <div class="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Move class="w-6 h-6" />
            </div>
            <div>
                <h3 class="text-3xl font-black uppercase tracking-tighter">Diseño del Local</h3>
                <p class="text-foreground/40 font-bold">Mapa interactivo de ubicación y estado de mesas.</p>
            </div>
        </div>

        <div class="flex items-center gap-4">
            <div v-if="isEditMode" class="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-2xl animate-pulse">
                <span class="w-2 h-2 rounded-full bg-primary"></span>
                <span class="text-[10px] font-black text-primary uppercase tracking-widest">Editor de Planta</span>
            </div>
            
            <BaseButton :variant="isEditMode ? 'primary' : 'outline'" @click="toggleEditMode">
                <template #icon-left>
                    <Save v-if="isEditMode" class="w-4 h-4" />
                    <Edit3 v-else class="w-4 h-4" />
                </template>
                {{ isEditMode ? 'Guardar Planta' : 'Personalizar Plano' }}
            </BaseButton>

            <button @click="emit('close')" class="p-4 hover:bg-accent/50 rounded-2xl transition-colors">
                <X class="w-8 h-8" />
            </button>
        </div>
      </div>

      <!-- Workspace -->
      <div class="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        <!-- Toolbar (Edit Mode Only) -->
        <div v-if="isEditMode" class="w-full lg:w-64 bg-accent/5 border-r border-border p-6 space-y-6 animate-in slide-in-from-left duration-500">
            <h4 class="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Mobiliario</h4>
            <div class="grid grid-cols-2 gap-3">
                <button @click="addTable('square')" class="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all group">
                    <svg class="w-8 h-8 text-foreground/20 group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="6" y="6" width="12" height="12" rx="1" />
                        <rect x="10" y="2" width="4" height="2" rx="0.5" />
                        <rect x="10" y="20" width="4" height="2" rx="0.5" />
                        <rect x="2" y="10" width="2" height="4" rx="0.5" />
                        <rect x="20" y="10" width="2" height="4" rx="0.5" />
                    </svg>
                    <span class="text-[8px] font-black uppercase">Mesa 4p</span>
                </button>
                <button @click="addTable('circle')" class="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all group">
                    <svg class="w-8 h-8 text-foreground/20 group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="6" />
                        <rect x="11" y="2" width="2" height="2" rx="0.5" />
                        <rect x="11" y="20" width="2" height="2" rx="0.5" />
                        <rect x="2" y="11" width="2" height="2" rx="0.5" />
                        <rect x="20" y="11" width="2" height="2" rx="0.5" />
                    </svg>
                    <span class="text-[8px] font-black uppercase">Redonda</span>
                </button>
                <button @click="addTable('sofa')" class="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all group">
                    <svg class="w-8 h-8 text-foreground/20 group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 18v-2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" />
                        <rect x="2" y="12" width="3" height="6" rx="1" />
                        <rect x="19" y="12" width="3" height="6" rx="1" />
                        <path d="M6 14v-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" />
                    </svg>
                    <span class="text-[8px] font-black uppercase">Zona VIP</span>
                </button>
                <button @click="addTable('bar')" class="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all group">
                    <svg class="w-8 h-8 text-foreground/20 group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="8" r="4" />
                        <circle cx="12" cy="8" r="1" />
                        <path d="M12 12v8" />
                        <path d="M9 20h6" />
                    </svg>
                    <span class="text-[8px] font-black uppercase">Barra</span>
                </button>
            </div>
            
            <div class="p-4 bg-primary/5 rounded-2xl border border-primary/20 space-y-2">
                <p class="text-[9px] font-bold text-primary italic">Organiza tu salón arrastrando los elementos. Cada mesa guarda su configuración individualmente.</p>
            </div>
        </div>

        <!-- The Map -->
        <div 
            ref="mapRef"
            class="flex-1 bg-[#1a1a1a] relative overflow-hidden" 
            @dragover.prevent
            @drop="onDrop"
            style="background-image: 
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
                background-size: 40px 40px;"
        >
            <div 
                v-for="table in localLayout" 
                :key="table.id"
                :draggable="isEditMode && !isOccupied(table.label)"
                @dragstart="onDragStart($event, table.id, table.label)"
                @click="!isEditMode && emit('select', table.label)"
                class="absolute flex flex-col items-center justify-center gap-3 transition-all"
                :class="[
                    isEditMode ? (isOccupied(table.label) ? 'cursor-not-allowed opacity-80' : 'cursor-move active:scale-110') : 'cursor-pointer hover:scale-110',
                    selectedTable === table.label ? 'z-20' : 'z-10'
                ]"
                :style="{
                    left: `${table.x}%`,
                    top: `${table.y}%`,
                    transform: 'translate(-50%, -50%)'
                }"
            >
                <div 
                    class="relative transition-all"
                    :class="[
                        selectedTable === table.label ? 'scale-125 filter drop-shadow-[0_0_20px_rgba(5,150,105,0.4)]' : (isOccupied(table.label) ? 'scale-110 filter drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'opacity-90 hover:opacity-100'),
                    ]"
                >
                    <!-- CUSTOM SVG TABLES -->
                    <div class="w-20 h-20 flex items-center justify-center pointer-events-none">
                        <!-- Square Table (Default Fallback) -->
                        <svg v-if="!table.type || table.type === 'square'" class="w-16 h-16 transition-colors" :class="selectedTable === table.label ? 'text-primary' : (isOccupied(table.label) ? 'text-amber-500' : 'text-white/60')" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <rect x="6" y="6" width="12" height="12" rx="1.5" :fill="isOccupied(table.label) ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.03)'" />
                            <rect x="10" y="2" width="4" height="2" rx="0.5" fill="currentColor" />
                            <rect x="10" y="20" width="4" height="2" rx="0.5" fill="currentColor" />
                            <rect x="2" y="10" width="2" height="4" rx="0.5" fill="currentColor" />
                            <rect x="20" y="10" width="2" height="4" rx="0.5" fill="currentColor" />
                        </svg>

                        <!-- Circle Table -->
                        <svg v-else-if="table.type === 'circle'" class="w-16 h-16 transition-colors" :class="selectedTable === table.label ? 'text-primary' : (isOccupied(table.label) ? 'text-amber-500' : 'text-white/60')" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <circle cx="12" cy="12" r="7" :fill="isOccupied(table.label) ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.03)'" />
                            <rect x="11" y="1" width="2" height="3" rx="0.5" fill="currentColor" />
                            <rect x="11" y="20" width="2" height="3" rx="0.5" fill="currentColor" />
                            <rect x="1" y="11" width="3" height="2" rx="0.5" fill="currentColor" />
                            <rect x="20" y="11" width="3" height="2" rx="0.5" fill="currentColor" />
                        </svg>

                        <!-- Sofa / Lounge -->
                        <svg v-else-if="table.type === 'sofa'" class="w-16 h-16 transition-colors" :class="selectedTable === table.label ? 'text-primary' : (isOccupied(table.label) ? 'text-amber-500' : 'text-white/60')" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <path d="M4 18v-2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" />
                            <rect x="2" y="12" width="3" height="6" rx="1" fill="currentColor" />
                            <rect x="19" y="12" width="3" height="6" rx="1" fill="currentColor" />
                            <path d="M6 14v-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" />
                            <rect x="7" y="15" width="10" height="4" rx="1" :fill="isOccupied(table.label) ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.03)'" />
                        </svg>

                        <!-- Bar Stool -->
                        <svg v-else-if="table.type === 'bar'" class="w-16 h-16 transition-colors" :class="selectedTable === table.label ? 'text-primary' : (isOccupied(table.label) ? 'text-amber-500' : 'text-white/60')" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <circle cx="12" cy="8" r="4" :fill="isOccupied(table.label) ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.03)'" />
                            <circle cx="12" cy="8" r="1.5" fill="currentColor" />
                            <path d="M12 12v8" />
                            <path d="M9 20h6" />
                        </svg>
                    </div>
                    
                    <button 
                        v-if="isEditMode && !isOccupied(table.label)" 
                        @click.stop="removeTable(table.id, table.label)"
                        class="absolute -top-1 -right-1 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                        title="Eliminar Mesa"
                    >
                        <Trash2 class="w-3.5 h-3.5" />
                    </button>

                    <div v-if="isOccupied(table.label)" class="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-500 text-white text-[7px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-amber-500/20">
                        Ocupada
                    </div>
                </div>
                <div class="flex flex-col items-center gap-1">
                    <span class="text-[9px] font-black text-white/40 uppercase tracking-tighter">Mesa</span>
                    <span class="text-xs font-black text-white uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-0.5 rounded-lg backdrop-blur-md" :class="{ 'bg-primary border-primary text-white': selectedTable === table.label }">
                        {{ table.label }}
                    </span>
                </div>
            </div>

            <!-- Empty State -->
            <div v-if="localLayout.length === 0" class="absolute inset-0 flex flex-col items-center justify-center text-white/10 gap-4">
                <svg class="w-32 h-32 opacity-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    <path d="M9 9h6M9 15h6" />
                </svg>
                <p class="text-xl font-black uppercase tracking-widest italic">Inicia el diseño de tu local</p>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
