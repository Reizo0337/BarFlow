<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Layers, Tag, Plus, Box, Search, Filter, Wand2, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useInventoryStore } from '@/stores/inventory'
import { INVENTORY_TEMPLATE } from '@/constants/inventory-template'

// UI Kit Components
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import AppDialog from '@/components/ui/AppDialog.vue'

// Local Components
import InventoryAiAssistant from '@/components/inventory/InventoryAiAssistant.vue'
import CategoryModal from '@/components/inventory/CategoryModal.vue'
import ProductModal from '@/components/inventory/ProductModal.vue'
import InventoryStats from '@/components/inventory/InventoryStats.vue'
import ProductTable from '@/components/inventory/ProductTable.vue'
import CategoryTable from '@/components/inventory/CategoryTable.vue'

const inventoryStore = useInventoryStore()

const viewMode = ref<'products' | 'categories'>('products')
const searchQuery = ref('')
const filterCategoryId = ref<number | string>('Todos')

const showCategoryModal = ref(false)
const showProductModal = ref(false)
const editingProduct = ref<any>(null)

// Template Dialog State
const isApplyingTemplate = ref(false)
const showTemplateDialog = ref(false)

const openEditModal = (product: any) => {
  editingProduct.value = product
  showProductModal.value = true
}

const openCreateModal = () => {
  editingProduct.value = null
  showProductModal.value = true
}

const handleApplyTemplate = async () => {
  isApplyingTemplate.value = true
  try {
    await inventoryStore.applyTemplate(INVENTORY_TEMPLATE)
    showTemplateDialog.value = false
  } catch (error) {
    console.error(error)
  } finally {
    isApplyingTemplate.value = false
  }
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

const currentPage = ref(1)
const itemsPerPage = 15

const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredInventory.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredInventory.value.length / itemsPerPage))

const filteredCategories = computed(() => {
  return inventoryStore.categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const lowStockItemsCount = computed(() => {
  return inventoryStore.products.filter(item => item.stock <= (item.minStock || 0)).length
})

const getProductCountByCategory = (categoryId: number) => {
    return inventoryStore.products.filter(p => p.category?.id === categoryId).length
}
</script>

<template>
  <div class="max-w-[1600px] mx-auto space-y-10 p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Modals & Dialogs -->
    <CategoryModal :is-open="showCategoryModal" @close="showCategoryModal = false" />
    <ProductModal :is-open="showProductModal" :product="editingProduct" @close="showProductModal = false" />
    <AppDialog 
      :is-open="showTemplateDialog"
      title="¿Aplicar plantilla de inventario?"
      message="Esta acción borrará TODOS los productos y categorías actuales para instalar la configuración predeterminada. ¿Estás seguro de que deseas continuar?"
      type="confirm"
      :is-loading="isApplyingTemplate"
      @confirm="handleApplyTemplate"
      @close="showTemplateDialog = false"
      @cancel="showTemplateDialog = false"
    />

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
      
      <div class="flex flex-wrap gap-3 md:ml-auto">
        <BaseButton variant="outline" size="sm" @click="showTemplateDialog = true" class="opacity-60 hover:opacity-100">
          <template #icon-left><Wand2 class="w-3 h-3" /></template>
          Plantilla
        </BaseButton>
        <BaseButton variant="secondary" @click="showCategoryModal = true">
          <template #icon-left><Tag class="w-4 h-4" /></template>
          Categoría
        </BaseButton>
        <BaseButton variant="primary" @click="openCreateModal">
          <template #icon-left><Plus class="w-5 h-5" /></template>
          Añadir Producto
        </BaseButton>
      </div>
    </div>

    <!-- AI Command Center -->
    <InventoryAiAssistant class="animate-in fade-in slide-in-from-top-4 duration-1000 delay-200" />

    <!-- Analytical Cards -->
    <InventoryStats 
      :total-products="inventoryStore.products.length"
      :low-stock-count="lowStockItemsCount"
      :total-categories="inventoryStore.categories.length"
    />

    <!-- View Mode Toggler -->
    <div class="flex items-center gap-4 bg-card p-2 rounded-3xl border border-border shadow-sm w-fit mx-auto lg:mx-0">
        <BaseButton 
          :variant="viewMode === 'products' ? 'primary' : 'ghost'" 
          @click="viewMode = 'products'"
        >
          <template #icon-left><Box class="w-4 h-4" /></template>
          Productos
        </BaseButton>
        <BaseButton 
          :variant="viewMode === 'categories' ? 'primary' : 'ghost'" 
          @click="viewMode = 'categories'"
        >
          <template #icon-left><Tag class="w-4 h-4" /></template>
          Categorías
        </BaseButton>
    </div>

    <!-- Main Workspace -->
    <BaseCard padding="none" :hover="false" class="shadow-2xl overflow-hidden min-h-[600px] flex flex-col">
      <!-- Toolbar -->
      <div class="p-8 border-b border-border flex flex-col lg:flex-row gap-6 justify-between items-center bg-accent/5">
        <div class="flex items-center gap-4 w-full lg:w-auto">
            <BaseInput 
              v-model="searchQuery"
              :placeholder="viewMode === 'products' ? 'Filtrar por nombre...' : 'Buscar categoría...'"
              :icon="Search"
              class="lg:w-96"
            />
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
        <ProductTable v-if="viewMode === 'products'" :products="paginatedProducts" @edit="openEditModal" />
        <CategoryTable v-else :categories="filteredCategories" :get-product-count="getProductCountByCategory" />
      </div>

      <!-- Pagination Footer (only for products) -->
      <div v-if="viewMode === 'products'" class="p-8 border-t border-border flex items-center justify-between bg-accent/5">
        <p class="text-[10px] font-black uppercase tracking-widest text-foreground/30">
          Mostrando {{ paginatedProducts.length }} de {{ filteredInventory.length }} productos
        </p>
        <div class="flex items-center gap-2">
            <BaseButton 
                variant="outline" 
                size="sm" 
                :disabled="currentPage === 1"
                @click="currentPage--"
            >
                <ChevronLeft class="w-4 h-4" />
            </BaseButton>
            <span class="text-xs font-black px-4">PÁGINA {{ currentPage }} DE {{ totalPages || 1 }}</span>
            <BaseButton 
                variant="outline" 
                size="sm" 
                :disabled="currentPage >= totalPages"
                @click="currentPage++"
            >
                <ChevronRight class="w-4 h-4" />
            </BaseButton>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
select { -webkit-appearance: none; -moz-appearance: none; appearance: none; }
</style>
