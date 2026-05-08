<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Package, AlertTriangle, ArrowUpRight, ArrowDownLeft, Search, Plus, Filter, Loader2 } from 'lucide-vue-next'
import { useInventoryStore } from '@/stores/inventory'

const inventoryStore = useInventoryStore()

const searchQuery = ref('')
const filterCategory = ref('Todos')

onMounted(() => {
  inventoryStore.fetchProducts()
})

const categories = computed(() => ['Todos', ...new Set(inventoryStore.products.map(item => item.category))])

const filteredInventory = computed(() => {
  return inventoryStore.products.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = filterCategory.value === 'Todos' || item.category === filterCategory.value
    return matchesSearch && matchesCategory
  })
})

const lowStockItems = computed(() => {
  return inventoryStore.products.filter(item => item.stock <= item.minStock)
})

const getStockStatusColor = (item: any) => {
  if (item.stock === 0) return 'text-destructive'
  if (item.stock <= item.minStock) return 'text-amber-500'
  return 'text-emerald-500'
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-4xl font-black tracking-tight text-foreground">Gestión de Stock</h1>
        <p class="text-foreground/50 font-medium">Control de inventario y reposición de productos.</p>
      </div>
      <button class="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
        <Plus class="w-5 h-5" />
        Añadir Producto
      </button>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-2">
        <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
          <Package class="w-6 h-6" />
        </div>
        <p class="text-sm font-bold text-foreground/40 uppercase tracking-wider">Total Productos</p>
        <p class="text-3xl font-black">{{ inventoryStore.products.length }}</p>
      </div>
      
      <div class="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-2">
        <div class="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
          <AlertTriangle class="w-6 h-6" />
        </div>
        <p class="text-sm font-bold text-foreground/40 uppercase tracking-wider">Stock Bajo</p>
        <p class="text-3xl font-black">{{ lowStockItems.length }}</p>
      </div>

      <div class="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-2">
        <div class="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
          <ArrowUpRight class="w-6 h-6" />
        </div>
        <p class="text-sm font-bold text-foreground/40 uppercase tracking-wider">Entradas (Mes)</p>
        <p class="text-3xl font-black">124</p>
      </div>

      <div class="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-2">
        <div class="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center text-destructive">
          <ArrowDownLeft class="w-6 h-6" />
        </div>
        <p class="text-sm font-bold text-foreground/40 uppercase tracking-wider">Salidas (Mes)</p>
        <p class="text-3xl font-black">842</p>
      </div>
    </div>

    <!-- Inventory Table/Card Container -->
    <div class="bg-card rounded-3xl border border-border shadow-xl overflow-hidden">
      <!-- Table Controls -->
      <div class="p-6 border-b border-border flex flex-col md:flex-row gap-4 justify-between bg-accent/5">
        <div class="relative flex-1 max-w-md">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Buscar en el inventario..." 
            class="w-full pl-12 pr-6 py-3 bg-accent/20 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
          >
        </div>
        <div class="flex items-center gap-3">
          <Filter class="w-5 h-5 text-foreground/40" />
          <select 
            v-model="filterCategory"
            class="bg-accent/20 border-none rounded-2xl px-4 py-3 font-bold outline-none ring-0 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
          >
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
      </div>

      <!-- Table Body -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-accent/10">
              <th class="px-6 py-4 text-xs font-black uppercase tracking-widest text-foreground/40">Producto</th>
              <th class="px-6 py-4 text-xs font-black uppercase tracking-widest text-foreground/40">Categoría</th>
              <th class="px-6 py-4 text-xs font-black uppercase tracking-widest text-foreground/40 text-center">Stock Actual</th>
              <th class="px-6 py-4 text-xs font-black uppercase tracking-widest text-foreground/40 text-center">Unit.</th>
              <th class="px-6 py-4 text-xs font-black uppercase tracking-widest text-foreground/40 text-right">Precio Compra</th>
              <th class="px-6 py-4 text-xs font-black uppercase tracking-widest text-foreground/40 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="item in filteredInventory" :key="item.id" class="hover:bg-accent/5 transition-colors group">
              <td class="px-6 py-4">
                <div class="font-bold text-foreground">{{ item.name }}</div>
                <div v-if="item.stock <= item.minStock" class="text-[10px] font-black text-amber-500 uppercase flex items-center gap-1">
                  <AlertTriangle class="w-3 h-3" /> Reponer Pronto
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="px-3 py-1 bg-accent/20 rounded-lg text-xs font-bold text-foreground/60">{{ item.category }}</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-lg font-black" :class="getStockStatusColor(item)">{{ item.stock }}</span>
                <span class="text-xs font-medium text-foreground/30 ml-1">/ {{ item.minStock }} min</span>
              </td>
              <td class="px-6 py-4 text-center text-sm font-bold text-foreground/40">{{ item.unit }}</td>
              <td class="px-6 py-4 text-right font-black text-foreground/80">${{ Number(item.price).toFixed(2) }}</td>
              <td class="px-6 py-4 text-right">
                <button class="p-2 hover:bg-primary/10 hover:text-primary rounded-xl transition-all">
                  <Plus class="w-5 h-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
