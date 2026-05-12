<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Package, AlertTriangle, ArrowUpRight, ArrowDownLeft, Search, Plus, Filter, MoreHorizontal, Edit3, Trash2, Layers, Sparkles, Tag, Box, LayoutGrid, List } from 'lucide-vue-next'
import { useInventoryStore } from '@/stores/inventory'
import { useUIStore } from '@/stores/ui'
import InventoryAiAssistant from '@/components/inventory/InventoryAiAssistant.vue'
import CategoryModal from '@/components/inventory/CategoryModal.vue'
import ProductModal from '@/components/inventory/ProductModal.vue'

const inventoryStore = useInventoryStore()
const uiStore = useUIStore()

const viewMode = ref<'products' | 'categories'>('products')
const searchQuery = ref('')
const filterCategoryId = ref<number | string>('Todos')

const showCategoryModal = ref(false)
const showProductModal = ref(false)
const editingProduct = ref<any>(null)

const openEditModal = (product: any) => {
  editingProduct.value = product
  showProductModal.value = true
}

const openCreateModal = () => {
  editingProduct.value = null
  showProductModal.value = true
}

onMounted(() => {
  inventoryStore.fetchProducts()
})

const categories = computed(() => [
  { id: 'Todos', name: 'Todos' },
  ...inventoryStore.categories
])

const filteredInventory = computed(() => {
  return inventoryStore.products.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = filterCategoryId.value === 'Todos' || item.category?.id === filterCategoryId.value
    return matchesSearch && matchesCategory
  })
})

const filteredCategories = computed(() => {
  return inventoryStore.categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const lowStockItems = computed(() => {
  return inventoryStore.products.filter(item => item.stock <= item.minStock)
})

const getStockStatus = (item: any) => {
  if (item.stock === 0) return { label: 'Agotado', class: 'bg-destructive/10 text-destructive border-destructive/20' }
  if (item.stock <= item.minStock) return { label: 'Stock Bajo', class: 'bg-amber-500/10 text-amber-500 border-amber-500/20' }
  return { label: 'En Stock', class: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' }
}

const getProductCountByCategory = (categoryId: number) => {
    return inventoryStore.products.filter(p => p.category?.id === categoryId).length
}
</script>

<template>
  <div class="max-w-[1600px] mx-auto space-y-10 p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Modals -->
    <CategoryModal :is-open="showCategoryModal" @close="showCategoryModal = false" />
    <ProductModal :is-open="showProductModal" :product="editingProduct" @close="showProductModal = false" />

    <!-- Hero Header -->
    <div class="relative flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border/50">
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px]">
          <Layers class="w-3 h-3" />
          <span>Sistema de Gestión Central</span>
        </div>
        <h1 class="text-5xl font-black tracking-tighter text-foreground uppercase">Inventario</h1>
        <p class="text-foreground/40 font-medium max-w-md">Control analítico de existencias, reposición inteligente y optimización de costes en tiempo real.</p>
      </div>
      
      <!-- Quick Actions -->
      <div class="flex flex-wrap gap-4">
        <button 
            @click="showCategoryModal = true"
            class="flex items-center gap-2 px-6 py-3 bg-card border border-border text-foreground rounded-2xl font-bold hover:bg-accent transition-all group"
        >
            <Tag class="w-4 h-4 text-foreground/40 group-hover:text-primary transition-colors" />
            <span>Categoría</span>
        </button>
        <button 
            @click="openCreateModal"
            class="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
            <Plus class="w-5 h-5" />
            <span>Añadir Producto</span>
        </button>
      </div>
    </div>

    <!-- AI Command Center -->
    <div class="animate-in fade-in slide-in-from-top-4 duration-1000 delay-200">
        <InventoryAiAssistant />
    </div>

    <!-- Analytical Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div 
        v-for="stat in [
          { label: 'Productos Totales', value: inventoryStore.products.length, icon: Package, color: 'text-primary', bg: 'bg-primary/5' },
          { label: 'Para Reponer', value: lowStockItems.length, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/5' },
          { label: 'Categorías', value: inventoryStore.categories.length, icon: Tag, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
          { label: 'Salidas 30d', value: '842', icon: ArrowDownLeft, color: 'text-destructive', bg: 'bg-destructive/5' }
        ]" 
        :key="stat.label"
        class="group relative bg-card p-8 rounded-[2.5rem] border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
      >
        <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl transition-opacity opacity-0 group-hover:opacity-100"></div>
        
        <div class="flex items-center justify-between mb-6">
            <div :class="['w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110', stat.bg, stat.color]">
                <component :is="stat.icon" class="w-7 h-7" />
            </div>
            <MoreHorizontal class="w-5 h-5 text-foreground/10" />
        </div>
        <p class="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] mb-1">{{ stat.label }}</p>
        <p class="text-4xl font-black tracking-tighter text-foreground">{{ stat.value }}</p>
      </div>
    </div>

    <!-- View Mode Toggler -->
    <div class="flex items-center gap-4 bg-card p-2 rounded-3xl border border-border shadow-sm w-fit mx-auto lg:mx-0">
        <button 
            @click="viewMode = 'products'"
            :class="[
                'flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all',
                viewMode === 'products' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-foreground/40 hover:bg-accent'
            ]"
        >
            <Box class="w-4 h-4" />
            <span>Productos</span>
        </button>
        <button 
            @click="viewMode = 'categories'"
            :class="[
                'flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all',
                viewMode === 'categories' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-foreground/40 hover:bg-accent'
            ]"
        >
            <Tag class="w-4 h-4" />
            <span>Categorías</span>
        </button>
    </div>

    <!-- Main Workspace -->
    <div class="bg-card rounded-[3rem] border border-border shadow-2xl overflow-hidden min-h-[600px] flex flex-col">
      <!-- Toolbar -->
      <div class="p-8 border-b border-border flex flex-col lg:flex-row gap-6 justify-between items-center bg-accent/5">
        <div class="flex items-center gap-4 w-full lg:w-auto">
            <div class="relative flex-1 lg:w-96">
                <Search class="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20" />
                <input 
                    v-model="searchQuery"
                    type="text" 
                    :placeholder="viewMode === 'products' ? 'Filtrar por nombre...' : 'Buscar categoría...'" 
                    class="w-full pl-16 pr-8 py-4 bg-white border border-border rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm shadow-sm"
                >
            </div>
            <div v-if="viewMode === 'products'" class="hidden sm:flex items-center gap-2 bg-white border border-border p-1.5 rounded-2xl shadow-sm">
                <button 
                    v-for="cat in categories.slice(0, 4)" 
                    :key="cat.id"
                    @click="filterCategoryId = cat.id"
                    class="px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                    :class="filterCategoryId === cat.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground/40 hover:bg-accent'"
                >
                    {{ cat.name }}
                </button>
            </div>
        </div>

        <div v-if="viewMode === 'products'" class="flex items-center gap-4 w-full lg:w-auto border-t lg:border-t-0 pt-6 lg:pt-0 border-border">
            <div class="flex-1 lg:flex-none relative">
                <Filter class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 pointer-events-none" />
                <select 
                    v-model="filterCategoryId"
                    class="w-full lg:w-48 pl-12 pr-6 py-4 bg-white border border-border rounded-2xl font-black text-[10px] uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer shadow-sm appearance-none"
                >
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
            </div>
        </div>
      </div>

      <!-- Content Area -->
      <div class="flex-1 p-8">
        <!-- Products Table -->
        <div v-if="viewMode === 'products'">
            <div v-if="filteredInventory.length > 0" class="overflow-x-auto no-scrollbar">
                <table class="w-full text-left border-separate border-spacing-y-4">
                    <thead>
                        <tr class="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">
                            <th class="px-6 pb-2">Producto e Info</th>
                            <th class="px-6 pb-2">Categoría</th>
                            <th class="px-6 pb-2 text-center">Nivel de Stock</th>
                            <th class="px-6 pb-2 text-right">Valor Unit.</th>
                            <th class="px-6 pb-2 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in filteredInventory" :key="item.id" class="group hover:-translate-y-1 transition-all duration-300">
                            <td class="bg-card group-hover:bg-accent/10 px-6 py-6 rounded-l-[2rem] border-y border-l border-border transition-colors">
                                <div class="flex items-center gap-4">
                                    <div class="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center overflow-hidden font-black text-foreground/40 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        <img v-if="item.image" :src="item.image.startsWith('http') ? item.image : `http://127.0.0.1:3000${item.image}`" class="w-full h-full object-cover" />
                                        <span v-else>{{ item.name.charAt(0).toUpperCase() }}</span>
                                    </div>
                                    <div>
                                        <p class="font-black text-foreground uppercase tracking-tight">{{ item.name }}</p>
                                        <p class="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">ID: #{{ item.id.toString().padStart(4, '0') }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="bg-card group-hover:bg-accent/10 px-6 py-6 border-y border-border transition-colors">
                                <span class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-border bg-white text-foreground/60 group-hover:border-primary/20 group-hover:text-primary transition-all">
                                    {{ item.category?.name || 'Varios' }}
                                </span>
                            </td>
                            <td class="bg-card group-hover:bg-accent/10 px-6 py-6 border-y border-border transition-colors text-center">
                                <div class="inline-flex flex-col items-center gap-2">
                                    <div class="flex items-center gap-1.5">
                                        <span class="text-xl font-black tracking-tighter" :class="getStockStatus(item).class.split(' ')[1]">{{ item.stock }}</span>
                                        <span class="text-[10px] font-bold text-foreground/20 uppercase">{{ item.unit }}</span>
                                    </div>
                                    <div :class="['px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border', getStockStatus(item).class]">
                                        {{ getStockStatus(item).label }}
                                    </div>
                                </div>
                            </td>
                            <td class="bg-card group-hover:bg-accent/10 px-6 py-6 border-y border-border transition-colors text-right">
                                <p class="text-lg font-black tracking-tighter text-foreground/80 group-hover:text-primary transition-colors">${{ Number(item.price).toFixed(2) }}</p>
                            </td>
                            <td class="bg-card group-hover:bg-accent/10 px-6 py-6 rounded-r-[2rem] border-y border-r border-border transition-colors text-right">
                                <div class="flex items-center justify-end gap-2">
                                    <button 
                                        @click="openEditModal(item)"
                                        class="w-10 h-10 flex items-center justify-center rounded-xl bg-accent/20 hover:bg-primary text-foreground/40 hover:text-white transition-all"
                                    >
                                        <Edit3 class="w-4 h-4" />
                                    </button>
                                    <button class="w-10 h-10 flex items-center justify-center rounded-xl bg-destructive/5 hover:bg-destructive text-destructive/40 hover:text-white transition-all">
                                        <Trash2 class="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-else class="flex flex-col items-center justify-center py-32 space-y-6 text-center animate-in zoom-in duration-500">
                <div class="w-24 h-24 rounded-[2.5rem] bg-accent/10 flex items-center justify-center text-foreground/10">
                    <Search class="w-12 h-12" />
                </div>
                <div class="space-y-2">
                    <h3 class="text-xl font-black uppercase tracking-tight">Sin resultados</h3>
                    <p class="text-foreground/40 text-sm max-w-xs mx-auto">No hemos encontrado productos que coincidan con tu búsqueda.</p>
                </div>
            </div>
        </div>

        <!-- Categories Table -->
        <div v-else>
            <div v-if="filteredCategories.length > 0" class="overflow-x-auto no-scrollbar">
                <table class="w-full text-left border-separate border-spacing-y-4">
                    <thead>
                        <tr class="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">
                            <th class="px-6 pb-2">Nombre de Categoría</th>
                            <th class="px-6 pb-2 text-center">Productos Vinculados</th>
                            <th class="px-6 pb-2 text-right">Estado</th>
                            <th class="px-6 pb-2 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="cat in filteredCategories" :key="cat.id" class="group hover:-translate-y-1 transition-all duration-300">
                            <td class="bg-card group-hover:bg-accent/10 px-6 py-8 rounded-l-[2rem] border-y border-l border-border transition-colors">
                                <div class="flex items-center gap-4">
                                    <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                                        <Tag class="w-5 h-5" />
                                    </div>
                                    <p class="font-black text-lg text-foreground uppercase tracking-tight">{{ cat.name }}</p>
                                </div>
                            </td>
                            <td class="bg-card group-hover:bg-accent/10 px-6 py-8 border-y border-border transition-colors text-center">
                                <div class="flex flex-col items-center">
                                    <span class="text-2xl font-black tracking-tighter text-foreground">{{ getProductCountByCategory(cat.id) }}</span>
                                    <span class="text-[9px] font-bold text-foreground/30 uppercase tracking-[0.2em]">Items en total</span>
                                </div>
                            </td>
                            <td class="bg-card group-hover:bg-accent/10 px-6 py-8 border-y border-border transition-colors text-right">
                                <span class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/5 text-emerald-500 border border-emerald-500/10">
                                    Activo
                                </span>
                            </td>
                            <td class="bg-card group-hover:bg-accent/10 px-6 py-8 rounded-r-[2rem] border-y border-r border-border transition-colors text-right">
                                <div class="flex items-center justify-end gap-2">
                                    <button class="w-12 h-12 flex items-center justify-center rounded-2xl bg-accent/20 hover:bg-primary text-foreground/40 hover:text-white transition-all shadow-sm">
                                        <Edit3 class="w-5 h-5" />
                                    </button>
                                    <button class="w-12 h-12 flex items-center justify-center rounded-2xl bg-destructive/5 hover:bg-destructive text-destructive/40 hover:text-white transition-all shadow-sm">
                                        <Trash2 class="w-5 h-5" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-else class="flex flex-col items-center justify-center py-32 space-y-6 text-center animate-in zoom-in duration-500">
                <div class="w-24 h-24 rounded-[2.5rem] bg-accent/10 flex items-center justify-center text-foreground/10">
                    <Tag class="w-12 h-12" />
                </div>
                <div class="space-y-2">
                    <h3 class="text-xl font-black uppercase tracking-tight">Sin categorías</h3>
                    <p class="text-foreground/40 text-sm max-w-xs mx-auto">No hay categorías que coincidan con tu búsqueda.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
}
</style>
